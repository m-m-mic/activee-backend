import cors from "cors";
import express from "express";
import { addActivity, getActivities, getActivityById, searchActivities, updateActivityById } from "./initialActivity";
import { addAccount, getAccount } from "./Account";
const app = express();
const port = 1337;

app.use(cors());

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/account/new", (req, res) => {
  const initialAccount = req.body;
  const account = addAccount(initialAccount);
  if (account === null) {
    res.status(403).end();
  } else {
    res.json(account).send();
  }
});
app.post("/account/", (req, res) => {
  const credentials = req.body;
  const account = getAccount(credentials.email, credentials.password);
  if (account === null) {
    res.status(404).end();
  } else {
    res.json(account).send();
  }
});
app.post("/activity/", (req, res) => {
  const activity = req.body;
  const activityId = addActivity(activity);
  res.json({ activityId }).send();
});
app.get("/activity/", (req, res) => {
  res.json(getActivities()).send();
});
app.get("/activity/:activityId", (req, res) => {
  const activity = getActivityById(req.params.activityId);
  if (activity === null) {
    res.status(404).end();
  } else {
    res.json(activity).send();
  }
});
app.put("/activity/:activityId", (req, res) => {
  const updatedActivity = req.body;
  const activityId = updateActivityById(req.params.activityId, updatedActivity);
  if (activityId === null) {
    res.status(404).end();
  } else {
    res.json({ activityId }).send();
  }
});
app.get("/search/:query", (req, res) => {
  const searchQuery: string = req.params.query.toLowerCase();
  res.json(searchActivities(searchQuery));
});
app.listen(port, () => {
  console.log(`activee backend listening on port ${port}`);
});
