const db = require('./db/rate.js');
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
const runYmds = async () => {
  for (ymd of ['20210131']) {
    await run(ymd);
  }
};
runYmds();
