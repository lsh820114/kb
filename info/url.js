/**
 * API 주소 정보
 *
 */

const API = 'https://new.land.naver.com/api';

module.exports = {
  getApi() {
    return API;
  },
  getArea() {
    // 지역검색
    return `${API}/regions/list`;
  },
  getAreaApts() {
    // 지역 아파트 정보
    return `${API}/regions/complexes`;
  },
  getAptOverView(complexNo = '') {
    // 아파트 단지 정보
    return `${API}/complexes/${complexNo}`;
  },
  /*
  getAptOverView(complexNo = '') {
    // 아파트 단지 정보
    return `${API}/complexes/overview/${complexNo}?complexNo=${complexNo}`;
  },
  */
  getApts(complexNo = '') {
    // 아파트 매물 목록
    return `${API}/articles/complex/${complexNo}`;
  },
  getApt(articleNo = '') {
    // 아파트 매물 상세
    return `${API}/articles/${articleNo}`;
  },
  getKb(complexNo = '') {
    // KB시세
    return `${API}/complexes/${complexNo}/prices?complexNo=${complexNo}`;
  },
};
