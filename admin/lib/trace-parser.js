'use strict'

const stackTrace = require('stack-trace')

const parseTrace = (trace) => {
  const output = []
  trace.forEach((callSite) => {
    output.push(callSite.getFileName())
  })
  return output
}

module.exports.trace = (req, res, next) => {
  var trace = stackTrace.get()
  const callStack = parseTrace(trace)
  console.dir(callStack)
  next()
}
