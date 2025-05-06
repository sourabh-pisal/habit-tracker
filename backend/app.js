import "dotenv/config";
import express from "express";
import cors from "cors";
import habitRoutes from "./routes/habits.js";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.use("/api/habits", habitRoutes);

app.listen(port, () => { });
