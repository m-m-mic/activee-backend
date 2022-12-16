import cors from "cors";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { addActivity, getActivities, getActivityById, searchActivities, updateActivityById } from "./initialActivity";
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
  const insertedActivity = await newActivity.save();
  return res.status(201).json(insertedActivity);
});
app.get("/activity/", (req, res) => {
  res.json(getActivities()).send();
});
app.get("/activity/:activityId", (req, res) => {
  const activity = getActivityById(req.params.activityId);
  if (activity === null) {
    res.status(404).end();
  } else {
    res.json(activity).send();
  }
});
app.put("/activity/:activityId", (req, res) => {
  const updatedActivity = req.body;
  const activityId = updateActivityById(req.params.activityId, updatedActivity);
  if (activityId === null) {
    res.status(404).end();
  } else {
    res.json({ activityId }).send();
  }
});
app.get("/search/:query", (req, res) => {
  const searchQuery: string = req.params.query.toLowerCase();
  res.json(searchActivities(searchQuery));
});
