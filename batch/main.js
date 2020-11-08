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
const { scaleDivergingPow } = require('d3');

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
    areaNos: param.areaNos.join(':'),
    type: 'list',
    order: 'prc',
  });
};

// 아파트 매물 상세
const getArticleReq = async (articleNo = '') => {
  return await req.get(`${url.getArticle(articleNo)}`);
};

// 매물 정보를 얻기 위한 파라미터 생성
const getArticleParams = async (complexNo = '') => {
  const pyeongs = await db.getPyeong(complexNo);
  let o = {};
  for (pyeong of pyeongs) {
    if (!o.hasOwnProperty(pyeong.py)) {
      o[pyeong.py] = {
        name: pyeong.complex_name,
        py: pyeong.py,
        complexNo: pyeong.complex_no,
        areaNos: [pyeong.pyeong_no],
      };
    } else {
      o[pyeong.py].areaNos.push(pyeong.pyeong_no);
    }
  }
  const params = [];
  for (const [k, v] of Object.entries(o)) {
    params.push(v);
  }
  return params;
};

// 매물 포함 제외 문자
const excludeStr = ['세안고', '세끼고'];

// 매물제외 조건
const maxMonth = 3;
const isExclude = (item) => {
  // 즉시입주
  if (item.moveInTypeCode === 'MV001') {
    return false;
  }
  // n개월이내
  else if (item.moveInTypeCode === 'MV002') {
    if (item.moveInPossibleInMonthCount < maxMonth + 1) {
      return false;
    }
  }
  // 협의가능
  else if (item.moveInTypeCode === 'MV003') {
    const toDate = moment(item.moveInPossibleAfterYM).endOf('month').format('YYYYMMDD');
    const maxDate = moment().add(maxMonth, 'M').format('YYYYMMDD');
    const result = moment(toDate).isBefore(maxDate);
    // console.log(toDate, maxDate, result);
    return !result;
  }
  return true;
};
const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// 매물 조회
const getArticles = async () => {
  const textList = [];
  const dataList = [];
  // 1. 파주시에 있는 아파트 전체 조회
  const tradeType = 'A1'; // 매매
  // const cityNo = '4148000000'; // 파주시
  // const apts = await db.getAptsByCity(cityNo);
  const cityNo = '4148011700';
  const apts = await db.getAptsByDong(cityNo);
  for (apt of apts) {
    const complexNo = apt.complex_no;
    // 2. 해당 아파트의 파라미터 생성(평형별)
    const params = await getArticleParams(complexNo);
    for (param of params) {
      param.tradeType = tradeType;
      let isMoreData = true;
      let articles = [];
      let itemCount = 0;
      let priceAll = [];
      for (page of [1, 2, 3, 4, 5]) {
        if (isMoreData) {
          // 3. 해당 아파트의 매물 조회
          const result = await getArticlesReq(param, page);
          isMoreData = result.isMoreData;
          articles = [...articles, ...result.articleList];
          await sleep(1000);
        }
      }
      for (article of articles) {
        if (
          (param.tradeType === 'A1' && !util.hasStr(excludeStr, article.articleFeatureDesc)) ||
          param.tradeType === 'B1'
        ) {
          // 4. 매물 상세 조회
          const articleNo = article.articleNo;
          const item = await getArticleReq(articleNo);
          if (!isExclude(item.articleDetail)) {
            const priceStr = article.sameAddrMinPrc.split('억');
            let price = 0;
            if (priceStr.length > 1) {
              price = Number(priceStr[0]) * 10000 + Number(priceStr[1].replace(',', '')) * 1;
            } else {
              price = Number(priceStr[0].replace(',', '')) * 1;
            }
            priceAll.push(price);
            itemCount++;
          }
          await sleep(1000);
        }
      }
      const minPrice = d3.min(priceAll);
      const maxPrice = d3.max(priceAll);
      const avgPrice = util.mathFloor(d3.mean(priceAll));
      const medianPrice = d3.median(priceAll);
      const quantileLowPrice = util.mathFloor(d3.quantile(priceAll, 0.25));
      const quantileHighPrice = util.mathFloor(d3.quantile(priceAll, 0.75));
      // const deviationPrice = util.mathFloor(d3.deviation(priceAll));

      textList.push('------------------------------------------------------------');
      textList.push(`${param.name}(${param.py}평)`);
      textList.push('매물수: ' + itemCount);
      if (itemCount > 0) {
        textList.push(`가격: ${util.addComma(minPrice)} ~ ${util.addComma(maxPrice)}`);
        textList.push('평균값: ' + util.addComma(avgPrice));
        textList.push('중앙값: ' + util.addComma(medianPrice));
        textList.push('하위평균값: ' + util.addComma(quantileLowPrice));
        textList.push('상위평균값: ' + util.addComma(quantileHighPrice));
        // textList.push('표준편차: ' + util.addComma(deviationPrice));
      }
      // Create data
      /*
      const data = [
        param.name,
        param.py,
        param.complexNo,
        param.areaNos,
        param.tradeType,
        itemCount,
        minPrice || 0,
        maxPrice || 0,
        avgPrice || 0,
        medianPrice || 0,
        util.getToday().replaceAll('-', ''),
      ];
      dataList.push(data);
      */
    }
  }

  let text = '';
  textList.forEach((t) => {
    text += t + '\n';
  });
  console.log(text);
};

getArticles();
