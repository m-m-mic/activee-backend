import express from "express";
import { Sport } from "../models/sports";
import { authenticateJWT } from "../middleware/authenticateJWT";

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

sportRoutes.get("/sport/:sportId", authenticateJWT, async (req, res) => {
  const id = req.params.sportId;
  try {
    const sport = await Sport.findOne({ _id: id });
    if (!sport) {
      return res.status(404).send("Sport not found");
    }
    return res.send(sport);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

sportRoutes.patch("/sport/dev", async (req, res) => {
  await Sport.updateMany({}, { description: { instruction: "no instruction given", history: "no history given" } });
  res.send("lol");
});
