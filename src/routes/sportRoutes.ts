import express from "express";
import { Sport } from "../models/sports";
import { authenticatedRequest, authenticateJWT } from "../middleware/authenticateJWT";
import { Account } from "../models/accounts";
import { shuffleArray } from "../scripts/activitiesScripts";
import { SportType } from "../interfaces";

export const sportRoutes = express.Router();

// Lediglich dazu da, neue Gegenstände in die Liste einzufügen. Nicht von Nutzern verwendet
sportRoutes.post("/sport/", async (req, res) => {
  try {
    const newSport = new Sport({ ...req.body });
    await newSport.save();
    return res.status(201).send(newSport);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request zum Aufrufen aller verfügbaren Sportarten
sportRoutes.get("/sport/", authenticateJWT, async (req, res) => {
  try {
    const sports = await Sport.find().sort({ name: 1 });
    return res.send(sports);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET Request für eine spezifische Sportart anhand von ID mit 6 Sportarten als Auswahl
sportRoutes.get("/sport/:sportId", authenticateJWT, async (req, res) => {
  const id = req.params.sportId;
  try {
    const sport = await Sport.findOne({ _id: id }).populate({
      path: "activities",
      populate: { path: "sport", model: "Sport", select: "id name" },
      select: "id name sport dates",
    });
    if (!sport) {
      return res.status(404).send("Sport not found");
    }
    // Liste an Sportarten wird geshuffled und auf 6 reduziert
    sport.activities = shuffleArray(sport.activities);
    sport.activities = sport.activities.slice(0, 6);
    return res.send(sport);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request für die Startseite von angemeldeten Nutzern. Gibt die bevorzugten Aktivitäten des Nutzers und potenziell
// Empfehlungen zurück
sportRoutes.get("/curated/sport", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  try {
    const account = await Account.findOne({ _id: id }).populate("sports", "id name");
    if (account) {
      let sports = account.sports;
      if (sports.length < 4) {
        // Wenn der Nutzer weniger als 4 Vorlieben hat, werden Empfehlungen angefügt
        const sportIds: string[] = [];
        for (const sport of sports) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          sportIds.push(sport._id);
        }
        const otherSports = await Sport.find({ _id: { $nin: sportIds } }, { _id: true, name: true });
        sports = sports.concat(shuffleArray(otherSports));
        // Liste wird auf 4 Einträge reduziert
        res.send(sports.slice(0, 4));
      } else {
        sports = shuffleArray(sports);
        res.send(sports.slice(0, 4));
      }
    } else {
      res.status(404).send("Account not found");
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request für vier zufällige Sportarten mit vier zufälligen Aktivitäten
sportRoutes.get("/landing-page", async (req, res) => {
  try {
    let sports = await Sport.find({}, { description: false, __v: false }).populate({
      path: "activities",
      populate: { path: "sport", model: "Sport", select: "id name" },
      match: { only_logged_in: false },
      select: "id name sport",
    });
    console.log(sports);
    sports = shuffleArray(sports);
    sports = sports.slice(0, 4);
    for (let i = 0; i < sports.length; i++) {
      const sport = sports[i];
      let activities = sport.activities;
      activities = shuffleArray(activities);
      activities = activities.slice(0, 4);
      sports[i].activities = activities;
    }
    res.send(sports);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});
