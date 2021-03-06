/**
 * 통계 데이터 생성
 *
 */

require('../util/initialize.js');

const db = require('../db/stats.js');
const dbArticle = require('../db/article.js');
const dbHist = require('../db/batch_hist.js');
const util = require('../util/index.js');
const moment = require('moment');
const d3 = require('d3');
const _ = require('lodash');

module.exports = {
  // 통계 생성 및 저장
  async saveStats(ymd, rate) {
    if (!ymd || !rate) {
      console.error('Empty ymd OR rate!');
      return;
    }
    try {
      // 1. 업데이트할 아파트 조회
      const apts = await dbArticle.getAptArticleHist(ymd, 'STATS');
      if (apts.length === 0) {
        console.error('Empty Apts!');
        return;
      }
      // 2. 아파트 거래유형별 평형별 통계 생성
      for (apt of apts) {
        const params = {
          ymd,
          tradeType: apt.tradeType,
          complexNo: apt.complexNo,
          pyeongName: apt.pyeongName,
        };
        // 3. 매물 조회
        const articles = await dbArticle.getArticles(params);

        // 4. 하루전 매물 조회
        const beforeArticles = await dbArticle.getArticles({
          ymd: moment(ymd).add(-1, 'DAY').format('YYYYMMDD'),
          tradeType: apt.tradeType,
          complexNo: apt.complexNo,
          pyeongName: apt.pyeongName,
        });

        // 5. 추가삭제 매물 계산
        const articleCntInfo = {
          before: {
            all: { articleNos: [] },
            filter: { articleNos: [] },
          },
          current: {
            all: { articleNos: [] },
            filter: { articleNos: [] },
          },
          delCnt: [],
          addCnt: [],
          delCntFilter: [],
          addCntFilter: [],
        };
        beforeArticles.forEach((item) => {
          articleCntInfo.before.all.articleNos.push(item.articleNo);
          if (item.filterType === 'POSSIBLE') {
            articleCntInfo.before.filter.articleNos.push(item.articleNo);
          }
        });
        articles.forEach((item) => {
          articleCntInfo.current.all.articleNos.push(item.articleNo);
          if (item.filterType === 'POSSIBLE') {
            articleCntInfo.current.filter.articleNos.push(item.articleNo);
          }
        });
        if (beforeArticles.length > 0 || articles.length > 0) {
          articleCntInfo.delCnt = articleCntInfo.before.all.articleNos.filter(
            (item) => !articleCntInfo.current.all.articleNos.includes(item),
          );
          articleCntInfo.addCnt = articleCntInfo.current.all.articleNos.filter(
            (item) => !articleCntInfo.before.all.articleNos.includes(item),
          );
          articleCntInfo.delCntFilter = articleCntInfo.before.filter.articleNos.filter(
            (item) => !articleCntInfo.current.filter.articleNos.includes(item),
          );
          articleCntInfo.addCntFilter = articleCntInfo.current.filter.articleNos.filter(
            (item) => !articleCntInfo.before.filter.articleNos.includes(item),
          );
        }
        const statsAll = []; // 전체
        const statsFilter = []; // 실입주 가능매물만
        const statsSave = []; // 통계 저장
        let floorInfo = {
          all: { floor: null, price: 0 },
          filter: { floor: null, price: 0 },
        };
        const data = {
          all: {
            sameCnt: 0,
            increaseCnt: 0,
            decreaseCnt: 0,
          },
          filter: {
            sameCnt: 0,
            increaseCnt: 0,
            decreaseCnt: 0,
          },
        };
        for (article of articles) {
          let price = 0;
          // 거래유형별 가격 추출
          if (article.tradeType === 'A1') {
            price = article.dealPrice;
          } else if (article.tradeType === 'B1') {
            price = article.warrantPrice;
          } else if (article.tradeType === 'B2') {
            price = util.rentToWarrant(article.warrantPrice, article.rentPrice, rate);
          }

          // 가격 증감
          if (article.priceState === 'INCREASE') {
            data.all.increaseCnt += 1;
          } else if (article.priceState === 'DECREASE') {
            data.all.decreaseCnt += 1;
          } else {
            data.all.sameCnt += 1;
          }
          // 최저가격 층수
          if (floorInfo.all.price === 0) {
            floorInfo.all.price = price;
            floorInfo.all.floor = article.floor;
          } else if (floorInfo.all.price > price) {
            floorInfo.all.price = price;
            floorInfo.all.floor = article.floor;
          }
          // 가격 모음
          statsAll.push(price);
          // 실입주 가능 매물
          if (article.filterType === 'POSSIBLE') {
            // 가격 증감
            if (article.priceState === 'INCREASE') {
              data.filter.increaseCnt += 1;
            } else if (article.priceState === 'DECREASE') {
              data.filter.decreaseCnt += 1;
            } else {
              data.filter.sameCnt += 1;
            }
            // 최저가격 층수
            if (floorInfo.filter.price === 0) {
              floorInfo.filter.price = price;
              floorInfo.filter.floor = article.floor;
            } else if (floorInfo.filter.price > price) {
              floorInfo.filter.price = price;
              floorInfo.filter.floor = article.floor;
            }
            statsFilter.push(price);
          }
        }
        let arr = apt.tradeType === 'A1' ? [statsAll, statsFilter] : [statsAll];
        arr.forEach((p, index) => {
          const minPrice = d3.min(p) || 0;
          const maxPrice = d3.max(p) || 0;
          const avg = util.mathFloor(d3.mean(p));
          const median = d3.median(p) || 0;
          const avgLow = util.mathFloor(d3.quantile(p, 0.25));
          const avgHigh = util.mathFloor(d3.quantile(p, 0.75));
          const deviation = util.mathFloor(d3.deviation(p));
          let filterType = '';
          if (apt.tradeType === 'A1') {
            filterType = index === 0 ? 'ALL' : 'POSSIBLE';
          }
          const vo = {
            ymd,
            tradeType: apt.tradeType,
            complexNo: apt.complexNo,
            pyeongName: apt.pyeongName,
            filterType,
            articleCount: p.length,
            minPrice,
            maxPrice,
            avg,
            median,
            avgLow,
            avgHigh,
            deviation,
            sameCnt: index === 0 ? data.all.sameCnt : data.filter.sameCnt,
            increaseCnt: index === 0 ? data.all.increaseCnt : data.filter.increaseCnt,
            decreaseCnt: index === 0 ? data.all.decreaseCnt : data.filter.decreaseCnt,
            rate: apt.tradeType !== 'A1' ? rate : 0,
            delCnt: index === 0 ? articleCntInfo.delCnt.length : articleCntInfo.delCntFilter.length,
            addCnt: index === 0 ? articleCntInfo.addCnt.length : articleCntInfo.addCntFilter.length,
            floor: index === 0 ? floorInfo.all.floor : floorInfo.filter.floor,
          };
          statsSave.push(vo);
        });
        if (statsSave.length > 0) {
          await db.saveStats(statsSave);
          await dbArticle.updateAptArticleHist(params, 'stats_update_yn');
        } else {
          await dbArticle.updateAptArticleHist(params, 'stats_update_yn');
        }
      }
      // dbHist.updateBatchHist({ymd, batchType: 'STATS', status: 'DONE', now: 'now'});
      console.log('[End] saveStats!');
    } catch (e) {
      console.error('[Error] saveStats!', e);
      // dbHist.updateBatchHist({ymd, batchType: 'STATS', status: 'ERROR', now: 'now', errorMsg: e.toString()});
      return;
    }
  },
};
