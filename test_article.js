const util = require('./util/index.js');
const article = require('./batch/article.js');

// 전역 정보
const cityNo = '4148000000'; // 파주시
const tradeTypes = ['A1', 'B1', 'B2'];

const run = async () => {
  const ymd = '20210124';
  // const ymd = util.getToday();
  await article.saveAptArticleHist(ymd, tradeTypes, cityNo); // 매물이력 등록
  article.saveArticles(ymd); // 매물저장
};
run();
