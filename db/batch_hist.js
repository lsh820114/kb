/**
 *
 * batch_hist DB
 *
 */

const pool = require('./pool.js');
const util = require('../util');

module.exports = {
  // 배치 이력 조회
  async getBatchHist(ymd, batchType) {
    const conn = await pool.getConnection();
    let sql = `SELECT ymd, status, start_dt, end_dt, error_cnt FROM batch_hist WHERE ymd = '${ymd}' AND batch_type = '${batchType}'`;
    const [rows] = await conn.query(sql);
    conn.release();
    return rows.map(util.toCamelCase);
  },
  // 배치 이력 저장
  async saveBatchHist(ymd, batchType, status = 'START') {
    const conn = await pool.getConnection();
    const sql = `INSERT INTO batch_hist (ymd, batch_type, status, start_dt) VALUES ('${ymd}', '${batchType}', '${status}', now())`;
    const [rows] = await conn.query(sql);
    conn.release();
    console.log(`[Save BatchHist] ${rows.info}`);
  },
  // 배치 이력 업데이트
  async updateBatchHist({ ymd, batchType, status, now, errorMsg }) {
    const conn = await pool.getConnection();
    let sql = `UPDATE batch_hist SET status = '${status}'`;
    if (status === 'START' && now === 'now') {
      sql += ',start_dt = now()';
    } else if (status !== 'START') {
      sql += ',end_dt = now()';
      if (status === 'ERROR') {
        sql += ',error_cnt = error_cnt + 1';
        sql += `,error_msg = '${errorMsg.replaceAll("'", "''")}'`;
      }
    }
    sql += ` WHERE ymd = '${ymd}' AND batch_type = '${batchType}'`;
    const [rows] = await conn.query(sql);
    conn.release();
    console.log(`[Update BatchHist] ${rows.info}`);
  },
};
