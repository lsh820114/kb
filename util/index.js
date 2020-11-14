const moment = require('moment');
module.exports = {
  addComma(number) {
    return number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  },
  hasStr(excludeStr = [], text = '') {
    return excludeStr.some((item) => {
      return text.indexOf(item) > -1;
    });
  },
  getToday() {
    return moment().format('YYYYMMDD');
  },
  mathFloor(num = 0) {
    return Math.floor(num / 100) * 100;
  },
  sleep(time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  },
};
