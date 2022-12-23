import express from "express";
import { RequiredItem } from "../models/requiredItems";

export const requiredItemRoutes = express.Router();

// Lediglich dazu da, neue Gegenstände in die Liste einzufügen. Nicht von Nutzern verwendet
requiredItemRoutes.post("/required-item/", async (req, res) => {
  try {
    const newItem = new RequiredItem({ ...req.body });
    await newItem.save();
    return res.status(201).send(newItem);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

requiredItemRoutes.get("/required-item/", async (req, res) => {
  try {
    const requiredItems = await RequiredItem.find();
    return res.send(requiredItems);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});
