import cors from "cors";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { searchActivities } from "./scripts/activitiesScripts";
import { getAccountListById } from "./scripts/accountScripts";
import jwt from "jsonwebtoken";
import { authenticateJWT, authenticatedRequest } from "./middleware/authenticateJWT";
import dotenv from "dotenv";
import { Activity } from "./models/activities";
import { Account } from "./models/accounts";
import { AccountType, ActivityType } from "./interfaces";

const app = express();
const port = 3033;
dotenv.config();
export const secretToken = process.env.SECRET_TOKEN;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const connectAndStartBackend = async () => {
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

connectAndStartBackend();

app.post("/account/register", async (req, res) => {
  Account.findOne({ email: req.body.email }).then((account) => {
    if (account) {
      return res.status(400).end();
    } else {
      const newAccount = new Account({ ...req.body });
      newAccount.save();
      const accessToken = jwt.sign({ id: newAccount.id, type: newAccount.type }, secretToken);
      return res.json({
        token: accessToken,
        id: newAccount.id,
        type: newAccount.type,
        tier: newAccount.tier,
      });
    }
  });
});
app.post("/account/login", (req, res) => {
  const credentials = req.body;
  Account.findOne({ email: credentials.email, password: credentials.password }).then((account) => {
    if (account) {
      const accessToken = jwt.sign({ id: account.id, type: account.type }, secretToken);
      return res.json({
        token: accessToken,
        id: account.id,
        type: account.type,
        tier: account.tier,
      });
    } else {
      return res.status(404).end();
    }
  });
});
app.get("/account/info", authenticateJWT, (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  Account.findOne({ _id: id }).then((account) => {
    if (account) {
      return res.send(account);
    } else {
      return res.status(404).end();
    }
  });
});
app.put("/account/info", authenticateJWT, (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const updatedAccount = req.body;
  console.log(updatedAccount);
  Account.updateOne({ _id: id }, updatedAccount).then((account) => {
    if (account) {
      res.send(account);
    } else {
      return res.status(404).end();
    }
  });
});
app.get("/account/account-list", authenticateJWT, async (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const accounts: AccountType[] = await Account.find();
  const accountList = getAccountListById(id, accounts);
  console.log(accountList);
  if (accountList === null) {
    res.status(500).end();
  } else {
    res.send(accountList);
  }
});

// FUNKTIONIERT NOCH NICHT RICHTIG
app.post("/account/create-profile", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  let newProfile = req.body;
  const newAccount = new Account({ ...newProfile });
  newAccount.save().then((account) => {
    newProfile = account;
  });
  await Account.updateOne(
    { id },
    {
      $addToSet: { related_accounts: { _id: newProfile.id, first_name: newProfile.first_name, last_name: newProfile.last_name } },
    }
  );
  const accessToken = await jwt.sign({ id: newProfile.id, type: newProfile.type }, secretToken);
  return res.json({
    token: accessToken,
    id: newProfile.id,
    type: newProfile.type,
    tier: newProfile.tier,
  });
});
app.post("/account/change-profile", authenticateJWT, (req, res) => {
  const accountId = req.body.id;
  console.log(accountId);
  Account.findOne({ _id: accountId }).then((account) => {
    if (account) {
      const accessToken = jwt.sign({ id: account.id, type: account.type }, secretToken);
      return res.json({
        token: accessToken,
        id: account.id,
        type: account.type,
        tier: account.tier,
      });
    } else {
      return res.status(404).end();
    }
  });
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
  const activitiesList: ActivityType[] = await Activity.find();
  res.send(searchActivities(searchQuery, activitiesList));
});
