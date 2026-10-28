import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "InahuyShop API is running",
  });
});

app.listen(PORT, () => {
  console.log(`InahuyShop API running on port ${PORT}`);
});
