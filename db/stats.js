/**
 *
 * rate DB
 *
 */

const pool = require('./pool.js');

module.exports = {
  async saveStats(items) {
    const conn = await pool.getConnection();
    const sql = `REPLACE INTO stats (
        ymd,
        trade_type,
        complex_no,
        pyeong_name,
        filter_type,
        article_count,
        min_price,
        max_price,
        avg,
        median,
        avg_low,
        avg_high,
        deviation,
        same_cnt,
        increase_cnt,
        decrease_cnt,
        rate,
        del_cnt,
        add_cnt,
        floor
      ) VALUES ?`;
    const [rows] = await conn.query(sql, [
      items.map((item) => [
        item.ymd,
        item.tradeType,
        item.complexNo,
        item.pyeongName,
        item.filterType,
        item.articleCount,
        item.minPrice,
        item.maxPrice,
        item.avg,
        item.median,
        item.avgLow,
        item.avgHigh,
        item.deviation,
        item.sameCnt,
        item.increaseCnt,
        item.decreaseCnt,
        item.rate,
        item.delCnt,
        item.addCnt,
        item.floor,
      ]),
    ]);
    conn.release();
    console.log(`[Save Stats] ${rows.info}`);
  },
};
