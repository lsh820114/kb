const hasStr = (excludeStr = [], text = '') => {
  return excludeStr.some((item) => {
    return text.indexOf(item) > -1;
  });
};

const article = {
  articleDesc: '',
  floor: '고',
};
const excludeStr = ['전세', '월세', '세안고', '세끼고']; // 매물 포함 제외 문자
const excludeFloor = ['저', '중', '고']; // 층수 미표시는 제외함
//if (article.articleDesc) {
if (hasStr(excludeStr, article.articleDesc)) {
  console.log('true');
} else {
  console.log('false');
}
//}
