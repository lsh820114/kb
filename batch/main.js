/**
 *
 * 아파트 통계
 *
 */

require('../util/initialize.js');
const req = require('../util/request.js');
const util = require('../util/index.js');
const url = require('../info/url.js');
const db = require('./db.js');
const moment = require('moment');
const d3 = require('d3');

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// 아파트 매물 목록
const getArticlesReq = async (param, page = 1) => {
  return await req.get(`${url.getArticles(param.complexNo)}`, {
    realEstateType: 'APT:ABYG:JGC',
    tradeType: param.tradeType,
    tag: '::::::::',
    rentPriceMin: 0,
    rentPriceMax: 900000000,
    priceMin: 0,
    priceMax: 900000000,
    areaMin: 0,
    areaMax: 900000000,
    oldBuildYears: '',
    recentlyBuildYears: '',
    minHouseHoldCount: '',
    maxHouseHoldCount: '',
    showArticle: false,
    sameAddressGroup: true,
    minMaintenanceCost: '',
    maxMaintenanceCost: '',
    priceType: 'RETAIL',
    directions: '',
    page,
    complexNo: param.complexNo,
    buildingNos: '',
    areaNos: param.areaNos,
    type: 'list',
    order: 'prc',
  });
};

// 아파트 매물 상세
const getArticleReq = async (articleNo = '') => {
  return await req.get(`${url.getArticle(articleNo)}`);
};

// 매물 필터링
const isExcludeArticle = (desc = null, article = null) => {
  // 매물 포함 제외 문자
  const excludeStr = ['세안고', '세끼고', '전세', '월세'];
  if (desc) {
    if (util.hasStr(excludeStr, desc)) {
      return true;
    }
  }
  if (!article) {
    return false;
  }
  // 최대 개월수
  const maxMonth = 3;
  if (article) {
    if (article.moveInTypeCode === 'MV001') {
      return false;
    }
    // n개월이내
    else if (article.moveInTypeCode === 'MV002') {
      if (article.moveInPossibleInMonthCount < maxMonth + 1) {
        return false;
      }
    }
    // 협의가능
    else if (article.moveInTypeCode === 'MV003') {
      const toDate = moment(article.moveInPossibleAfterYM).endOf('month').format('YYYYMMDD');
      if (toDate.length !== 8) {
        return true;
      }
      const maxDate = moment().add(maxMonth, 'M').format('YYYYMMDD');
      const result = moment(toDate).isBefore(maxDate);
      // console.log(toDate, maxDate, result);
      return !result;
    }
    return true;
  }
};

// 전역 정보
const tradeTypes = ['B1']; // 매매
const cityNo = '4148000000'; // 파주시
//const ymd = moment().format('YYYYMMDD');
const ymd = '20201113';

// 아파트 평형별 매물수집 이력 등록
const saveAptArticleHist = async () => {
  const dataList = [];
  // 1. 파주시에 있는 아파트평형별 전체 조회
  const apts = await db.getAptPyeongByCity(cityNo);
  if (apts.length === 0) {
    console.log('Empty Apt!');
    return;
  }
  for (apt of apts) {
    // 2. 거래 유형별로 저장
    for (tradeType of tradeTypes) {
      const vo = {
        ymd,
        tradeType,
        complexNo: apt.complex_no,
        pyeongName: apt.pyeong_name,
        updateYn: 'N',
      };
      dataList.push(vo);
    }
  }
  await db.saveAptArticleHist(dataList);
};

// 매물 저장
const saveArticles = async () => {
  // 1. 업데이트할 아파트 조회
  const apts = await db.getAptArticleHist(ymd);
  if (apts.length === 0) {
    console.log('Empty Apts!');
  }
  let n = 1;
  for (apt of apts) {
    console.debug(`${n} of ${apts.length}...`);
    let isMoreData = true;
    let articles = [];
    for (page of [1, 2, 3, 4, 5]) {
      if (isMoreData) {
        // 2. 해당 아파트의 매물 조회
        const result = await getArticlesReq(
          {
            complexNo: apt.complex_no,
            tradeType: apt.trade_type,
            areaNos: apt.area_nos,
          },
          page,
        );
        isMoreData = result.isMoreData;
        articles = [...articles, ...result.articleList];
        await sleep(1000);
      }
    }
    const dataList = [];
    // 3. 해당 아파트 매물 전체
    for (article of articles) {
      const articleNo = article.articleNo;
      // 4. 매물 상세 조회
      const item = await getArticleReq(articleNo);
      const vo = {
        ymd,
        articleNo: article.articleNo,
        articleName: article.articleName,
        tradeType: article.tradeTypeCode,
        complexNo: item.articleDetail.hscpNo,
        pyeongName: apt.pyeong_name,
        pyeongNo: Number(item.articleDetail.ptpNo),
        cortarNo: item.articleDetail.cortarNo,
        price: item.articlePrice.dealPrice,
        dong: item.articleDetail.originBuildingName,
        ho: item.landPrice.hoNm,
        totalFloor: item.articleFloor.totalFloorCount,
        floor: item.articleFloor.correspondingFloorCount,
        articleDesc: '',
        moveCode: item.articleDetail.moveInTypeCode,
        moveMonth: '',
        moveAfterYM: '',
        confirmYmd: article.articleConfirmYmd,
      };
      if (article.articleFeatureDesc) {
        vo.articleDesc = article.articleFeatureDesc;
      }
      if (vo.moveCode === 'MV002') {
        if (item.articleDetail.moveInPossibleInMonthCount) {
          vo.moveMonth = item.articleDetail.moveInPossibleInMonthCount;
        }
      } else if (vo.moveCode === 'MV003') {
        if (item.articleDetail.moveInPossibleAfterYM) {
          vo.moveAfterYM = item.articleDetail.moveInPossibleAfterYM;
        }
      }
      console.log('vo', vo);
      dataList.push(vo);
      await sleep(2000);
    }
    // 5. 매물 저장
    if (dataList.length > 0) {
      if (await db.saveArticles(dataList)) {
        await db.updateAptArticleHist(apt);
      } else {
        console.error('[Error] Save Article!');
        return;
      }
    } else {
      if (!(await db.updateAptArticleHist(apt))) {
        console.error('[Error] Update AptArticleHist!');
        return;
      }
    }
    n++;
  }
  console.log('[End] saveArticles!');
};

// saveAptArticleHist();
saveArticles();

// saveAptArticleHist().then((result) => {
//   saveArticles();
// });
