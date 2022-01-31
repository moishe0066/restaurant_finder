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
  try {
    res.status(200).json({
      status: "success",
      results: result.rows.length,
      data: {
        restaurants: result.rows,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

// get a single restaurant
app.get("/api/v1/restaurants/:id", async (req, res) => {
  try {
    const restaurants = await db.query(
      `select * from restaurants where id = $1`,
      [req.params.id]
    );

    const reviews = await db.query(
      `select * from reviews where restaurant_id = $1`,
      [req.params.id]
    );
    res.status(200).json({
      status: "success",
      data: {
        restaurant: restaurants.rows[0],
        reviews: reviews.rows,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

// create a new restaurant
app.post("/api/v1/restaurants", async (req, res) => {
  try {
    const result = await db.query(
      "insert into restaurants (name, location, price_range) values ($1, $2, $3) returning *",
      [req.body.name, req.body.location, req.body.price_range]
    );
    console.log(result.rows[0]);
    res.status(201).json({
      status: "success",
      data: {
        restaurant: result.rows[0],
      },
    });
  } catch (error) {
    console.log(error);
  }
});

// update a new restaurant
app.put("/api/v1/restaurants/:id", async (req, res) => {
  const { name, location, price_range } = req.body;
  const { id } = req.params;
  try {
    const result = await db.query(
      "UPDATE restaurants SET name = $1, location = $2, price_range = $3 WHERE id =  $4 returning *",
      [name, location, price_range, id]
    );
    console.log(result.rows[0]);
    res.status(200).json({
      status: "success",
      data: {
        restaurant: result.rows[0],
      },
    });
  } catch (error) {
    console.log(error);
  }
});

// delete a new restaurant
app.delete("/api/v1/restaurants/:id", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM restaurants WHERE id = $1", [
      req.params.id,
    ]);
    console.log(result);
    res.status(204).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
