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
          //console.log(body);
          resolve(JSON.parse(body));
        },
      );
    });
  },
};
