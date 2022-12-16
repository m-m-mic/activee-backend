import cors from "cors";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { searchActivities } from "./initialActivity";
import {
  registerAccount,
  loginAccount,
  getAccountById,
  updateAccountById,
  getAccountListById,
  changeProfileById,
} from "./Account";
import jwt from "jsonwebtoken";
import { authenticateJWT, authenticatedRequest } from "./middleware/authenticateJWT";
import dotenv from "dotenv";
import { Activity } from "./models/activities";

const app = express();
const port = 3033;
dotenv.config();
export const secretToken = process.env.SECRET_TOKEN;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const start = async () => {
  try {
    await mongoose.connect("mongodb+srv://admin:CYbHBuTWEG4mOlhR@activee.l1w6o4b.mongodb.net/activee-db");
    console.log("Connection to mongoDB successful");
    app.listen(port, () => {
      console.log(`activee backend listening on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

app.post("/account/register", (req, res) => {
  const initialAccount = req.body;
  const account = registerAccount(initialAccount);
  if (account === null) {
    res.status(403).end();
  } else {
    const accessToken = jwt.sign({ id: account.id, type: account.type }, secretToken);
    res.json({ token: accessToken, id: account.id, type: account.type, tier: account.tier }).send();
  }
});
app.post("/account/login", (req, res) => {
  const credentials = req.body;
  const account = loginAccount(credentials.email, credentials.password);
  if (account === null) {
    res.status(404).end();
  } else {
    const accessToken = jwt.sign({ id: account.id, type: account.type }, secretToken);
    res.json({ token: accessToken, id: account.id, type: account.type, tier: account.tier }).send();
  }
});
app.get("/account/info", authenticateJWT, (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const account = getAccountById(id);
  res.json(account).send();
});
app.put("/account/info", authenticateJWT, (req: Request, res: Response) => {
  const updatedAccount = req.body;
  console.log(updatedAccount);
  const account = updateAccountById(updatedAccount);
  if (account === null) {
    res.status(500).end();
  } else {
    res.json(account).send();
  }
});
app.get("/account/account-list", authenticateJWT, (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const accountList = getAccountListById(id);
  console.log(accountList);
  if (accountList === null) {
    res.status(500).end();
  } else {
    res.json(accountList).send();
  }
});
app.post("/account/change-profile", authenticateJWT, (req, res) => {
  const accountId = req.body.id;
  console.log(accountId);
  const account = changeProfileById(accountId);
  if (account === null) {
    res.status(404).end();
  } else {
    const accessToken = jwt.sign({ id: account.id, type: account.type }, secretToken);
    res.json({ token: accessToken, id: account.id, type: account.type, tier: account.tier }).send();
  }
});
app.post("/activity/", async (req, res) => {
  const newActivity = new Activity({ ...req.body });
  const insertedActivity = await newActivity.save().catch((err) => err);
  return res.status(201).json(insertedActivity);
});
app.get("/activity/", async (req, res) => {
  const activitiesList = await Activity.find();
  return res.status(200).json(activitiesList);
});
app.get("/activity/:activityId", async (req, res) => {
  const id = req.params.activityId;
  const activity = await Activity.findById(id).catch((err) => err);
  return res.status(200).json(activity);
});
app.put("/activity/:activityId", async (req, res) => {
  const updatedActivity = req.body;
  const id = req.params.activityId;
  await Activity.updateOne({ id }, updatedActivity);
  const activity = await Activity.findById(id).catch((err) => err);
  return res.status(200).json(activity);
});
app.get("/search/:query", async (req, res) => {
  const searchQuery: string = req.params.query.toLowerCase();
  const activitiesList = await Activity.find();
  res.json(searchActivities(searchQuery, activitiesList)).send();
});
