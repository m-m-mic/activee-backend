import express from "express";
import { Sport } from "../models/sports";

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
sportRoutes.get("/sport/", async (req, res) => {
  try {
    const sports = await Sport.find();
    return res.send(sports);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});
