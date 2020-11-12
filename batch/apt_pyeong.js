/**
 * 아파트 평형별 등록
 * (매물 목록 API 요청시 필요)
 *
 */

const db = require('./db.js');

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

const cityNo = '4148000000'; // 파주시

const run = async () => {
  const dataList = [];
  // 1. 해당시에 있는 아파트 전체 조회
  const apts = await db.getAptsByCity(cityNo);
  if (apts.length === 0) {
    console.log('Empty Apt!');
    return;
  }
  for (apt of apts) {
    const complexNo = apt.complex_no;
    // 2. 해당 아파트의 평형별 정보 설정
    const params = await getArticleParams(complexNo);
    for (param of params) {
      const vo = {
        complexNo: param.complexNo,
        pyeongName: param.py,
        complexName: apt.complex_name,
        realEstateTypeCode: apt.real_estate_type_code,
        cortarNo: apt.cortar_no,
        areaNos: param.areaNos.join(':'),
      };
      dataList.push(vo);
    }
  }
  await db.saveAptPyeong(dataList);
};

run();
