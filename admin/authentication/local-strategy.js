'use strict'

const bcrypt = require('bcryptjs')
const R = require('ramda')
const winston = require('winston')

const userDataService = require('../services/data-access/user.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const roleDataService = require('../services/data-access/role.data.service')
const adminLogonEventDataService = require('../services/data-access/admin-logon-event.data.service')

module.exports = async function (req, email, password, done) {
  let dfeNumber

  /**
   * Store the logon attempt
   */
  const logonEvent = {
    sessionId: req.session.id,
    body: JSON.stringify(R.omit(['password'], R.prop('body', req))),
    remoteIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    loginMethod: 'local'
  }

  try {
    // Local helpdesk or service-manager users can logon with with `helpdesk:1234567` to impersonate a teacher for
    // school with dfeNumber 1234567.
    // NOTE that this is not a generic implementation: you actually need to be called 'helpdesk' or 'service-manager'
    // rather than simply have the role.  This is fine - it's only for local-dev
    const matches = email.match(/^(helpdesk|service-manager):(\d{7})$/)
    if (matches) {
      email = matches[1]
      dfeNumber = matches[2]
    }

    const user = await userDataService.sqlFindOneByIdentifier(email)

    let schoolPromise, rolePromise
    if (dfeNumber) {
      // Login as a help desk or service-manager user impersonating a school user, so they get a TEACHER role
      schoolPromise = schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
      rolePromise = roleDataService.sqlFindOneByTitle('TEACHER')
    } else {
      // Normal login
      schoolPromise = schoolDataService.sqlFindOneById(R.prop('school_id', user))
      rolePromise = roleDataService.sqlFindOneById(R.prop('role_id', user))
    }

    const [school, role] = await Promise.all([schoolPromise, rolePromise])

    if (!user || !role || !school) {
      // Invalid user
      await saveInvalidLogonEvent(logonEvent, 'Invalid user')
      return done(null, false)
    }

    const isEqual = await bcryptCompare(password, user.passwordHash)

    if (!isEqual) {
      // Invalid password
      await saveInvalidLogonEvent(logonEvent, 'Invalid password')
      return done(null, false)
    }

    const sessionData = {
      EmailAddress: email,
      displayName: email,
      UserName: email,
      UserType: 'SchoolNom',
      School: school.dfeNumber,
      schoolId: school.id,
      role: role.title,
      logonAt: Date.now(),
      id: user.id
    }

    // Success - valid login
    logonEvent.user_id = user.id
    await saveValidLogonEvent(logonEvent, sessionData)
    return done(null, sessionData)
  } catch (error) {
    winston.warn(error)
    await saveInvalidLogonEvent(logonEvent, 'Server error: ' + error.message)
    done(error)
  }
}

function bcryptCompare (plaintext, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plaintext, hash, function (err, res) {
      if (err) return reject(err)
      resolve(res)
    })
  })
}

async function saveInvalidLogonEvent (logonEvent, message) {
  try {
    logonEvent.errorMsg = message
    logonEvent.isAuthenticated = false
    await adminLogonEventDataService.sqlCreate(logonEvent)
  } catch (error) {
    winston.warn('Failed to save invalid logon event: ' + error.message)
  }
}

async function saveValidLogonEvent (logonEvent, session) {
  try {
    logonEvent.isAuthenticated = true
    await adminLogonEventDataService.sqlCreate(logonEvent)
  } catch (error) {
    winston.warn('Failed to save valid logon event: ' + error.message)
  }
}
