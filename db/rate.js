/**
 *
 * rate DB
 *
 */

const pool = require('./pool.js');
const util = require('../util');

module.exports = {
  // 전월세전환율
  async getRate(cortarNo = '') {
    const conn = await pool.getConnection();
    const sql = `SELECT rate FROM rate WHERE cortar_no = '${cortarNo}' AND real_estate_type_code = 'APT' ORDER BY ymd DESC`;
    let [rows] = await conn.query(sql);
    conn.release();
    return rows.map(util.toCamelCase);
  },
};
