var r = require('hyperquest')
var jsonstream = require('JSONStream')
var through = require('through2')
var log = require('debug')('cypherquery:info')
var error = require('debug')('cypherquery:error')
var lodashTemplate = require('lodash.template')
var Joi = require('joi')

module.exports = createQuery

function createQuery (url) {
  url += '/db/data/transaction/commit'
  return query
  function query (statement, parameters, resultType) {
    var schema
    var payload
    var opt = {}
    var s = through.obj()

    if (typeof statement === 'object') {
      opt = statement
      parameters = opt.parameters || opt.params
      resultType = opt.resultType
      schema = opt.validation ? opt.validation.schema : undefined
      payload = opt.validation ? opt.validation.payload : opt.payload
      statement = opt.query || opt.template
    }

    resultType = resultType || ['row', 'graph']

    if (opt.template) {
      try {
        statement = lodashTemplate(statement)(parameters)
      } catch (e) {
        s.emit('error', new Error('Template parse failed: ' + e.message))
      }
    }

    if (schema && payload) {
      Joi.validate(payload, schema, function (err, value) {
        if (err) {
          s.emit('error', 'Validation error: ' + err.message)
        } else {
          stream()
        }
      })
    } else {
      stream()
    }

    function stream () {
      var query = execute(url, statement, parameters, resultType)
      query.on('error', s.emit.bind(s, 'error'))
      query.pipe(s)
    }
    return s
  }

  function execute (url, statement, parameters, resultType) {
    var opt = {
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'x-stream': true
      }
    }

    var payload = JSON.stringify({
      statements: [{
        statement: statement,
        resultDataContents: resultType,
        parameters: parameters
      }]
    })

    log('query %j', payload)

    var post = r.post(url, opt)
    var parse = jsonstream.parse()
    var handleReponse = through.obj(response)
    handleReponse.on('error', parse.emit.bind(parse, 'error'))
    parse.pipe(handleReponse)
    post.pipe(parse)
    post.write(payload)
    post.end()
    return parse
  }

  function response (data, enc, cb) {
    if (data.errors.length) {
      error('error %j', data)
      cb(new Error(JSON.stringify(data.errors)))
    } else {
      log('response %j', data)
      cb(null, data)
    }
  }
}
