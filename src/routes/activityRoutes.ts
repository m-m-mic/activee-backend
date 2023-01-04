import express from "express";
import { Activity } from "../models/activities";
import mongoose from "mongoose";
import { ActivityType } from "../interfaces";
import { getUserActivities, searchActivities } from "../scripts/activitiesScripts";
import { authenticatedRequest, authenticateJWT } from "../middleware/authenticateJWT";
import { Account } from "../models/accounts";

export const activityRoutes = express.Router();

// POST-Request zum Erstellen einer Aktivität
activityRoutes.post("/activity/", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  try {
    const newActivity = await new Activity({ ...req.body });
    await newActivity.save();
    await Account.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: {
          activities: {
            _id: newActivity.id,
            name: newActivity.name,
            sport: newActivity.sport,
          },
        },
      }
    );
    return res.status(201).send(newActivity);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request zum Abrufen aller Aktivitäten
activityRoutes.get("/activity/", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const type = authReq.account.type;
  try {
    const activities: ActivityType[] = await Activity.find();
    const userActivities = await getUserActivities(id, type, activities);
    if (userActivities) {
      return res.send(userActivities);
    } else {
      return res.status(401).send("Invalid account type");
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request zum Abrufen einer spezifischen Aktivität
activityRoutes.get("/activity/:activityId", authenticateJWT, async (req, res) => {
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
activityRoutes.patch("/activity/:activityId", authenticateJWT, async (req, res) => {
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

activityRoutes.delete("/activity/:activityId", authenticateJWT, async (req, res) => {
  const id = req.params.activityId;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const deleted = await Activity.findOneAndDelete({ _id: id });
      if (!deleted) {
        return res.status(404).send("Activity not found");
      }
      return res.send(`Successfully deleted activity ${deleted._id}`);
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
