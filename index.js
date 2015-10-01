var r = require('hyperquest')
var jsonstream = require('JSONStream')
var through = require('through2')
var log = require('debug')('cypherquery:info')
var error = require('debug')('cypherquery:error')

module.exports = createQuery

function createQuery (url) {
  url += '/db/data/transaction/commit'
  return query
  function query (statement, parameters) {
    var opt = {
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'x-stream': true
      }
    }

    var payload = JSON.stringify({ statements: [{ statement: statement, parameters: parameters }] })
    log('query', payload)

    var post = r.post(url, opt)
    var parse = jsonstream.parse()
    parse.pipe(through.obj(response))
    post.pipe(parse)
    post.write(payload)
    post.end()
    return parse
  }
}

function response (data, enc, cb) {
  if (data.errors.length) {
    error(data)
  } else {
    log(data)
  }
  cb(null, data)
}
