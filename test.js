const openvpnmanager = require('node-openvpn');
const req = require('./util/request.js');
const url = require('./info/url.js');

const opts = {
  host: 'public-vpn-94.opengw.net', // normally '127.0.0.1', will default to if undefined
  port: 443, //port openvpn management console
  timeout: 1500, //timeout for connection - optional, will default to 1500ms if undefined
  logpath: 'log.txt', //optional write openvpn console output to file, can be relative path or absolute
};
/*
const openvpn = openvpnmanager.connect(opts);
openvpn.on('connected', (e) => {
  //openvpnmanager.authorize(auth);
  console.log('connected');
});
openvpn.on('error', (error) => {
  console.log(error);
});
openvpn.on('console-output', (output) => {
  console.log(output);
});
openvpn.on('disconnected', () => {
  // finally destroy the disconnected manager
  openvpnmanager.destroy();
});
*/
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
const run = async () => {
  const result = await getArticlesReq(
    {
      complexNo: '10008',
      tradeType: 'A1',
      areaNos: '1',
    },
    1,
  );
  console.log('result', result);
};
run();
