/**
 *
 * 배치용 DB(미사용)
 *
 */

const mysql = require('mysql2/promise');
const pool = require('../db/pool.js');
const util = require('../util');

module.exports = {
  // FIXME: 다중 업데이트 샘플
  async updateSample(items) {
    const conn = await pool.getConnection();
    let sqls = '';
    let sql = '';
    sql += 'UPDATE price SET ';
    sql += 'article_count = ?,';
    sql += ' min_price = ?,';
    sql += ' max_price = ?,';
    sql += ' avg = ?,';
    sql += ' median = ?,';
    sql += ' avg_low = ?,';
    sql += ' avg_high = ?,';
    sql += ' deviation = ?,';
    sql += ' update_yn = ?';
    sql += ' WHERE';
    sql += ' ymd = ?';
    sql += ' and trade_type = ?';
    sql += ' and complex_no = ?';
    sql += ' and pyeong_name = ?';
    sql += ' and filter_type = ?;';
    items.forEach((item) => {
      const params = [
        item.articleCount,
        item.minPrice,
        item.maxPrice,
        item.avg,
        item.median,
        item.avgLow,
        item.avgHigh,
        item.deviation,
        item.updateYn,
        item.ymd,
        item.tradeType,
        item.complexNo,
        item.pyeongName,
        item.filterType,
      ];
      sqls += mysql.format(sql, params);
    });
    const [rows] = await conn.query(sqls);
    conn.release();
    console.log(`[Update Price] ${rows.length}rows`);
  },
};
