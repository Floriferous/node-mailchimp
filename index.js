'use strict';

var request = require('request'),
  Promise = require('bluebird'),
  _ = require('lodash');

Promise.config({
  // Enables all warnings except forgotten return statements.
  warnings: {
    wForgottenReturn: false,
  },
});

function Mailchimp(api_key) {
  var api_key_regex = /.+\-.+/;

  if (!api_key_regex.test(api_key)) {
    throw new Error('missing or invalid api key: ' + api_key);
  }

  this.__api_key = api_key;
  this.__base_url =
    'https://' + this.__api_key.split('-')[1] + '.api.mailchimp.com/3.0';
}

var formatPath = function(path, path_params) {
  if (!path) {
    path = '/';
  }

  if (path[0] != '/') {
    path = '/' + path;
  }

  if (!path_params) {
    return path;
  }

  if (_.isEmpty(path_params)) {
    return path;
  }

  path = _.reduce(
    path_params,
    function(_path, value, param) {
      return _path.replace('{' + param + '}', value);
    },
    path,
  );

  return path;
};

Mailchimp.prototype.get = function(options, query, done) {
  options = _.clone(options) || {};

  if (_.isString(options)) {
    options = {
      path: options,
    };
  }
  options.method = 'get';

  if (!done && _.isFunction(query)) {
    done = query;
    query = null;
  }

  if (query && options.query) {
    console.warn('query set on request options overwritten by argument query');
  }

  if (query) {
    options.query = query;
  }

  return this.request(options, done);
};

Mailchimp.prototype.post = function(options, body, done) {
  options = _.clone(options) || {};

  if (_.isString(options)) {
    options = {
      path: options,
    };
  }
  options.method = 'post';

  if (!done && _.isFunction(body)) {
    done = body;
    body = null;
  }

  if (body && options.body) {
    console.warn('body set on request options overwritten by argument body');
  }

  if (body) {
    options.body = body;
  }

  return this.request(options, done);
};

Mailchimp.prototype.patch = function(options, body, done) {
  options = _.clone(options) || {};

  if (_.isString(options)) {
    options = {
      path: options,
    };
  }
  options.method = 'patch';

  if (!done && _.isFunction(body)) {
    done = body;
    body = null;
  }

  if (body && options.body) {
    console.warn('body set on request options overwritten by argument body');
  }

  if (body) {
    options.body = body;
  }

  return this.request(options, done);
};

Mailchimp.prototype.put = function(options, body, done) {
  options = _.clone(options) || {};

  if (_.isString(options)) {
    options = {
      path: options,
    };
  }
  options.method = 'put';

  if (!done && _.isFunction(body)) {
    done = body;
    body = null;
  }

  if (body && options.body) {
    console.warn('body set on request options overwritten by argument body');
  }

  if (body) {
    options.body = body;
  }

  return this.request(options, done);
};

Mailchimp.prototype.delete = function(options, done) {
  options = options || {};
  options = _.clone(options);
  if (_.isString(options)) {
    options = {
      path: options,
    };
  }
  options.method = 'delete';
  return this.request(options, done);
};

Mailchimp.prototype.request = function(options, done) {
  var mailchimp = this;
  var promise = new Promise(function(resolve, reject) {
    if (!options) {
      reject(new Error('No request options given'));
      return;
    }

    var path = formatPath(options.path, options.path_params);
    var method = options.method || 'get';
    var body = options.body || {};
    var params = options.params;
    var query = options.query;

    //Parems used to refer to query parameters, because of the mailchimp documentation.
    if (params) {
      if (!query) {
        query = params;
      }
    }

    if (!path || !_.isString(path)) {
      reject(new Error('No path given'));
      return;
    }

    request(
      {
        method: method,
        url: mailchimp.__base_url + path,
        auth: {
          user: 'any',
          password: mailchimp.__api_key,
        },
        json: body,
        qs: query,
        headers: {
          'User-Agent':
            'mailchimp-api-v3 : https://github.com/thorning/node-mailchimp',
        },
      },
      function(err, response) {
        if (err) {
          reject(new Error(err));
          return;
        }

        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(Object.assign(new Error(response.body.detail), response.body));
          return;
        }

        var result = response.body || {};
        result.statusCode = response.statusCode;

        resolve(result);
      },
    );
  });

  //If a callback is used, resolve it and don't return the promise
  if (done) {
    promise
      .then(function(result) {
        done(null, result);
      })
      .catch(function(err) {
        done(err);
      });
    return null;
  }

  return promise;
};

module.exports = exports = Mailchimp;
