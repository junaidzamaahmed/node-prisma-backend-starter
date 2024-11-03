import express from "express";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
var cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("The API is working");
});
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);

export default app;
