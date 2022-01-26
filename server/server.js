require("dotenv").config();
const db = require("./db");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// third party middlwear
app.use(morgan("tiny"));

// get all restaurants
app.get("/api/v1/restaurants", async (req, res) => {
  const result = await db.query("SELECT * from restaurants");
  res.status(200).json({
    status: "success",
    data: {
      result,
    },
  });
});

// get a single restaurant
app.get("/api/v1/restaurants/:id", (req, res) => {
  console.log(req.params);
  res.status(200).json({
    status: "success",
    data: {
      restaurant: "wendys",
    },
  });
});

// create a new restaurant
app.post("/api/v1/restaurants", (req, res) => {
  console.log(req.body);
  res.status(201).json({
    status: "success",
    data: {
      restaurant: "wendys",
    },
  });
});

// update a new restaurant
app.put("/api/v1/restaurants/:id", (req, res) => {
  console.log(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      restaurant: "mcdonalds",
    },
  });
});

// delete a new restaurant
app.delete("/api/v1/restaurants/:id", (req, res) => {
  console.log(req.params.id);
  res.status(204).json({
    status: "success",
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
