'use strict'

const uuid = require('uuid/v4')
const tedious = require('tedious')

module.exports = function (context, censusFile) {
  context.log('JavaScript blob trigger function processed blob \n Name:',
    context.bindingData.name, '\n Blob Size:', censusFile.length, 'Bytes')
  context.bindings.outputTable = []

  context.bindings.outputTable.push({
    PartitionKey: 'TestBlob',
    RowKey: uuid(),
    Name: context.bindingData.name
  })

  context.done()
}
