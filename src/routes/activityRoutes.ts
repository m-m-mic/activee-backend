import express from "express";
import { Activity } from "../models/activities";
import mongoose from "mongoose";
import { ActivityType } from "../interfaces";
import { searchActivities } from "../scripts/activitiesScripts";
import { authenticatedRequest, authenticateJWT } from "../middleware/authenticateJWT";
import { Account } from "../models/accounts";

export const activityRoutes = express.Router();

// POST-Request zum Erstellen einer Aktivität
activityRoutes.post("/activity/", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  try {
    // Neue Aktivität wird erstellt und gespeichert
    const newActivity = await new Activity({ ...req.body });
    await newActivity.save();
    // Daten der neuen Aktivität werden in die activities Liste des Übungsleiters geschrieben
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
    // Neue Aktivität wird zurückgegeben
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
    let userActivities;
    if (type === "participant") {
      // Liste aller Aktivitäten, welche die Nutzer id in der Liste "participants" beinhalten, werden zurückgegeben
      userActivities = await Activity.find({ "participants._id": id });
    } else if (type === "organisation") {
      // Liste aller Aktivitäten, welche die Nutzer id in der Liste "trainers" beinhalten, werden zurückgegeben
      userActivities = await Activity.find({ "trainers._id": id });
    }
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
      // Name der Aktivität wird in der "activities" Liste aller verbundenen Teilnehmer und Übungsleiter aktualisiert
      await Account.updateMany({ "activities._id": id }, { $set: { "activities.$.name": updated.name } });
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

// DELETE-Request zum Löschen einer Aktivität
activityRoutes.delete("/activity/:activityId", authenticateJWT, async (req, res) => {
  const activityId = req.params.activityId;
  if (mongoose.Types.ObjectId.isValid(activityId)) {
    try {
      const deleted = await Activity.findOneAndDelete({ _id: activityId });
      if (!deleted) {
        return res.status(404).send("Activity not found");
      }
      // Aktivität wird aus der "activities" Liste aller verbundenen Teilnehmer und Übungsleiter entfernt
      await Account.updateMany({ "activities._id": activityId }, { $pull: { activities: { _id: activityId } } });
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
