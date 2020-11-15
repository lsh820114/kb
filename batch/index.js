/**
 *
 * 배치 메인
 *
 */

require('../util/initialize.js');
const util = require('../util/index.js');
const db = require('./db.js');
const article = require('./article.js');
const schedule = require('node-schedule');

// 전역 정보
const cityNo = '4148000000'; // 파주시
let paramYmd = process.argv[2];
let tradeTypes = process.argv[3] ? process.argv[3].split(',') : ['A1', 'B1', 'B2'];
let articleJob = null;

const startBatch = async (ymd) => {
  // 배치 시작
  const result = await db.getBatchHist(ymd);
  if (result.length === 0) {
    await db.saveBatchHist(ymd);
    await article.saveAptArticleHist(ymd, tradeTypes, cityNo);
    article.saveArticles(ymd);
    // 10분간격 재실행
    articleJob = schedule.scheduleJob('0 0/10 * * * ?', () => {
      run(ymd);
    });
  }
};

// 미실행 반복
const run = async (ymd) => {
  const result = await db.getBatchHist(ymd);
  if (result.length > 0) {
    const status = result[0].status;
    const errorCnt = result[0].error_cnt;
    if (status === 'DONE') {
      articleJob.cancel();
    } else if (status === 'ERROR') {
      if (errorCnt > 20) {
        articleJob.cancel();
        return;
      }
      // 배치 재시작
      db.updateBatchHist(ymd, 'START', '');
      article.saveArticles(ymd);
    }
  }
};

if (paramYmd) {
  run(paramYmd);
} else {
  // 매일 자정 1분에 시작
  console.log(`Start Batch: ${util.getToday()}`);
  const job = schedule.scheduleJob('0 1 0 * * ?', () => {
    startBatch(util.getToday());
  });
}

/*
const test = async () => {
  const ymd = util.getToday();
  //await article.saveAptArticleHist(ymd, tradeTypes, cityNo);
  article.saveArticles(ymd);
};
test();
*/
