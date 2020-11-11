const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("hi there after changes");
});

app.listen(8080, () => console.log("listenting"));
