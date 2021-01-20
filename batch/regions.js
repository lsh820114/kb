/**
 *
 * 1.시/도, 시/군/구, 읍/면/동 정보수집
 *
 */

const req = require('../util/request.js');
const url = require('../info/url.js');
const db = require('../db/regions.js');

const getData = async (cortarNo = '0000000000') => {
  return await req.get(`${url.getArea()}?cortarNo=${cortarNo}`);
};

const save = async (cortarType = '') => {
  let regions = [{ cortarNo: '0000000000' }];
  if (cortarType) {
    regions = await db.getRegions(cortarType);
  }
  for (item of regions) {
    const result = await getData(item.cortarNo);
    await db.saveRegions(result.regionList);
  }
};

/*
save(); // 1.시/도
save('city'); // 2.시/군/구
save('dvsn'); // 3.읍/면/동
*/
