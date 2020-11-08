/**
 *
 * 배치용 DB
 *
 */

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
    try {
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
    } catch (e) {
      console.log(e);
    }
  },
  // 아파트 평 저장
  async savePyeong(items) {
    try {
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
    } catch (e) {
      console.log(e);
    }
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
  /**
   * 아파트 조회
   * @param {*} cortarNo
   * @param {*} cortarType
   * 'dvsn': 구/시 단위로 조회
   * 'sec': 동 단위로 조회
   */
  async getApts(cortarNo = '', cortarType = 'dvsn', realEstateTypeCode = '') {
    const conn = await pool.getConnection();
    let sql = `SELECT * FROM apt`;
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
};
