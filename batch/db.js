/**
 *
 * 배치용 DB
 *
 */

const mysql = require('mysql2/promise');
const pool = require('../db/pool.js');

module.exports = {
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
  // 아파트 저장
  async saveApt(items) {
    const conn = await pool.getConnection();
    const sql = `REPLACE INTO apt (
        complex_no,
        complex_name,
        cortar_no,
        real_estate_type_code,
        real_estate_type_name,
        total_house_hold_count,
        total_dong_count,
        high_floor,
        low_floor,
        use_approve_ymd,
        min_supply_area,
        max_supply_area,
        parking_possible_count,
        parking_house_count,
        construction_company_name,
        pyoeng_names,
        latitude,
        longitude,
        batl_ratio,
        btl_ratio,
        address,
        detail_address,
        road_address_prefix,
        road_address
      ) VALUES ?`;
    const [rows] = await conn.query(sql, [
      items.map((item) => [
        item.complexNo,
        item.complexName,
        item.cortarNo,
        item.realEstateTypeCode,
        item.realEstateTypeName,
        item.totalHouseholdCount,
        item.totalDongCount,
        item.highFloor,
        item.lowFloor,
        item.useApproveYmd,
        item.minSupplyArea,
        item.maxSupplyArea,
        item.parkingPossibleCount,
        item.parkingCountByHousehold,
        item.constructionCompanyName,
        item.pyoengNames,
        item.latitude,
        item.longitude,
        item.batlRatio,
        item.btlRatio,
        item.address,
        item.detailAddress,
        item.roadAddressPrefix,
        item.roadAddress,
      ]),
    ]);
    conn.release();
    console.log(`[Insert Apts] ${rows.info}`);
  },
  // 아파트 평 저장
  async savePyeong(items) {
    const conn = await pool.getConnection();
    const sql = `REPLACE INTO pyeong (
        complex_no,
        pyeong_no,
        supply_area_double,
        supply_area,
        pyeong_name,
        supply_pyeong,
        pyeong_name2,
        exclusive_area,
        exclusive_pyeong,
        house_count,
        real_estate_type_code,
        exclusive_rate,
        entrance_type,
        room_count,
        bath_room_count
      ) VALUES ?`;
    const [rows] = await conn.query(sql, [
      items.map((item) => [
        item.complexNo,
        item.pyeongNo,
        item.supplyAreaDouble,
        item.supplyArea,
        item.pyeongName,
        item.supplyPyeong,
        item.pyeongName2,
        item.exclusiveArea,
        item.exclusivePyeong,
        item.householdCountByPyeong,
        item.realEstateTypeCode,
        item.exclusiveRate,
        item.entranceType,
        item.roomCnt,
        item.bathroomCnt,
      ]),
    ]);
    conn.release();
    console.log(`[Insert Pyeongs] ${rows.info}`);
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
  // 아파트 평형별 매물수집 이력 저장
  async saveAptArticleHist(items) {
    const conn = await pool.getConnection();
    const sql = `REPLACE INTO apt_article_hist (
        ymd,
        trade_type,
        complex_no,
        pyeong_name,
        update_yn
      ) VALUES ?`;
    const [rows] = await conn.query(sql, [
      items.map((item) => [
        item.ymd,
        item.tradeType,
        item.complexNo,
        item.pyeongName,
        item.updateYn,
      ]),
    ]);
    conn.release();
    console.log(`[Insert AptArticleHist] ${rows.info}`);
  },
  // 아파트 평형별 매물수집 이력 업데이트
  async updateAptArticleHist(item) {
    const conn = await pool.getConnection();
    const sql = `UPDATE apt_article_hist 
      SET update_yn = 'Y'
      WHERE
            ymd = '${item.ymd}'
        AND trade_type = '${item.trade_type}'
        AND complex_no = '${item.complex_no}'
        AND pyeong_name = '${item.pyeong_name}'`;
    const [rows] = await conn.query(sql);
    conn.release();
    console.log(`[Update AptArticleHist] ${rows.info}`);
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
        price,
        dong,
        ho,
        total_floor,
        floor,
        article_desc,
        move_code,
        move_month,
        move_after_ym,
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
        item.price,
        item.dong,
        item.ho,
        item.totalFloor,
        item.floor,
        item.articleDesc,
        item.moveCode,
        item.moveMonth,
        item.moveAfterYM,
        item.confirmYmd,
      ]),
    ]);
    conn.release();
    console.log(`[Insert Articles: ${items[0].tradeType}] ${rows.info}`);
  },
  // FIXME:아파트 가격 업데이트
  async updatePrice(items) {
    try {
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
    } catch (e) {
      console.log(e);
    }
  },
  // 아파트매물이력 조회
  async getAptArticleHist(ymd = '') {
    const conn = await pool.getConnection();
    const sql = `SELECT a.*,
    (SELECT area_nos FROM apt_pyeong WHERE complex_no = a.complex_no AND pyeong_name = a.pyeong_name) AS area_nos
    FROM apt_article_hist a WHERE a.ymd = '${ymd}' AND a.update_yn = 'N' ORDER BY a.complex_no`;
    const [rows] = await conn.query(sql);
    conn.release();
    return rows;
  },
  // 지역 조회
  async getRegions(cortarType = 'city') {
    const conn = await pool.getConnection();
    const sql = 'SELECT * FROM regions WHERE cortar_type = ? ORDER BY cortar_no';
    const [rows] = await conn.query(sql, [cortarType]);
    conn.release();
    return rows;
  },
  // 구/시에 속한 동 조회
  async getDongs(cortarNo = '') {
    const conn = await pool.getConnection();
    const sql = `SELECT * FROM regions 
    WHERE 
      cortar_no LIKE '${cortarNo.substring(0, 4)}%' AND cortar_type = 'sec' ORDER BY cortar_no`;
    const [rows] = await conn.query(sql);
    conn.release();
    return rows;
  },
  // 아파트 구/시 단위로 조회
  async getAptsByCity(cortarNo = '') {
    return await this.getApts(cortarNo, 'dvsn', 'APT');
  },
  // 아파트 동 단위로 조회
  async getAptsByDong(cortarNo = '') {
    return await this.getApts(cortarNo, 'sec', 'APT');
  },
  // 아파트분양권 구/시 단위로 조회
  async getAbygByCity(cortarNo = '') {
    return await this.getApts(cortarNo, 'dvsn', 'ABYG');
  },
  // 아파트분양권 동 단위로 조회
  async getAbygByDong(cortarNo = '') {
    return await this.getApts(cortarNo, 'sec', 'ABYG');
  },
  // 아파트평형별 구/시 단위로 조회
  async getAptPyeongByCity(cortarNo = '') {
    return await this.getApts(cortarNo, 'dvsn', 'APT', 'apt_pyeong');
  },
  // 아파트평형별 동 단위로 조회
  async getAptPyeongByDong(cortarNo = '') {
    return await this.getApts(cortarNo, 'sec', 'APT', 'apt_pyeong');
  },
  /**
   * 아파트 조회
   * @param {*} cortarNo
   * @param {*} cortarType
   * 'dvsn': 구/시 단위로 조회
   * 'sec': 동 단위로 조회
   */
  async getApts(cortarNo = '', cortarType = 'dvsn', realEstateTypeCode = '', tableName = 'apt') {
    const conn = await pool.getConnection();
    let sql = `SELECT * FROM ${tableName}`;
    if (cortarNo) {
      sql += ` WHERE`;
      if (cortarType === 'dvsn') {
        sql += ` cortar_no LIKE '${cortarNo.substring(0, 4)}%'`;
      } else {
        sql += ` cortar_no = '${cortarNo}'`;
      }
    }
    if (realEstateTypeCode) {
      if (cortarNo) {
        sql += ` AND`;
      } else {
        sql += ` WHERE`;
      }
      sql += ` real_estate_type_code = '${realEstateTypeCode}'`;
    }
    const [rows] = await conn.query(sql);
    conn.release();
    return rows;
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
    return rows;
  },

  /**
   *
   * 배치
   *
   */
  // 배치 이력 조회
  async getBatchHist(ymd) {
    const conn = await pool.getConnection();
    let sql = `SELECT ymd, status, start_dt, end_dt, error_cnt FROM batch_hist WHERE ymd = ${ymd}`;
    const [rows] = await conn.query(sql);
    conn.release();
    return rows;
  },

  // 배치 이력 저장
  async saveBatchHist(ymd, status = 'START') {
    const conn = await pool.getConnection();
    const sql = `INSERT INTO batch_hist (ymd, status, start_dt) VALUES ('${ymd}', '${status}', now())`;
    const [rows] = await conn.query(sql);
    conn.release();
    console.log(`[Save BatchHist] ${rows.info}`);
  },

  // 배치 이력 업데이트
  async updateBatchHist(ymd, status) {
    const conn = await pool.getConnection();
    let sql = `UPDATE batch_hist SET status = '${status}'`;
    if (status === 'START') {
      sql += ',start_dt = now()';
    } else {
      sql += ',end_dt = now()';
      if (status === 'ERROR') {
        sql += ',error_cnt = error_cnt + 1';
      }
    }
    sql += ` WHERE ymd = '${ymd}'`;
    const [rows] = await conn.query(sql);
    conn.release();
    console.log(`[Update BatchHist] ${rows.info}`);
  },
};
