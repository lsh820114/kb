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
    return new Date().toISOString().substring(0, 10);
  },
  mathFloor(num = 0) {
    return Math.floor(num / 100) * 100;
  },
};
