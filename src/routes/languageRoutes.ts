import express from "express";
import { Language } from "../models/languages";
import { denyChangeRequests } from "../index";

export const languageRoutes = express.Router();

// Lediglich dazu da, neue Sprachen in die Liste einzufügen. Nicht von Nutzern verwendet
languageRoutes.post("/language/", async (req, res) => {
  if (denyChangeRequests === "true") {
    return res.status(503).send("Change requests are disabled");
  } else {
    try {
      const newLanguage = new Language({ ...req.body });
      await newLanguage.save();
      return res.status(201).send(newLanguage);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  }
});

// GET-Request zum Aufrufen aller verfügbaren Sprachen
languageRoutes.get("/language/", async (req, res) => {
  try {
    const languages = await Language.find();
    return res.send(languages);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});
