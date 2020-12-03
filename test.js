const db = require('./batch/db.js');
const stats = require('./batch/stats.js');

const getRate = async () => {
  const rates = await db.getRate('4148000000');
  if (rates.length) {
    return rates[0].rate;
  }
  return null;
};
const run = async (ymd) => {
  const rate = await getRate();
  await stats.saveStats(ymd, rate);
};
let paramYmd = process.argv[2];
//run(paramYmd);

const run2 = async () => {
  for (ymd of ['20201203']) {
    await run(ymd);
  }
};
run2();
