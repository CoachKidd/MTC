const path = require('path')
const fs = require('fs-extra')
const CheckForm = require('../models/check-form')
const checkFormService = require('../services/check-form.service')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkWindowService = require('../services/check-window.service')
const sortingAttributesService = require('../services/sorting-attributes.service')

/**
 * Display landing page for 'test developer' role.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getTestDeveloperHome = async (req, res, next) => {
  res.locals.pageTitle = 'MTC for test development'
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/test-developer-home', {
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Display initial 'upload and view' check forms page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const uploadAndViewForms = async (req, res, next) => {
  res.locals.pageTitle = 'Upload and view forms'
  req.breadcrumbs(res.locals.pageTitle)

  try {
    let formData

    // Sorting
    const sortingOptions = [{ 'key': 'name', 'value': 'asc' }]
    const sortField = 'name'
    const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
    const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)

    formData = await checkFormService.formatCheckFormsAndWindows(sortField, sortDirection)

    return res.render('test-developer/upload-and-view-forms', {
      forms: formData,
      htmlSortDirection,
      arrowSortDirection,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Remove check form.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const removeCheckForm = async (req, res, next) => {
  const id = req.params.formId
  try {
    const CheckWindow = await checkFormDataService.getActiveForm(id)
    if (!CheckWindow) {
      return next(new Error(`Unable to find form.id [${id}]`))
    }

    // Un-assign check-form from any check-windows
    const CheckWindowsByForm = await checkWindowService.getCheckWindowsAssignedToForms()
    await checkFormService.unassignedCheckFormsFromCheckWindows(CheckWindow, CheckWindowsByForm)
    await checkWindowService.markAsDeleted(CheckWindow)
  } catch (error) {
    return next(error)
  }

  res.redirect('/test-developer/upload-and-view-forms')
}

/**
 * Upload check form view.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const uploadCheckForm = async (req, res, next) => {
  req.breadcrumbs('Upload and view forms', '/test-developer/upload-and-view-forms')
  res.locals.pageTitle = 'Upload new form'
  let error

  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/upload-new-form', {
      error,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Save check form (POST).
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const saveCheckForm = async (req, res, next) => {
  res.locals.pageTitle = 'Upload check form'
  req.breadcrumbs(res.locals.pageTitle)

  let uploadError = {}
  let uploadFile = req.files.csvFile
  let checkForm = new CheckForm()
  let absFile
  let deleteDir

  // Various errors cause a page to be rendered instead, and it *needs* a title
  if (!uploadFile) {
    // Either it actually wasn't uploaded, or it failed one the busboy checks: e.g.
    // * mime-type needs to be text/csv (.csv)
    // * uploaded from the wrong path
    // * file size exceeded?
    uploadError.message = 'A valid CSV file was not uploaded'
    uploadError.errors = {}
    uploadError.errors['csvFile'] = new Error(uploadError.message)

    return res.render('test-developer/upload-new-form', {
      error: uploadError,
      breadcrumbs: req.breadcrumbs()
    })
  }

  /**
   * uploadfile is an object:
   *
   { uuid: 'ff6c17d9-84d0-4a9b-a3c4-3f94a6ccdc40',
     field: 'uploadFile',
     file: 'data/files/ff6c17d9-84d0-4a9b-a3c4-3f94a6ccdc40/uploadFile/form-1.csv',
     filename: 'form-1.csv',
     encoding: '7bit',
     mimetype: 'text/csv',
     truncated: false,
     done: true } }
   */

  absFile = path.join(__dirname, '/../', uploadFile.file)
  deleteDir = path.dirname(path.dirname(absFile))

  try {
    await checkFormService.populateFromFile(checkForm, absFile)
  } catch (error) {
    // Remove the uploaded file
    fs.remove(deleteDir, err => {
      if (err) console.error(err)
    })
    return res.render('test-developer/upload-new-form', {
      error: new Error('There is a problem with the form content'),
      breadcrumbs: req.breadcrumbs()
    })
  }

  fs.remove(deleteDir, err => {
    if (err) console.error(err)
  })

  try {
    await checkForm.validate()
  } catch (error) {
    return res.render('test-developer/upload-and-view-forms', {
      error: new Error('There is a problem with the form content'),
      breadcrumbs: req.breadcrumbs()
    })
  }

  try {
    await checkForm.save()
    req.flash('info', `File ${uploadFile.filename} (${checkForm.name}) was uploaded`)
    req.flash('formName', checkForm.name)
  } catch (error) {
    return next(error)
  }

  res.redirect('/test-developer/upload-and-view-forms')
}

/* @TODO: The code below will be refactored in the next PR as part of PBI 17604 */
const displayCheckForm = async (req, res, next) => {
  req.breadcrumbs('Upload and view forms', '/test-developer/upload-and-view-forms')
  res.locals.pageTitle = 'View form'
  let canDelete = true
  let formData

  try {
    formData = await checkFormDataService.getActiveFormPlain(req.params.formId)
    formData.checkWindows = []
    const checkWindows = await checkWindowService.getCheckWindowsAssignedToForms()

    if (checkWindows[formData.id]) {
      // Form is assigned to one or more check windows
      formData.checkWindows = checkWindows[formData.id].map(cw => { return cw.toJSON() })
      formData.checkWindows.forEach(cw => {
        if (cw.startDate <= Date.now()) {
          // we can't delete a form whose check window has started.
          canDelete = false
        }
      })
    } else {
      formData.checkWindows = []
    }

    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/view-check-form', {
      form: formData,
      canDelete: canDelete,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTestDeveloperHome,
  uploadAndViewForms,
  removeCheckForm,
  uploadCheckForm,
  saveCheckForm,
  displayCheckForm
}