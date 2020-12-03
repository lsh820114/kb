const mysql = require('mysql2/promise');
const pool = require('./db/pool.js');
const _ = require('lodash');
const util = require('./util');

const toCamelCase = (obj) => {
  return _.mapKeys(obj, (v, k) => _.camelCase(k));
};

const getArticles = async (params) => {
  const conn = await pool.getConnection();
  const sql = `SELECT * FROM article
        WHERE
              ymd = '${params.ymd}'
          AND trade_type = '${params.tradeType}'`;
  const [rows] = await conn.query(sql);
  conn.release();
  return rows.map(toCamelCase);
};
const updateArticle = async (ymd, articleNo, filterType = '') => {
  const conn = await pool.getConnection();
  let sql = `UPDATE ARTICLE SET FILTER_TYPE = '${filterType}' WHERE YMD = ${ymd} AND ARTICLE_NO = ${articleNo}`;
  const [rows] = await conn.query(sql);
  conn.release();
  console.log(`[UpdateArticle] ${rows.info}`);
};

const fix = async () => {
  //const ymd = '20201127';
  //const complexNo = '113942';
  //const pyeongName = '34';
  for (ymd of ['20201203']) {
    const params = { ymd, tradeType: 'A1' };
    const list = await getArticles(params);
    for (item of list) {
      let result = util.isExcludeArticle(item);
      let filterType = result ? '' : 'POSSIBLE';
      await updateArticle(ymd, item.articleNo, filterType);
    }
  }
  console.log('End!!!');
};

fix();
