import express from "express";
import { Activity } from "../models/activities";
import mongoose from "mongoose";
import { ActivityType } from "../interfaces";
import { constructPreferenceModel, deleteDuplicateEntries, searchActivities, shuffleArray } from "../scripts/activitiesScripts";
import { authenticatedRequest, authenticateJWT } from "../middleware/authenticateJWT";
import { Account } from "../models/accounts";
import { checkForJWT } from "../middleware/checkForJWT";
import { Sport } from "../models/sports";

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
          activities: newActivity._id,
        },
      }
    );
    await Sport.findOneAndUpdate({ _id: newActivity.sport }, { $addToSet: { activities: newActivity._id } });
    // Neue Aktivität wird zurückgegeben
    return res.status(201).send(newActivity);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request zum Abrufen aller Empfehlungen für einen Nutzer
activityRoutes.get("/activity/recommendations", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const page: number = parseInt(<string>authReq.query.page) || 0;
  const limit: number = parseInt(<string>authReq.query.limit) || 15;
  try {
    let response;
    response = { last_page: false };
    const account = await Account.findOne({ _id: id });
    const model = constructPreferenceModel(account, id);
    let activities = await Activity.find(model).populate("sport", "id name");
    const totalRecommendations = activities.length;
    const startIndex = page * limit;
    const endIndex = (page + 1) * limit;
    if (endIndex >= totalRecommendations) {
      response.last_page = true;
    }
    activities = activities.slice(startIndex, endIndex);
    response = { ...response, activities: activities };
    res.send(response);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

activityRoutes.get("/activity/recommendations/shortened", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  try {
    const account = await Account.findOne({ _id: id });
    const model = constructPreferenceModel(account, id);
    console.log(model);
    let activities = await Activity.find(model).populate("sport", "id name");
    activities = shuffleArray(activities);
    res.send(activities.slice(0, 8));
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

activityRoutes.get("/activity/club", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const page: number = parseInt(<string>authReq.query.page) || 0;
  const limit: number = parseInt(<string>authReq.query.limit) || 15;
  try {
    const account = await Account.findOne({ _id: id });
    if (account) {
      let response;
      response = { last_page: false };
      let activities = await Activity.find({ club: account.club, "trainers._id": { $nin: id } }).populate("sport", "id name");
      const totalResults = activities.length;
      const startIndex = page * limit;
      const endIndex = (page + 1) * limit;
      if (endIndex >= totalResults) {
        response.last_page = true;
      }
      activities = activities.slice(startIndex, endIndex);
      response = { ...response, activities: activities };
      res.send(response);
    } else {
      res.status(404).send("Account not found");
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

activityRoutes.get("/activity/club/shortened", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  try {
    const account = await Account.findOne({ _id: id });
    if (account) {
      let activities = await Activity.find({ club: account.club, "trainers._id": { $nin: id } }).populate("sport", "id name");
      activities = shuffleArray(activities);
      res.send(activities.slice(0, 8));
    } else {
      res.status(404).send("Account not found");
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request zum Abrufen einer spezifischen Aktivität
activityRoutes.get("/activity/:activityId", checkForJWT, async (req, res) => {
  const authReq = req as unknown as authenticatedRequest;
  const id = authReq.params.activityId;
  if (authReq.account) {
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
  } else {
    if (mongoose.Types.ObjectId.isValid(id)) {
      try {
        const requestedActivity = await Activity.findOne(
          { _id: id, only_logged_in: false },
          {
            maximum_participants: false,
            dates: false,
            address: false,
            trainers: false,
            participants: false,
            only_logged_in: false,
          }
        );
        if (!requestedActivity) {
          return res.status(404).send("Activity not found");
        }
        res.send(requestedActivity);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return res.status(400).send(error.message);
      }
    }
  }
});

// PATCH-Request zum Aktualisieren einer Aktivität
activityRoutes.patch("/activity/:activityId", authenticateJWT, async (req, res) => {
  const authReq = req as unknown as authenticatedRequest;
  const updatedActivity = authReq.body;
  const accountId = authReq.account.id;
  const activityId = authReq.params.activityId;
  if (mongoose.Types.ObjectId.isValid(activityId)) {
    try {
      const updated = await Activity.findOneAndUpdate({ _id: activityId, "trainers._id": accountId }, updatedActivity, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        return res.status(404).send("Cannot access activity");
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

activityRoutes.patch("/activity/:activityId/save", authenticateJWT, async (req, res) => {
  const accounts = req.body.accounts;
  const activityId = req.params.activityId;
  if (mongoose.Types.ObjectId.isValid(activityId)) {
    try {
      let response = "";
      const activity = await Activity.findOne({ _id: activityId });
      if (activity) {
        for (const accountId of accounts) {
          if (activity.participants.includes(accountId)) {
            const index = activity.participants.indexOf(accountId);
            activity.participants.splice(index, 1);
            await Account.updateOne(
              { _id: accountId },
              {
                $pull: { activities: activityId },
              },
              {
                runValidators: true,
              }
            ).then(() => (response += `deleted account id ${accountId} from activity id ${activityId}\n`));
          } else {
            activity.participants.push(accountId);
            await Account.updateOne(
              { _id: accountId },
              {
                $addToSet: { activities: activityId },
              },
              {
                runValidators: true,
              }
            ).then(() => (response += `added account id ${accountId} from activity id ${activityId}\n`));
          }
        }
        activity.save();
        res.send(response);
      } else {
        res.status(404).send("Activity not found");
      }
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
  const id = req.params.activityId;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const deleted = await Activity.findOneAndDelete({ _id: id });
      if (!deleted) {
        return res.status(404).send("Activity not found");
      }
      // Aktivität wird aus allen angemeldeten Accounts gelöscht
      await Account.updateMany({ activities: id }, { $pull: { activities: id } });
      // Aktivität wird aus verbundener Sportart gelöscht
      await Sport.updateOne({ activities: id }, { $pull: { activities: id } });
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
activityRoutes.get("/search/:query", checkForJWT, async (req, res) => {
  const authReq = req as unknown as authenticatedRequest;
  const page: number = parseInt(<string>authReq.query.page) || 0;
  const limit: number = parseInt(<string>authReq.query.limit) || 15;
  if (authReq.account) {
    const id = authReq.account.id;
    const searchQuery: string = authReq.params.query.toLowerCase();
    try {
      let response;
      response = { last_page: false };
      const account = await Account.findOne({ _id: id });
      const preferredActivities: ActivityType[] = await Activity.find(constructPreferenceModel(account, null), {
        only_logged_in: false,
        participants: false,
        trainers: false,
        requirements: false,
        required_items: false,
        additional_info: false,
        maximum_participants: false,
        membership_fee: false,
      });
      const allActivities: ActivityType[] = await Activity.find(
        {},
        {
          only_logged_in: false,
          participants: false,
          trainers: false,
          requirements: false,
          required_items: false,
          additional_info: false,
          maximum_participants: false,
          membership_fee: false,
        }
      ).populate("sport", "id name");
      const cleanedActivitiesList = await deleteDuplicateEntries(preferredActivities, allActivities);
      const sortedActivities = preferredActivities.concat(cleanedActivitiesList);
      let activities = searchActivities(searchQuery, sortedActivities);
      const totalResults = activities.length;
      const startIndex = page * limit;
      const endIndex = (page + 1) * limit;
      if (endIndex >= totalResults) {
        response.last_page = true;
      }
      activities = activities.slice(startIndex, endIndex);
      response = { ...response, activities: activities };
      res.send(response);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  } else {
    const searchQuery: string = authReq.params.query.toLowerCase();
    try {
      const activitiesList: ActivityType[] = await Activity.find({ only_logged_in: false });
      res.send(searchActivities(searchQuery, activitiesList));
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  }
});
