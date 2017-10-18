'use strict'
const CheckWindow = require('../models/check-window')

const checkWindowService = {

  /**
   * Get check window for the current time.
   * @returns {Promise.<*>}
   */
  getCurrentCheckWindow: async () => {
    const now = new Date()
    const checkWindow = await CheckWindow.findOne({startDate: {$lte: now}, endDate: {$gte: now}}).exec()
    return checkWindow
  }
}

module.exports = checkWindowService
