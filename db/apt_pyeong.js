/**
 *
 * apt_pyeong DB
 *
 */

const pool = require('./pool.js');
const util = require('../util');

module.exports = {
  // 아파트별 평형 조회
  async getAptPyeong(item) {
    const conn = await pool.getConnection();
    let sql = `SELECT * FROM apt_pyeong WHERE complex_no IN (?) ORDER BY complex_no, pyeong_name`;
    const [rows] = await conn.query(sql, [item.complexNos]);
    conn.release();
    return rows.map(util.toCamelCase);
  },
  // 평 조회
  async getPyeong(complexNo = '') {
    const conn = await pool.getConnection();
    let sql = `SELECT 
      a.*, 
      (SELECT complex_name FROM apt WHERE complex_no = a.complex_no) AS complex_name,
      TRUNCATE(a.supply_pyeong ,0) AS py
    FROM pyeong a WHERE a.complex_no = ? ORDER BY a.pyeong_no`;
    const [rows] = await conn.query(sql, [complexNo]);
    conn.release();
    return rows.map(util.toCamelCase);
  },
  // 아파트 평형별 저장
  async saveAptPyeong(items) {
    const conn = await pool.getConnection();
    const sql = `REPLACE INTO apt_pyeong (
        complex_no,
        pyeong_name,
        complex_name,
        real_estate_type_code,
        cortar_no,
        area_nos
      ) VALUES ?`;
    const [rows] = await conn.query(sql, [
      items.map((item) => [
        item.complexNo,
        item.pyeongName,
        item.complexName,
        item.realEstateTypeCode,
        item.cortarNo,
        item.areaNos,
      ]),
    ]);
    conn.release();
    console.log(`[Insert AptPyeong] ${rows.info}`);
  },
};
