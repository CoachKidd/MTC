'use strict'
const moment = require('moment')
const checkDataService = require('../../../services/data-access/check.data.service')
const pupilRestartDataService = require('../../../services/data-access/pupil-restart.data.service')
const pupilStatusService = require('../../../services/pupil.status.service')
const pinValidator = require('../../../lib/validator/pin-validator')
const pupilStatusCodesMock = require('../mocks/pupil-status-codes')
const checkMock = require('../mocks/check')
const pupilMock = require('../mocks/pupil')
const checkStartedMock = require('../mocks/check-started')
const pupilRestartMock = require('../mocks/pupil-restart')
const startedCheckMock = require('../mocks/check-started')
const completedCheckMock = require('../mocks/completed-check')
const pupilStatusCodeDataService = require('../../../services/data-access/pupil-status-code.data.service')
const pupilAttendanceDataService = require('../../../services/data-access/pupil-attendance.data.service')

/* global describe, it, expect, spyOn */
describe('pupil status service', () => {
  describe('getStatus', () => {
    it('returns not taking the Check if the pupil has got an attendance code', async () => {
      const pupil = Object.assign({}, pupilMock)
      const pupilAttendanceMock = {
        id: 'id',
        createdAt: moment.utc(),
        updatedAt: moment.utc(),
        recordedByUser_id: 1,
        attendanceCode_id: 1,
        pupil_id: 10
      }
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue(pupilAttendanceMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Not taking the Check')
    })
    it('returns restart if pupil has an active restart and total started checks are equal to restarts', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(1)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(1)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Restart')
    })
    it('returns not started when pupil does not have an active pin and no check record', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(0)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(null)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      spyOn(checkDataService, 'sqlFindLastCheckByPupilId').and.returnValue([])
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Not started')
    })
    it('returns pin generated when pupil has an active pin and no check record', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(0)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(null)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      spyOn(checkDataService, 'sqlFindLastCheckByPupilId').and.returnValue(null)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('PIN generated')
    })
    it('returns in progress when pupil has active pin but a check record with no check started timestamp', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(0)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(null)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      spyOn(checkDataService, 'sqlFindLastCheckByPupilId').and.returnValue(checkMock)
      spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').and.returnValue([])
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('In Progress')
    })
    it('returns check started when pupil does not have an active pin and a completed check record but a started check', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(1)
      spyOn(checkDataService, 'sqlFindLastCheckByPupilId').and.returnValue(checkMock)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(null)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').and.returnValue(checkStartedMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Check started')
    })
    it('returns completed when a completed check that corresponds to the check code is found', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(1)
      spyOn(checkDataService, 'sqlFindLastCheckByPupilId').and.returnValue(checkMock)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(null)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(0)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').and.returnValue(completedCheckMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Completed')
    })
    it('returns pin generated when new pin is generated after a restart', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(1)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(1)
      spyOn(checkDataService, 'sqlFindLastCheckByPupilId').and.returnValue(checkMock)
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('PIN generated')
    })
    it('returns in progress when pupil logs-in after a restart', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(1)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(1)
      spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').and.returnValue(startedCheckMock)
      spyOn(pinValidator, 'isActivePin').and.returnValue(true)
      const newCheckMock = Object.assign({}, checkMock)
      newCheckMock.pupilLoginDate = moment.utc()
      spyOn(checkDataService, 'sqlFindLastCheckByPupilId').and.returnValue(newCheckMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('In Progress')
    })
    it('returns check started when pupil starts the check after a restart', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(2)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(1)
      spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').and.returnValue(startedCheckMock)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      const newCheckMock = Object.assign({}, checkStartedMock)
      newCheckMock.pupilLoginDate = moment.utc()
      spyOn(checkDataService, 'sqlFindLastCheckByPupilId').and.returnValue(startedCheckMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Check started')
    })
    it('returns completed when pupil completes the check after a restart', async () => {
      const pupil = Object.assign({}, pupilMock)
      spyOn(pupilStatusCodeDataService, 'sqlFindStatusCodes').and.returnValue(pupilStatusCodesMock)
      spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue({})
      spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(2)
      spyOn(pupilRestartDataService, 'sqlFindLatestRestart').and.returnValue(pupilRestartMock)
      spyOn(pupilRestartDataService, 'sqlGetNumberOfRestartsByPupil').and.returnValue(1)
      spyOn(checkDataService, 'sqlFindLastStartedCheckByPupilId').and.returnValue(completedCheckMock)
      spyOn(pinValidator, 'isActivePin').and.returnValue(false)
      const newCheckMock = Object.assign({}, completedCheckMock)
      newCheckMock.pupilLoginDate = moment.utc()
      spyOn(checkDataService, 'sqlFindLastCheckByPupilId').and.returnValue(newCheckMock)
      const result = await pupilStatusService.getStatus(pupil)
      expect(result).toBe('Completed')
    })
  })
})