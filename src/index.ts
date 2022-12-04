import express from "express";
import { helloWorld } from "./hello";
const app = express();
const port = 1337;

helloWorld();
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
