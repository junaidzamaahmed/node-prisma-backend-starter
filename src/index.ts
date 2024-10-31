import express, { Request, Response } from "express";
require("dotenv").config();
const cors = require("cors");

const PORT = process.env.PORT || 8000;
const app = express();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// GET REQUEST
app.get("/customers", async (req: Request, res: Response) => {
  const customers = [
    { name: "John Doe", email: "john.doe@example.com", phone: "+1234567890" },
    {
      name: "Joel Smith",
      email: "joel.smith@example.com",
      phone: "+0987654321",
    },
  ];

  res.status(200).json(customers);
});
