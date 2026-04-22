const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://ca92c12f6081db7cf1cbe82f93bfe19e6db7486c099529b212f3554d8fd2781f:sk_pixOylR1L-gUQPOTn6z_U@db.prisma.io:5432/postgres?sslmode=require',
});

async function main() {
  try {
    const res = await pool.query('SELECT * FROM sessions LIMIT 1');
    console.log("Sessions:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
main();
