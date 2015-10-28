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
  function query (statement, parameters) {
    var schema
    var payload
    var opt = {}
    var s = through.obj()

    if (typeof statement === 'object') {
      opt = statement
      parameters = opt.parameters || opt.params
      schema = (opt.validation) ? opt.validation.schema : undefined
      payload = opt.payload
      statement = opt.query || opt.template
    }

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
          execute(url, statement, parameters).pipe(s)
        }
      })
    } else {
      execute(url, statement, parameters).pipe(s)
    }
    return s
  }

  function execute (url, statement, parameters) {
    var opt = {
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'x-stream': true
      }
    }

    var payload = JSON.stringify({ statements: [{ statement: statement, parameters: parameters }] })
    log('query %j', payload)

    var post = r.post(url, opt)
    var parse = jsonstream.parse()
    parse.pipe(through.obj(response))
    post.pipe(parse)
    post.write(payload)
    post.end()
    return parse
  }

  function response (data, enc, cb) {
    if (data.errors.length) {
      error('error %j', data)
    } else {
      log('response %j', data)
    }
    cb(null, data)
  }
}
