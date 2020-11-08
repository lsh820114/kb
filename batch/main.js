/**
 * - 배치
 * 아파트 통계
 *
 */
require('../util/initialize.js');
const req = require('../util/request.js');
const url = require('../info/url.js');
const db = require('./db.js');

const complexNo = '119854';

db.getPyeong(complexNo).then((pyeongs) => {
  let o = {};
  for (pyeong of pyeongs) {
    // console.log(pyeong);
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
  const options = [];
  for (const [k, v] of Object.entries(o)) {
    options.push(v);
  }
  console.log(options);
});
