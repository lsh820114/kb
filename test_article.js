const util = require('./util/index.js');
const article = require('./batch/article.js');
const aptInfo = require('./info/apt.js');

// 전역 정보
// const cityNo = '4148000000'; // 파주시
const tradeTypes = ['A1', 'B1', 'B2'];

const run = async () => {
  const ymd = util.getToday();
  await article.saveAptArticleHist({ ymd, tradeTypes, complexNos: aptInfo.getApts() }); // 매물이력 등록
  article.saveArticles(ymd); // 매물저장
};
run();
