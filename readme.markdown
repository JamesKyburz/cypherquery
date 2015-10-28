# cypherquery

streaming rest api for neo4j

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

main.js:

```javascript
var cypherQuery = require('cypherquery')('user:password@your-neo4j-server:port')

var query = `
  match(person:person {name: {name}})
  optional match(person)<-[:likes]->(beer:beer {})
  optional match(beer)<-[r:award]->(award:award {})
`

var parameters = {
  name: 'Peter'
}

cypherQuery(query, parameters).pipe()...
```

Additional template support
```javascript
cypherquery({
  template: "Your lodash template",
  parameters: params,
}).pipe()...
```

Additional Joi schema validation support
```javascript
cypherquery({
  query: "match(n {id: {id}}) return n",
  parameters: params,
  validation: {
    schema: YourJoiSchema,
    payload: payload
  }
}).pipe()...
```

# install

With [npm](https://npmjs.org) do:

```
npm install cypherquery
```

# license

MIT
