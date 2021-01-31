/**
 * 배치메인
 * - 1.매물정보 수집
 * - 2.통계(미구현)
 */

require('../util/initialize.js');
const util = require('../util/index.js');
const db = require('../db/batch_hist.js');
const article = require('./article.js');
const aptInfo = require('../info/apt.js');
const schedule = require('node-schedule');

// 전역 정보
// const cityNo = '4148000000'; // 파주시
let paramYmd = process.argv[2];
let tradeTypes = process.argv[3] ? process.argv[3].split(',') : ['A1', 'B1', 'B2'];
let articleJob = null;

const startBatch = async (ymd) => {
  // 배치 시작
  const result = await db.getBatchHist(ymd, 'ARTICLE');
  if (result.length === 0) {
    await db.saveBatchHist(ymd, 'ARTICLE');
    /* 
    파주시 전체
    await article.saveAptArticleHist({ ymd, tradeTypes, cityNo });  
    */
    await article.saveAptArticleHist({ ymd, tradeTypes, complexNos: aptInfo.getApts() });
    article.saveArticles(ymd);
    // 10분간격 재실행
    articleJob = schedule.scheduleJob('0 0/10 * * * ?', () => {
      run(ymd);
    });
  }
};

// 미실행 반복
const run = async (ymd) => {
  const result = await db.getBatchHist(ymd, 'ARTICLE');
  if (result.length > 0) {
    const status = result[0].status;
    const errorCnt = result[0].errorCnt;
    if (status === 'DONE') {
      articleJob.cancel();
    } else if (status === 'ERROR') {
      if (errorCnt > 5) {
        articleJob.cancel();
        return;
      }
      // 배치 재시작
      db.updateBatchHist({ ymd, batchType: 'ARTICLE', status: 'START', now: '' });
      article.saveArticles(ymd);
    }
  }
};

const ymd = ''; // 수동실행
if (paramYmd) {
  run(paramYmd); // 에러이후부터 재실행
} else {
  if (ymd) {
    startBatch(ymd);
  } else {
    // 매일 자정 1분에 시작
    console.log(`Start Batch: ${util.getToday()}`);
    const job = schedule.scheduleJob('0 1 0 * * ?', () => {
      startBatch(util.getToday());
    });
  }
}
