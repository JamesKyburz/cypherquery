# cypherquery

streaming rest api for neo4j

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

main.js:

```javascript
var query = `
  match(person:person {name: {name}})
  optional match(person)<-[:likes]->(beer:beer {})
  optional match(beer)<-[r:award]->(award:award {})
`

var parameters = {
  name: 'Peter'
}

var dbQuery = require('cypherquery')
dbQuery(query, parameters).pipe...
```

# install

With [npm](https://npmjs.org) do:

```
npm install cypherquery
```

# license

MIT
