'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const mongoose = require('mongoose')
mongoose.Promomise = global.Promise
const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire').noCallThru()
const httpMocks = require('node-mocks-http')
const School = require('../../models/school')
const fileValidator = require('../../lib/validator/file-validator')
const pupilUploadService = require('../../services/pupil-upload.service')
const ValidationError = require('../../lib/validation-error')
const azureFileDataService = require('../../services/data-access/azure-file.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')
const schoolMock = require('../mocks/school')
const pupilAddService = require('../../services/pupil-add-service')
const pupilMock = require('../mocks/pupil')

describe('pupil controller:', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991999 }
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('getAddPupil() route', () => {
    let controller
    let sandbox
    let next
    let schoolDataServiceSpy
    let goodReqParams = {
      method: 'GET',
      url: '/school/pupil/add',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        schoolDataServiceSpy = sandbox.stub(schoolDataService, 'findOne').resolves(schoolMock)
        controller = proxyquire('../../controllers/pupil.js', {
          '../services/data-access/school.data.service': schoolDataService
        }).getAddPupil
      })

      it('displays an add pupil page', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).not.toHaveBeenCalled()
        expect(schoolDataServiceSpy.callCount).toBe(1)
        done()
      })

      it('catches errors in the render() call', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render').and.throwError('test')
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        schoolDataServiceSpy = sandbox.stub(schoolDataService, 'findOne').resolves(null)
        controller = proxyquire('../../controllers/pupil.js', {
          '../services/data-access/school.data.service': schoolDataService
        }).getAddPupil
      })

      it('it throws an error', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        try {
          await controller(req, res, next)
          expect('this').toBe('thrown')
        } catch (error) {
          expect(error.message).toBe('School [9991999] not found')
        }
        expect(res.statusCode).toBe(200)
        done()
      })
    })
  })

  describe('#postAddPupil route', () => {
    let sandbox, controller, nextSpy, pupilAddServiceSpy, req, res
    let goodReqParams = {
      method: 'POST',
      url: '/school/pupil/add',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.createSandbox()
      res = getRes()
      req = getReq(goodReqParams)
      nextSpy = sandbox.spy()
    })

    afterEach(() => { sandbox.restore() })

    describe('the pupilData is saved', () => {
      beforeEach(() => {
        pupilAddServiceSpy = sandbox.stub(pupilAddService, 'addPupil').resolves(pupilMock)
        controller = proxyquire('../../controllers/pupil.js', {
          '../services/pupil-add-service': pupilAddService
        }).postAddPupil
      })

      it('calls pupilAddService to add a new pupil to the database', async (done) => {
        await controller(req, res, nextSpy)
        expect(pupilAddServiceSpy.callCount).toBe(1)
        done()
      })

      it('redirects to the pupil register page', async (done) => {
        await controller(req, res, nextSpy)
        expect(res.statusCode).toBe(302)
        done()
      })
    })

    describe('the pupilData is not saved', () => {
      beforeEach(() => {
        const validationError = new ValidationError()
        validationError.addError('upn', 'Mock error')
        pupilAddServiceSpy = sandbox.stub(pupilAddService, 'addPupil').throws(validationError)
        controller = proxyquire('../../controllers/pupil.js', {
          '../services/pupil-add-service': pupilAddService
        })
      })

      it('then it shows the page again', async (done) => {
        sandbox.stub(controller, 'getAddPupil').callsFake((req, res, next, error) => {
          res.end('mock doc')
          return Promise.resolve()
        })
        // console.log('controller', controller)
        await controller.postAddPupil(req, res, nextSpy)
        expect(controller.getAddPupil.called).toBeTruthy()
        expect(res.statusCode).toBe(200)
        done()
      })
    })
  })

  describe('getAddMultiplePupils() route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/school/pupil/add-batch-pupils',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
      controller = require('../../controllers/pupil.js').getAddMultiplePupils
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('displays an add multiple pupil page', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(next).not.toHaveBeenCalled()
      done()
    })

    it('catches errors in the render() call', async (done) => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render').and.throwError('test')
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(next).toHaveBeenCalled()
      done()
    })
  })

  describe('postAddMultiplePupils() route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'POST',
      url: '/school/pupil/add-batch-pupils',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      files: {
        csvTemplate: {
          name: 'name'
        }
      }
    }
    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('when the school is found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(new School({ name: 'Test School' }))
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School
        }).postAddMultiplePupils
      })

      it('saves the new pupil and redirects to the register pupils page', async (done) => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise
          .resolve({ pupils: [ { id: 1 }, { id: 2 } ], pupilIds: [ '1', '2' ] }))
        const res = getRes()
        const req = getReq(goodReqParams)
        req.flash = () => {
        }
        await controller(req, res, next)
        expect(res.statusCode).toBe(302)
        done()
      })

      it('redirects to the add multiple pupils page when file errors have been found', async (done) => {
        const validationError = new ValidationError()
        validationError.addError('test-field', 'test error message')
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(validationError))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.fileErrors.get('test-field')).toBe('test error message')
        expect(res.locals).toBeDefined()
        expect(res.locals.pageTitle).toBe('Add multiple pupils')
        done()
      })

      it('calls next for any thrown errors within pupilUpload service', async (done) => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise.reject(new Error('error')))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        done()
      })

      it('calls next for any error that is returned from pupilUpload service', async (done) => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise
          .resolve({ error: 'error' }))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalledWith('error')
        done()
      })

      it('redirects to the add multiple pupils page when csv validation returns errors', async (done) => {
        spyOn(fileValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
        spyOn(pupilUploadService, 'upload').and.returnValue(Promise.resolve({
          csvErrorFile: 'test.csv',
          hasValidationError: true
        }))
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(req.session.csvErrorFile).toBe('test.csv')
        expect(res.locals).toBeDefined()
        expect(res.locals.pageTitle).toBe('Add multiple pupils')
        done()
      })
    })

    describe('when the school is not found in the database', () => {
      beforeEach(() => {
        sandbox.mock(School).expects('findOne').chain('exec').resolves(null)
        controller = proxyquire('../../controllers/pupil.js', {
          '../models/school': School
        }).postAddMultiplePupils
      })
      it('it throws an error', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        done()
      })
    })
  })

  describe('getAddMultiplePupilsCSVTemplate route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/pupil/download-multiple-template',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
      controller = require('../../controllers/pupil.js').getAddMultiplePupilsCSVTemplate
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('calls express response download', async (done) => {
      const res = getRes()
      res.download = () => {}
      spyOn(res, 'download').and.returnValue(null)
      const req = getReq(goodReqParams)
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.download).toHaveBeenCalledWith('assets/csv/MTC-Pupil-details-template-Sheet-1.csv')
      done()
    })
  })

  describe('getErrorCSVFile route', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/pupil/download-error-csv',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      }
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
      controller = require('../../controllers/pupil.js').getErrorCSVFile
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('writes csv file to response and calls end to begin download', async (done) => {
      spyOn(azureFileDataService, 'azureDownloadFile').and.returnValue(Promise.resolve('text'))
      const res = getRes()
      res.write = () => {}
      res.end = () => {}
      spyOn(res, 'write').and.returnValue(null)
      spyOn(res, 'end').and.returnValue(null)
      const req = getReq(goodReqParams)
      await controller(req, res, next)
      expect(res.statusCode).toBe(200)
      expect(res.write).toHaveBeenCalledWith('text')
      expect(res.end).toHaveBeenCalled()
      done()
    })
  })
})