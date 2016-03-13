# simple-token-client
get token and re-new token when expired

# Usage

```
  var SimpleTokenClient = require('simple-token-client');
  var client = new SimpleTokenClient({
    tokenEndpoint: 'http://localhost:11000/api/v1/auth/access-token',
    clientKey: '147DDFB6-5C02-4215-A35F-62D9249F87CF',
    clientSecret: '451DA6FE-036D-4955-A1BD-9BD3FEADD7D8'
  });
  client.getToken(function (err, token) {
    console.log(token);
  });
```