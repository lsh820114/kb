const _ = require('lodash');
const moment = require('moment');

module.exports = {
  toCamelCase(obj) {
    return _.mapKeys(obj, (v, k) => _.camelCase(k));
  },
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
  // 월세 > 전세 전환
  rentToWarrant(warrantPrice = 0, rentPrice = 0, rate = 0) {
    let result = parseInt(warrantPrice) + (rentPrice * 12 * 100) / rate;
    if (result < 0) {
      result = 0;
    }
    return Number(result.toFixed());
  },
  // 매물 필터링
  isExcludeArticle(article = null) {
    if (!article) {
      return true;
    }
    const excludeStr = ['전세', '월세', '세안고', '세끼고']; // 매물 포함 제외 문자
    const excludeFloor = ['저', '중', '고']; // 층수 미표시는 제외함
    const maxMonth = 3; // 최대 개월수
    if (article.articleDesc) {
      if (
        this.hasStr(excludeStr, article.articleDesc) ||
        this.hasStr(excludeFloor, article.floor)
      ) {
        return true;
      }
    }

    if (article.moveCode === 'MV001') {
      return false;
    }
    // n개월이내
    else if (article.moveCode === 'MV002') {
      if (article.moveMonth < maxMonth + 1) {
        return false;
      }
    }
    // 협의가능
    else if (article.moveCode === 'MV003') {
      const toDate = moment(article.moveAfterYM).endOf('month').format('YYYYMMDD');
      if (toDate.length !== 8) {
        return true;
      }
      const maxDate = moment(article.ymd).add(maxMonth, 'M').format('YYYYMMDD');
      const result = moment(toDate).isBefore(maxDate);
      return !result;
    }
    return true;
  },
};
