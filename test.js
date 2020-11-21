const db = require('./batch/db.js');
const stats = require('./batch/stats.js');

const getRate = async () => {
  const rates = await db.getRate('4148000000');
  if (rates.length) {
    return rates[0].rate;
  }
  return null;
};
const run = async () => {
  const rate = await getRate();
  const ymd = '20201116';
  await stats.saveStats(ymd, rate);
};
// run();
