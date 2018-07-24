'use strict'
const sqlService = require('./sql.service')
const accessArrangementsDataService = {}

/**
 * Find restart reasons
 * @return {Promise.<void>}
 */
accessArrangementsDataService.sqlFindAccessArrangements = async function () {
  const sql = `
  SELECT 
    id, 
    code, 
    description
  FROM ${sqlService.adminSchema}.[accessArrangements]
  ORDER BY displayOrder ASC`
  return sqlService.query(sql)
}

module.exports = accessArrangementsDataService
