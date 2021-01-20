/**
 *
 * 2.지역별 아파트 정보수집
 *
 */

const req = require('../util/request.js');
const url = require('../info/url.js');
const db = require('../db/apt.js');

const getAreaApts = async (cortarNo = '') => {
  return await req.get(`${url.getAreaApts()}`, { cortarNo, realEstateType: 'APT:ABYG:JGC' });
};
const getAptOverView = async (complexNo = '') => {
  return await req.get(`${url.getAptOverView(complexNo)}`);
};
// DB에서 조회한 아파트 정보 갱신
const updateApt = async (apts = []) => {
  const aptAll = [];
  for (apt of apts) {
    const aptInfo = await getAptOverView(apt.complexNo);
    aptAll.push(aptInfo.complexDetail);
  }
  // console.log(aptAll);
  if (aptAll.length) {
    await db.saveApt(aptAll);
  }
};
// 분양권 아파트 갱신 (완공후에 정보변경)
const updateBunYangApt = async () => {
  const apts = await db.getAbygByCity();
  updateApt(apts);
};

// 아파트/평형 저장
const run = async () => {
  // 1. 파주시 동목록 조회 (LIKE xxxx%)
  const cityNo = '4148000000';
  const dongs = await db.getDongs(cityNo);
  for (dong of dongs) {
    const cortarNo = dong.cortarNo;
    // 2. 해당 동에 있는 아파트 전체 조회
    const apts = await getAreaApts(cortarNo);
    const aptAll = [];
    for (apt of apts.complexList) {
      const complexNo = apt.complexNo;
      // 3. 개별 아파트 상세 조회
      const aptInfo = await getAptOverView(complexNo);
      aptAll.push(aptInfo.complexDetail);
      // 4. 평형 정보
      const pyeongAll = [];
      for (pyeong of aptInfo.complexPyeongDetailList) {
        pyeong.complexNo = complexNo;
        pyeongAll.push(pyeong);
      }
      if (pyeongAll.length) {
        await db.savePyeong(pyeongAll);
      }
    }
    if (aptAll.length) {
      await db.saveApt(aptAll);
    }
  }
  console.log('Batch End!');
};

// updateBunYangApt();
run();
