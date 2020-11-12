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
  const excludeStr = ['세안고', '세끼고'];
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
const tradeTypes = ['A1']; // 매매
const cityNo = '4148000000'; // 파주시
const ymd = moment().format('YYYYMMDD');
//const ymd = '20201111';

// 매물 기본값 등록
const saveArticleDefault = async () => {
  const dataList = [];
  // 1. 파주시에 있는 아파트평형별 전체 조회
  const apts = await db.getAptPyeongByCity(cityNo);
  if (apts.length === 0) {
    console.log('Empty Apt!');
    return;
  }
  for (apt of apts) {
    for (tradeType of tradeTypes) {
      const vo = {
        ymd,
        tradeType,
        complexNo: apt.complex_no,
        pyeongName: apt.pyeong_name,
        filterType: 'ALL',
        complexName: apt.complex_name,
        cortarNo: apt.cortar_no,
        areaNos: apt.area_nos,
        articleCount: 0,
        minPrice: 0,
        maxPrice: 0,
        avg: 0,
        median: 0,
        avgLow: 0,
        avgHigh: 0,
        deviation: 0,
        updateYn: 'N',
      };
      dataList.push(vo);
      if (tradeType === 'A1') {
        const filterVo = {
          ymd,
          tradeType,
          complexNo: param.complexNo,
          pyeongName: param.py,
          filterType: 'POSSIBLE',
          complexName: apt.complex_name,
          cortarNo: apt.cortar_no,
          areaNos: param.areaNos.join(':'),
          articleCount: 0,
          minPrice: 0,
          maxPrice: 0,
          avg: 0,
          median: 0,
          avgLow: 0,
          avgHigh: 0,
          deviation: 0,
          updateYn: 'N',
        };
        dataList.push(filterVo);
      }
    }
  }
  await db.savePrice(dataList);
};

// 매물 가격 업데이트
const updateArticles = async () => {
  // 1. 매매/전세/월세
  for (tradeType of tradeTypes) {
    // 2. 업데이트할 아파트 조회
    const complexs = await db.getPrice(ymd, tradeType);
    if (complexs.length === 0) {
      console.log('Empty complex!');
    }
    let n = 1;
    for (complex of complexs) {
      console.debug(`${n} of ${complexs.length}...`);
      let isMoreData = true;
      let articles = [];
      let priceAll = [];
      let priceFilter = [];
      for (page of [1, 2, 3, 4, 5]) {
        if (isMoreData) {
          // 3. 해당 아파트의 매물 조회
          const result = await getArticlesReq(
            {
              complexNo: complex.complex_no,
              tradeType: complex.trade_type,
              areaNos: complex.area_nos,
            },
            page,
          );
          isMoreData = result.isMoreData;
          articles = [...articles, ...result.articleList];
          await sleep(1000);
        }
      }
      for (article of articles) {
        // 4. 매물 상세 조회
        const articleNo = article.articleNo;
        const priceStr = article.dealOrWarrantPrc.split('억');
        let price = 0;
        if (priceStr.length > 1) {
          price = Number(priceStr[0]) * 10000 + Number(priceStr[1].replace(',', '')) * 1;
        } else {
          price = Number(priceStr[0].replace(',', '')) * 1;
        }
        // 3개월이내 실입주 가능한 매물만 필터링
        const item = await getArticleReq(articleNo);
        if (
          complex.trade_type === 'A1' &&
          !isExcludeArticle(article.articleFeatureDesc, item.articleDetail)
        ) {
          priceFilter.push(price);
        }
        priceAll.push(price);
        await sleep(2000);
      }
      const dataList = [];
      [priceAll, priceFilter].forEach((p, index) => {
        const minPrice = d3.min(p) || 0;
        const maxPrice = d3.max(p) || 0;
        const avg = util.mathFloor(d3.mean(p));
        const median = d3.median(p) || 0;
        const avgLow = util.mathFloor(d3.quantile(p, 0.25));
        const avgHigh = util.mathFloor(d3.quantile(p, 0.75));
        const deviation = util.mathFloor(d3.deviation(p));
        const vo = {
          ymd: complex.ymd,
          tradeType: complex.trade_type,
          complexNo: complex.complex_no,
          pyeongName: complex.pyeong_name,
          filterType: index === 0 ? 'ALL' : 'POSSIBLE',
          articleCount: p.length,
          minPrice,
          maxPrice,
          avg,
          median,
          avgLow,
          avgHigh,
          deviation,
          updateYn: 'Y',
        };
        dataList.push(vo);
      });
      await db.updatePrice(dataList);
      n++;
    }
  }
  console.log('[End] updateArticles!');
};

// saveArticleDefault().then((result) => {
//   updateArticles();
// });

updateArticles();
