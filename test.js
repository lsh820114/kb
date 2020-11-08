const request = require("request");
const fs = require("fs");
const d3 = require("d3");
const { setTimeout } = require("timers");
const sqlite3 = require("sqlite3").verbose();
const moment = require("moment");

const db = new sqlite3.Database("./db/aptDatabase.db");

/** Util **/
String.prototype.replaceAll = function (org, dest) {
  return this.split(org).join(dest);
};

function addComma(number) {
  return number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
}
const hasStr = (text = "") => {
  return excludeStr.some((item) => {
    return text.indexOf(item) > -1;
  });
};
const getToday = () => {
  return new Date().toISOString().substring(0, 10);
};
const mathFloor = (num = 0) => {
  return Math.floor(num / 100) * 100;
};

const makeFile = (text) => {
  const filePath = `c:\\kb\\${getToday()}.txt`;
  fs.open(filePath, "wx", (err, fd) => {
    if (err) {
      if (err.code === "EEXIST") {
        console.error("해당 파일이 이미 존재합니다.");
        return;
      }
      throw err;
    }
    fs.appendFile(fd, text, "utf8", (err) => {
      fs.close(fd, (err) => {
        if (err) throw err;
      });
      if (err) throw err;
    });
  });
};

/** Options **/
const apts3 = [
  { name: "롯데캐슬타운2차", py: 24, complexNo: 111493, areaNos: "1:2:3" },
  { name: "롯데캐슬타운2차", py: 34, complexNo: 111493, areaNos: "4:5:6" },
  { name: "힐스테이트운정", py: 24, complexNo: 113942, areaNos: "1:2:3:4" },
  // {name: '힐스테이트운정', py: 24,  complexNo: 113942, areaNos: '1'},
  { name: "힐스테이트운정", py: 30, complexNo: 113942, areaNos: "5:6:7" },
  { name: "힐스테이트운정", py: 34, complexNo: 113942, areaNos: "8:9:10" },
  { name: "운정신도시센트럴푸르지오", py: 30, complexNo: 111541, areaNos: "1" },
  {
    name: "운정신도시센트럴푸르지오",
    py: 34,
    complexNo: 111541,
    areaNos: "2:3:4:5:6:7",
  },
  { name: "운정신도시아이파크", py: 34, complexNo: 119854, areaNos: "3:4:5" },
];
const apts = [
  { name: "힐스테이트운정", py: 25, complexNo: 113942, areaNos: "1:2" },
  { name: "힐스테이트운정", py: 26, complexNo: 113942, areaNos: "3" },
  { name: "힐스테이트운정", py: 27, complexNo: 113942, areaNos: "4" },
  { name: "힐스테이트운정", py: 30, complexNo: 113942, areaNos: "5:6:7" },
  { name: "힐스테이트운정", py: 34, complexNo: 113942, areaNos: "8:9:10" },
  { name: "운정신도시센트럴푸르지오", py: 30, complexNo: 111541, areaNos: "1" },
  {
    name: "운정신도시센트럴푸르지오",
    py: 34,
    complexNo: 111541,
    areaNos: "2:3:4:5:6:7",
  },
  { name: "운정신도시아이파크", py: 24, complexNo: 119854, areaNos: "1:2" },
  { name: "운정신도시아이파크", py: 34, complexNo: 119854, areaNos: "3:4:5" },
  { name: "운정신도시아이파크", py: 39, complexNo: 119854, areaNos: "6" },
  { name: "운정신도시아이파크", py: 44, complexNo: 119854, areaNos: "7:8:9" },

  {
    name: "운정화성파크드림시그니처",
    py: 25,
    complexNo: 119518,
    areaNos: "1:2",
  },
  {
    name: "운정화성파크드림시그니처",
    py: 29,
    complexNo: 119518,
    areaNos: "3:4",
  },
  {
    name: "운정화성파크드림시그니처",
    py: 33,
    complexNo: 119518,
    areaNos: "5:6:7:8:9:10",
  },
];
const apts2 = [
  { name: "힐스테이트운정", py: 25, complexNo: 113942, areaNos: "1:2" },
];
const getApts = (tradeType = "A1") => {
  apts.forEach((item) => {
    item.tradeType = tradeType;
  });
  return apts;
};

// 매물 포함 제외 문자
const excludeStr = ["세안고", "세끼고"];

// 매물제외 조건
const maxMonth = 3;
const isExclude = (item) => {
  // 즉시입주
  if (item.moveInTypeCode === "MV001") {
    return false;
  }
  // n개월이내
  else if (item.moveInTypeCode === "MV002") {
    if (item.moveInPossibleInMonthCount < maxMonth + 1) {
      return false;
    }
  }
  // 협의가능
  else if (item.moveInTypeCode === "MV003") {
    const toDate = moment(item.moveInPossibleAfterYM)
      .endOf("month")
      .format("YYYYMMDD");
    const maxDate = moment().add(maxMonth, "M").format("YYYYMMDD");
    const result = moment(toDate).isBefore(maxDate);
    // console.log(toDate, maxDate, result);
    return !result;
  }
  return true;
};

const getOption = (params, page = 1) => {
  return {
    uri: `https://new.land.naver.com/api/articles/complex/${params.complexNo}`,
    qs: {
      realEstateType: "APT:ABYG:JGC",
      tradeType: params.tradeType,
      tag: "::::::::",
      rentPriceMin: 0,
      rentPriceMax: 900000000,
      priceMin: 0,
      priceMax: 900000000,
      areaMin: 0,
      areaMax: 900000000,
      oldBuildYears: "",
      recentlyBuildYears: "",
      minHouseHoldCount: "",
      maxHouseHoldCount: "",
      showArticle: false,
      sameAddressGroup: true,
      minMaintenanceCost: "",
      maxMaintenanceCost: "",
      priceType: "RETAIL",
      directions: "",
      page,
      complexNo: params.complexNo,
      buildingNos: "",
      areaNos: params.areaNos,
      type: "list",
      order: "prc",
    },
  };
};

const req = (params, page) => {
  return new Promise((resolve) => {
    request(getOption(params, page), function (err, response, body) {
      resolve(JSON.parse(body));
    });
  });
};

const reqDetail = (articleNo) => {
  return new Promise((resolve) => {
    request(
      {
        uri: `https://new.land.naver.com/api/articles/${articleNo}?complexNo=`,
      },
      function (err, response, body) {
        resolve(JSON.parse(body));
      }
    );
  });
};

const textList = [];
const dataList = [];
const getApt = async (params) => {
  let isMoreData = true;
  let articleList = [];
  let itemCount = 0;
  let priceAll = [];
  for (page of [1, 2, 3, 4, 5]) {
    if (isMoreData) {
      const data = await req(params, page);
      isMoreData = data.isMoreData;
      articleList = [...articleList, ...data.articleList];
    }
  }
  for (item of articleList) {
    const articleNo = item.articleNo;
    if (
      (params.tradeType === "A1" && !hasStr(item.articleFeatureDesc)) ||
      params.tradeType === "B1"
    ) {
      const _item = await reqDetail(articleNo);
      if (!isExclude(_item.articleDetail)) {
        const priceStr = item.sameAddrMinPrc.split("억");
        const price =
          Number(priceStr[0]) * 10000 +
          Number(priceStr[1].replace(",", "")) * 1;
        priceAll.push(price);
        itemCount++;
      }
    }
  }

  const minPrice = d3.min(priceAll);
  const maxPrice = d3.max(priceAll);
  const avgPrice = mathFloor(d3.mean(priceAll));
  const medianPrice = d3.median(priceAll);
  const quantileLowPrice = mathFloor(d3.quantile(priceAll, 0.25));
  const quantileHighPrice = mathFloor(d3.quantile(priceAll, 0.75));
  // const deviationPrice = mathFloor(d3.deviation(priceAll));

  textList.push("------------------------------------------------------------");
  textList.push(`${params.name}(${params.py}평)`);
  textList.push("매물수: " + itemCount);
  if (itemCount > 0) {
    textList.push(`가격: ${addComma(minPrice)} ~ ${addComma(maxPrice)}`);
    textList.push("평균값: " + addComma(avgPrice));
    textList.push("중앙값: " + addComma(medianPrice));
    textList.push("하위평균값: " + addComma(quantileLowPrice));
    textList.push("상위평균값: " + addComma(quantileHighPrice));
    // textList.push('표준편차: ' + addComma(deviationPrice));
  }
  // Create data
  const data = [
    params.name,
    params.py,
    params.complexNo,
    params.areaNos,
    params.tradeType,
    itemCount,
    minPrice || 0,
    maxPrice || 0,
    avgPrice || 0,
    medianPrice || 0,
    getToday().replaceAll("-", ""),
  ];
  dataList.push(data);
};
const saveData = (list) => {
  // UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'apt_info';
  db.serialize(function () {
    list.forEach((item) => {
      db.run(
        "INSERT INTO apt_info (name, py, complex_no, area_nos, trade_type, cnt, price_min, price_max, price_avg, price_median, dt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        item
      );
    });
  });
  db.close();
};

const getData = () => {
  db.serialize(function () {
    db.each("SELECT no, py FROM apt_info", function (err, row) {
      console.log(row);
    });
  });
  db.close();
};

const run = async () => {
  const tradeType = "A1";
  textList.push(
    `${getToday()}(네이버부동산, ${
      tradeType === "A1" ? "매매기준, 3개월내 입주가능 매물만" : "전세기준"
    })`
  );
  for (apt of getApts(tradeType)) {
    await getApt(apt);
  }
  let text = "";
  textList.forEach((t) => {
    text += t + "\n";
  });

  console.log(text);
  //makeFile(text);
  //saveData(dataList);
};

run();
