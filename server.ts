import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

app.use(express.json());
app.use(cors());

async function fetchDiscordNames(userId: string): Promise<string | null> {
    try {
        const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch Discord user ${userId}: `, response.status);
            return null;
        }

        const data = (await response.json()) as { global_name?: string; username?: string };

        return data.global_name || data.username || "Unknown";
    } catch (error) {
        console.log(`Error fetching Discord username: `, error);
        return null;
    }
}

app.get("/api/users", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(`SELECT * FROM users LIMIT 20`);

        const users = [...(rows as { user_id: string; pp_cash: number; refer_tickets: number; total_purchases: number; total_referred: number; spv: number }[])];

        const usersWithNames = await Promise.all(
            users.map(async (user) => {
                const username = await fetchDiscordNames(user.user_id);
                return { ...user, username: username || "Unknown" };
            })
        );

        res.json(usersWithNames);
    } catch (error) {
        console.error("Error fetching users: ", error);
        res.status(500).json({ error: "Failed to fetch users" });
    } finally {
        if (connection) connection.release();
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
