const express = require("express");
const bodyParser = require("body-parser");
const redis = require("redis");
const keys = require("./keys");
const cors = require("cors");
const { Pool } = require("pg");

// express setup

const app = express();
app.use(cors());
app.use(bodyParser.json());

// pg setup

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("error", () => console.log("lost connection to db"));

pgClient.on("connect", () => {
  pgClient
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.log(err));
});

// redis setup

const client = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = client.duplicate();

// route handlers
app.get("/", (req, res) => {
  res.send("hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  client.hgetall("values", (err, values) => {
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;
  if (parseInt(index) > 40) return res.status(422).send("too high");
  client.hset("values", index, "nothing yet!");
  redisPublisher.publish("insert", index);
  pgClient.query(`INSERT INTO values(number) VALUES($1)`, [index]);
  res.send({ working: true });
});

app.listen(5000, (err) => console.log("listening 5000dsada"));
