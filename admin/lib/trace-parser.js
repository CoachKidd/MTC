'use strict'

const stackTrace = require('stack-trace')
const winston = require('winston')

const parseTrace = () => {
  const trace = stackTrace.get()
  const output = []
  trace.forEach((callSite) => {
    const file = callSite.getFileName()
    const fn = callSite.getFunctionName()
    output.push(`${fn}:${file}`)
  })
  const list = output.join('\n')
  winston.debug(list)
  winston.debug('-----------------------------------------------------------------')
}

module.exports.trace = (req, res, next) => {
  parseTrace()
  next()
}
