# simple-token-client
get token and re-new token when expired

# Usage

```
  var SimpleTokenClient = require('simple-token-client');
  var client = new SimpleTokenClient({
    tokenEndpoint: 'http://localhost:8080/api/v1/auth/access-token',
    clientKey: 'your client key',
    clientSecret: 'your client secret'
  });
  client.getToken(function (err, token) {
    console.log(token);
  });
```

Or customize request body:
```
  var SimpleTokenClient = require('simple-token-client');
  var client = new SimpleTokenClient({
    tokenEndpoint: 'http://localhost:8080/api/v1/auth/access-token',
    createRequestBody: function () {
      return {
        appKey: 'your app key',
        appSecret: 'your app secret'
      };
    }
  });
  client.getToken(function (err, token) {
    console.log(token);
  });
```