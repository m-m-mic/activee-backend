import cors from "cors";
import express from "express";
import { addActivity, getActivities, getActivityById, updateActivityById } from "./initialActivity";
const app = express();
const port = 1337;

app.use(cors());

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/activity/", (req, res) => {
  const activity = req.body;
  const activityId = addActivity(activity);
  res.status(200).json({ activityId }).send();
});
app.get("/activity/", (req, res) => {
  res.json(getActivities()).send();
});
app.get("/activity/:activityId", (req, res) => {
  const activity = getActivityById(Number(req.params.activityId));
  if (activity === null) {
    res.status(404).end();
  } else {
    res.json(activity).send();
  }
});
app.put("/activity/:activityId", (req, res) => {
  const updatedActivity = req.body;
  const activityId = updateActivityById(Number(req.params.activityId), updatedActivity);
  if (activityId === null) {
    res.status(404).end();
  } else {
    res.json({ activityId }).send();
  }
});
app.listen(port, () => {
  console.log(`activee backend listening on port ${port}`);
});
