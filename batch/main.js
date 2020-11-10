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

// 매물 조회
const getArticles = async () => {
  const textList = [];
  const dataList = [];
  let possibleCount = 0;
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
      let priceAll = [];
      let priceFilter = [];
      for (page of [1, 2, 3, 4, 5]) {
        if (isMoreData) {
          // 3. 해당 아파트의 매물 조회
          const result = await getArticlesReq(param, page);
          isMoreData = result.isMoreData;
          articles = [...articles, ...result.articleList];
          await sleep(500);
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
          param.tradeType === 'A1' &&
          !isExcludeArticle(article.articleFeatureDesc, item.articleDetail)
        ) {
          priceFilter.push(price);
        }
        priceAll.push(price);
        await sleep(1000);
      }
      let filterVo = {};
      [priceAll, priceFilter].forEach((p, index) => {
        const minPrice = d3.min(p);
        const maxPrice = d3.max(p);
        const avg = util.mathFloor(d3.mean(p));
        const median = d3.median(p);
        const avgLow = util.mathFloor(d3.quantile(p, 0.25));
        const avgHigh = util.mathFloor(d3.quantile(p, 0.75));
        const deviation = util.mathFloor(d3.deviation(p));
        const vo = {
          complexNo: param.complexNo,
          pyeongName: param.py,
          tradeType: param.tradeType,
          filterType: index === 0 ? 'ALL' : 'POSSIBLE',
          complexName: apt.complex_name,
          cortarNo: apt.cortar_no,
          articleCount: p.length,
          minPrice,
          maxPrice,
          avg,
          median,
          avgLow,
          avgHigh,
          deviation,
        };
        if (index > 0) {
          filterVo = vo;
          possibleCount += filterVo.articleCount;
        }
        dataList.push(vo);
      });

      textList.push('------------------------------------------------------------');
      textList.push(`${param.name}(${filterVo.pyeongName}평)`);
      textList.push('매물수: ' + filterVo.articleCount);
      if (priceFilter.length > 0) {
        textList.push(
          `가격: ${util.addComma(filterVo.minPrice)} ~ ${util.addComma(filterVo.maxPrice)}`,
        );
        textList.push('평균값: ' + util.addComma(filterVo.avg));
        textList.push('중앙값: ' + util.addComma(filterVo.median));
        textList.push('하위평균값: ' + util.addComma(filterVo.avgLow));
        textList.push('상위평균값: ' + util.addComma(filterVo.avgHigh));
        // textList.push('표준편차: ' + util.addComma(filterVo.deviation));
      }
    }
  }

  let text = '';
  textList.forEach((t) => {
    text += t + '\n';
  });
  console.log(text);
  //db.savePrice(dataList);
  console.log(`[End] PossibleCount: ${possibleCount}`);
};

getArticles();
