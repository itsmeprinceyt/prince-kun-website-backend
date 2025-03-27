import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import chalk from "chalk";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function initDB() {
    try {
        const connection = await pool.getConnection();
        console.log(chalk.green(`[ DATABASE ] ✅ Database connected successfully !`));
        connection.release();
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}

initDB().catch(console.error);

export default pool;
