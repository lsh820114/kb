const util = require('../util/index.js');
const article = require('./article.js');

const run = async () => {
  // const ymd = '20201229';
  const ymd = util.getToday();
  await article.saveAptArticleHist(ymd, tradeTypes, cityNo); // 매물이력 등록
  article.saveArticles(ymd); // 매물저장
};
run();
