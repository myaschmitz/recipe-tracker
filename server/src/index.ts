import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(bodyParser.json());

// Example route
app.get("/recipes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipe");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
