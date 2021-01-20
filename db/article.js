/**
 *
 * article DB
 *
 */

const pool = require('./pool.js');
const util = require('../util');

module.exports = {
  async getArticles(item) {
    const conn = await pool.getConnection();
    const sql = `SELECT * FROM article
        WHERE
              ymd = '${item.ymd}'
          AND trade_type = '${item.tradeType}'
          AND complex_no = '${item.complexNo}'
          AND pyeong_name = '${item.pyeongName}'`;
    const [rows] = await conn.query(sql);
    conn.release();
    return rows.map(util.toCamelCase);
  },
  // 업데이트할 매물이력 조회
  async getAptArticleHist(ymd = '', searchType = '') {
    const conn = await pool.getConnection();
    let searchSql = `a.update_yn = 'N'`;
    if (searchType === 'STATS') {
      searchSql = `a.update_yn = 'Y' AND a.stats_update_yn = 'N'`;
    }
    const sql = `SELECT a.*,
    (SELECT area_nos FROM apt_pyeong WHERE complex_no = a.complex_no AND pyeong_name = a.pyeong_name) AS area_nos
    FROM apt_article_hist a WHERE a.ymd = '${ymd}' AND ${searchSql} ORDER BY a.complex_no`;
    let [rows] = await conn.query(sql);
    conn.release();
    return rows.map(util.toCamelCase);
  },
  // 매물 정보 저장
  async saveArticles(items) {
    const conn = await pool.getConnection();
    const sql = `REPLACE INTO article (
        ymd,
        article_no,
        article_name,
        trade_type,
        complex_no,
        pyeong_name,
        pyeong_no,
        cortar_no,
        price_state,
        deal_price,
        warrant_price,
        rent_price,
        all_warrant_price,
        all_rent_price,
        same_addr_cnt,
        dong,
        ho,
        total_floor,
        floor,
        article_desc,
        move_code,
        move_month,
        move_after_ym,
        filter_type,
        confirm_ymd
      ) VALUES ?`;
    const [rows] = await conn.query(sql, [
      items.map((item) => [
        item.ymd,
        item.articleNo,
        item.articleName,
        item.tradeType,
        item.complexNo,
        item.pyeongName,
        item.pyeongNo,
        item.cortarNo,
        item.priceState,
        item.dealPrice,
        item.warrantPrice,
        item.rentPrice,
        item.allWarrantPrice,
        item.allRentPrice,
        item.sameAddrCnt,
        item.dong,
        item.ho,
        item.totalFloor,
        item.floor,
        item.articleDesc,
        item.moveCode,
        item.moveMonth,
        item.moveAfterYM,
        item.filterType,
        item.confirmYmd,
      ]),
    ]);
    conn.release();
    console.log(`[Insert Articles: ${items[0].tradeType}] ${rows.info}`);
  },
  // 아파트 평형별 매물수집 이력 저장
  async saveAptArticleHist(items) {
    const conn = await pool.getConnection();
    const sql = `REPLACE INTO apt_article_hist (
        ymd,
        trade_type,
        complex_no,
        pyeong_name,
        update_yn,
        stats_update_yn
      ) VALUES ?`;
    const [rows] = await conn.query(sql, [
      items.map((item) => [
        item.ymd,
        item.tradeType,
        item.complexNo,
        item.pyeongName,
        item.updateYn,
        item.statsUpdateYn,
      ]),
    ]);
    conn.release();
    console.log(`[Insert AptArticleHist] ${rows.info}`);
  },
  // 아파트 평형별 매물수집 이력 업데이트
  async updateAptArticleHist(item, colName = 'update_yn') {
    const conn = await pool.getConnection();
    const sql = `UPDATE apt_article_hist 
      SET ${colName} = 'Y'
      WHERE
            ymd = '${item.ymd}'
        AND trade_type = '${item.tradeType}'
        AND complex_no = '${item.complexNo}'
        AND pyeong_name = '${item.pyeongName}'`;
    const [rows] = await conn.query(sql);
    conn.release();
    console.log(`[Update AptArticleHist] ${rows.info}`);
  },
};
