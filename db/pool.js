const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'dev.thekeytech.co.kr',
  port: 4406,
  database: 'nuno',
  user: 'babel',
  password: 'babel000',
  connectionLimit: 5,
});
const getConnection = async () => {
  return await pool.getConnection(async (conn) => conn);
};
module.exports = { getConnection };
