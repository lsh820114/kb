/**
 *
 * regions DB
 *
 */

const pool = require('./pool.js');
const util = require('../util');

module.exports = {
  // 지역 조회
  async getRegions(cortarType = 'city') {
    const conn = await pool.getConnection();
    const sql = 'SELECT * FROM regions WHERE cortar_type = ? ORDER BY cortar_no';
    const [rows] = await conn.query(sql, [cortarType]);
    conn.release();
    return rows.map(util.toCamelCase);
  },
  // 지역 저장
  async saveRegions(items) {
    const conn = await pool.getConnection();
    const sql =
      'INSERT IGNORE INTO regions (cortar_no, cortar_name, cortar_type, center_lat, center_lon) VALUES ?';
    const [rows] = await conn.query(sql, [
      items.map((item) => [
        item.cortarNo,
        item.cortarName,
        item.cortarType,
        item.centerLat,
        item.centerLon,
      ]),
    ]);
    conn.release();
    console.log(`[Insert Regions] ${rows.info}`);
  },
};
