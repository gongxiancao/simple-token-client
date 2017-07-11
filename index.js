'use strict';
var request = require('request');

function SimpleTokenClient (config) {
  this.config = config;
  this.accessToken = null;
  this.tokenExiresAt = null;
  this.lastError = null;
  this.lastErrorValidBefore = null;
  this.pendingRequests = [];
}

SimpleTokenClient.prototype._requestToken = function (done) {
  var requestBody = this.config.createRequestBody ? this.config.createRequestBody() : {
    clientKey: this.config.clientKey,
    clientSecret: this.config.clientSecret
  };

  var opts = {
    url: this.config.tokenEndpoint,
    method: 'POST',
    proxy: false,
    json: requestBody,
    followRedirect: false
  };

  request(opts, function (err, res, body) {
    if(err) {
      return done(err);
    }

    if(res.statusCode !== 200) {
      return done(new Error('reponse status is ' + res.statusCode + ', body=' + JSON.stringify(body)));
    }
    done(null, body);
  });
};

SimpleTokenClient.prototype._requestTokenWithRetry = function (done) {
  var self = this;
  var tries = 5;

  function handler (err, result) {
    if(err) {
      if(--tries > 0) {
        return setTimeout(function () {
          self._requestToken(handler);
        }, 500);
      }
      return done(err);
    }

    done(null, result);
  }
  self._requestToken(handler);
};

SimpleTokenClient.prototype.requestToken = function (done) {
  var self = this;
  if(self.lastErrorValidBefore && self.lastErrorValidBefore > new Date()) {
    return done(self.lastError);
  }

  if(!self.pendingRequests.length) { // the first renew, do it
    self._requestTokenWithRetry(function (err, result) {
      if(err) {
        self.lastError = err;
        self.lastErrorValidBefore = new Date(new Date().getTime() + (self.config.retryIntervalAfterFailure || 60) * 1000);
      } else {
        self.accessToken = result.accessToken;
        self.tokenExiresAt = new Date(new Date().getTime() + result.expiresIn * 1000 - 120 * 1000);
      }

      self.pendingRequests.forEach(function (done) {
        process.nextTick(done.bind(self, err, self.accessToken));
      });
      self.pendingRequests.length = 0;
    });
  }
  self.pendingRequests.push(done);
};

SimpleTokenClient.prototype.getToken = function (done) {
  if(!this.tokenExiresAt || new Date() > this.tokenExiresAt) {
    return this.requestToken(done);
  }
  done(null, this.accessToken);
};


module.exports = SimpleTokenClient;
