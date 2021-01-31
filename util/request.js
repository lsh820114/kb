const request = require('request');

module.exports = {
  get(uri, params = {}) {
    return new Promise((resolve, reject) => {
      request(
        {
          headers: {
            'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36`,
          },
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
