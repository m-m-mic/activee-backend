import express from "express";
import { helloWorld } from "./hello";
const app = express();
const port = 3000;

helloWorld();
app.get("/", (req, res) => {
  res.send("Hello World!");
  req.header
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
