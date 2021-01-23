const request = require('request');

module.exports = {
  get(uri, params = {}) {
    return new Promise((resolve, reject) => {
      request(
        {
          uri,
          qs: params,
        },
        function (err, response, body) {
          if (err) {
            reject(err);
          }
          // console.log(body);
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            console.error('[URI]', uri);
            console.error(
              '------------------------------------------------------------------------------',
            );
            console.error('[Params]', params);
            console.error(
              '------------------------------------------------------------------------------',
            );
            console.error('[Body]', body);
            reject(e);
          }
        },
      );
    });
  },
};
