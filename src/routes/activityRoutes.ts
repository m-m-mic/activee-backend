import express from "express";
import { Activity } from "../models/activities";
import mongoose from "mongoose";
import { ActivityType } from "../interfaces";
import { searchActivities } from "../scripts/activitiesScripts";

export const activityRoutes = express.Router();

// POST-Request zum Erstellen einer Aktivität
activityRoutes.post("/activity/", async (req, res) => {
  try {
    const newActivity = new Activity({ ...req.body });
    await newActivity.save();
    return res.status(201).send(newActivity);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request zum Abrufen aller Aktivitäten
activityRoutes.get("/activity/", async (req, res) => {
  try {
    const activityList = await Activity.find();
    return res.send(activityList);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request zum Abrufen einer spezifischen Aktivität
activityRoutes.get("/activity/:activityId", async (req, res) => {
  const id = req.params.activityId;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const requestedActivity = await Activity.findOne({ _id: id });
      if (!requestedActivity) {
        return res.status(404).send("Activity not found");
      }
      res.send(requestedActivity);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  } else {
    return res.status(403).send("Invalid activity id");
  }
});

// PATCH-Request zum Aktualisieren einer Aktivität
activityRoutes.patch("/activity/:activityId", async (req, res) => {
  const updatedActivity = req.body;
  const id = req.params.activityId;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const updated = await Activity.findOneAndUpdate({ _id: id }, updatedActivity, { new: true, runValidators: true });
      if (!updated) {
        return res.status(404).send("Activity not found");
      }
      return res.send(updated);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  } else {
    return res.status(403).send("Invalid activity id");
  }
});

// GET-Request von Aktivitäten anhand von Suchbegriff
activityRoutes.get("/search/:query", async (req, res) => {
  const searchQuery: string = req.params.query.toLowerCase();
  try {
    const activitiesList: ActivityType[] = await Activity.find();
    res.send(searchActivities(searchQuery, activitiesList));
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});
