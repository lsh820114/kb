/**
 * -배치
 * 시/도, 시/군/구, 읍/면/동 정보수집
 *
 */

require('../util/initialize.js');
const req = require('../util/request.js');
const url = require('../info/url.js');
const db = require('./db.js');

const getData = async (cortarNo = '0000000000') => {
  return await req.get(`${url.getArea()}?cortarNo=${cortarNo}`);
};

const save = async (cortarType = '') => {
  let regions = [{ cortarNo: '0000000000' }];
  if (cortarType) {
    regions = await db.getRegions(cortarType);
  }
  for (item of regions) {
    const result = await getData(item.cortar_no);
    await db.saveRegions(result.regionList);
  }
};

// 1.시/도
// save();
// 2.시/군/구
// save('city');
// 3.읍/면/동
// save('dvsn');
