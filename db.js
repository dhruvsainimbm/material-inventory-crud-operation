const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "materialdb",
  password: "Dhruv@1159", // change this
  port: 5432,
});

module.exports = pool;
