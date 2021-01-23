/**
 *
 * 아파트 매물 수집
 *
 */

require('../util/initialize.js');
const req = require('../util/request.js');
const util = require('../util/index.js');
const url = require('../info/url.js');
const db = require('../db/article.js');
const dbApt = require('../db/apt.js');
const dbHist = require('../db/batch_hist.js');

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

module.exports = {
  // 아파트 평형별 매물수집 이력 등록
  async saveAptArticleHist(ymd, tradeTypes, cityNo) {
    const dataList = [];
    // 1. 파주시에 있는 아파트평형별 전체 조회
    const apts = await dbApt.getAptPyeongByCity(cityNo);
    if (apts.length === 0) {
      console.error('Empty Apt!');
      return;
    }
    for (apt of apts) {
      // 2. 거래 유형별로 저장
      for (tradeType of tradeTypes) {
        const vo = {
          ymd,
          tradeType,
          complexNo: apt.complexNo,
          pyeongName: apt.pyeongName,
          updateYn: 'N',
          statsUpdateYn: 'N',
        };
        dataList.push(vo);
      }
    }
    await db.saveAptArticleHist(dataList);
  },
  // 매물 저장
  async saveArticles(ymd) {
    try {
      // 1. 업데이트할 아파트 조회
      const apts = await db.getAptArticleHist(ymd);
      if (apts.length === 0) {
        console.error('Empty Apts!');
        return;
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
                complexNo: apt.complexNo,
                tradeType: apt.tradeType,
                areaNos: apt.areaNos,
              },
              page,
            );
            isMoreData = result.isMoreData;
            articles = [...articles, ...result.articleList];
            console.time('sleep before');
            await util.sleep(2000);
            console.timeEnd('sleep after');
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
            pyeongName: apt.pyeongName,
            pyeongNo: Number(item.articleDetail.ptpNo),
            cortarNo: item.articleDetail.cortarNo,
            priceState: item.articleAddition.priceChangeState,
            dealPrice: item.articlePrice.dealPrice,
            warrantPrice: item.articlePrice.warrantPrice,
            rentPrice: item.articlePrice.rentPrice,
            allWarrantPrice: item.articlePrice.allWarrantPrice,
            allRentPrice: item.articlePrice.allRentPrice,
            dong: item.articleDetail.originBuildingName,
            sameAddrCnt: article.sameAddrCnt,
            ho: item.landPrice.hoNm,
            totalFloor: item.articleFloor.totalFloorCount,
            floor: item.articleFloor.correspondingFloorCount,
            articleDesc: '',
            moveCode: item.articleDetail.moveInTypeCode,
            moveMonth: '',
            moveAfterYM: '',
            confirmYmd: article.articleConfirmYmd,
            filterType: '',
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
          if (vo.tradeType === 'A1' && !util.isExcludeArticle(vo)) {
            vo.filterType = 'POSSIBLE';
          }
          dataList.push(vo);
          await util.sleep(2000);
        }
        // 5. 매물 저장
        if (dataList.length > 0) {
          await db.saveArticles(dataList);
          await db.updateAptArticleHist(apt);
        } else {
          await db.updateAptArticleHist(apt);
        }
        n++;
      }
      dbHist.updateBatchHist({ ymd, batchType: 'ARTICLE', status: 'DONE', now: 'now' });
      console.log('[End] saveArticles!');
    } catch (e) {
      console.error('[Error] saveArticles!', e);
      dbHist.updateBatchHist({
        ymd,
        batchType: 'ARTICLE',
        status: 'ERROR',
        now: 'now',
        errorMsg: e.toString(),
      });
      return;
    }
  },
};
