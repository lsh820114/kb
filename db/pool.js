/**
 *
 * DB Pool
 *
 */
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'dev.thekeytech.co.kr',
  port: 4406,
  database: 'test',
  user: 'lsh820114',
  password: 'tmdghks11',
  connectionLimit: 5,
  multipleStatements: true,
});
const getConnection = async () => {
  return await pool.getConnection(async (conn) => conn);
};
module.exports = { getConnection };
