const query = () => {
  const ymds = [];
  for (let i = 20201201; i < 20201232; i++) {
    ymds.push(i);
  }
  for (let i = 20210101; i < 20210115; i++) {
    ymds.push(i);
  }
  let sql = '';
  ymds.forEach((ymd) => {
    sql += `SELECT '${ymd}' AS '일자', COUNT(*) AS '매물수' FROM article WHERE ymd = ${ymd} and trade_type = @trade_type AND filter_type = @filter_type UNION ALL\n`;
    // sql += `SELECT '${ymd}' AS '일자', COUNT(*) AS '매물수' FROM article WHERE ymd = ${ymd} and trade_type = @trade_type UNION ALL\n`;
  });
  console.log(sql);
};
query();
