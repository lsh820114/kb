const mysql = require('mysql2/promise');
const pool = require('./db/pool.js');
const _ = require('lodash');
const util = require('./util');
const db = require('./batch/db.js');
const moment = require('moment');

const test = async () => {
  const params = {
    ymd: '20201204',
    tradeType: 'A1',
    complexNo: '113942',
    pyeongName: '34',
  };
  // 3. 매물 조회
  const articles = await db.getArticles(params);

  // 4. 하루전 매물 조회
  const beforeArticles = await db.getArticles({
    ymd: moment(params.ymd).add(-1, 'DAY').format('YYYYMMDD'),
    tradeType: params.tradeType,
    complexNo: params.complexNo,
    pyeongName: params.pyeongName,
  });
  let beforeList = [];
  let list = [];
  beforeArticles.forEach((item) => {
    if (item.filterType === 'POSSIBLE') {
      beforeList.push(item);
    }
  });
  articles.forEach((item) => {
    if (item.filterType === 'POSSIBLE') {
      list.push(item);
    }
  });
  console.log(beforeList.length, list.length);
};
test();
