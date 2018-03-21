/** @namespace */

const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const pupilDataService = require('./data-access/pupil.data.service')
const pupilsNotTakingCheckDataService = require('../services/data-access/pupils-not-taking-check.data.service')

const pupilsNotTakingCheckService = {}

  /**
   * Sort columns by reason asc/desc.
   * @param pupilsList
   * @param sortDirection
   * @returns {*}
   */
pupilsNotTakingCheckService.sortPupilsByReason = (pupilsList, sortDirection) => {
  let sortedPupilsList
  sortedPupilsList = pupilsList.sort((a, b) => {
    if (a.reason === 'N/A') {
      return 1
    } else if (b.reason === 'N/A') {
      return -1
    } else if (a.reason === b.reason) {
      return 0
    } else if (sortDirection === 'asc') {
      return a.reason < b.reason ? -1 : 1
    } else {
      return a.reason < b.reason ? 1 : -1
    }
  })
  return sortedPupilsList
}

pupilsNotTakingCheckService.pupils = async (schoolId, sortField, sortDirection) => {
  const pupils = await pupilDataService.sqlFindSortedPupilsWithAttendanceReasons(schoolId, sortField, sortDirection)
  pupilIdentificationFlag.addIdentificationFlags(pupils)
  return pupils
}

pupilsNotTakingCheckService.pupilsWithReasons = async (schoolId) => {
  const pupils = await pupilsNotTakingCheckDataService.sqlFindPupilsWithReasons(schoolId)
  pupilIdentificationFlag.addIdentificationFlags(pupils)
  return pupils
}

module.exports = pupilsNotTakingCheckService
