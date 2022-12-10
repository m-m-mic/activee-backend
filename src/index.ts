import cors from "cors";
import express, { Request, Response } from "express";
import { addActivity, getActivities, getActivityById, searchActivities, updateActivityById } from "./initialActivity";
import { registerAccount, loginAccount, getAccountById, updateAccountById } from "./Account";
import jwt from "jsonwebtoken";
import { authenticateJWT, authenticatedRequest } from "./middleware/authenticateJWT";
import dotenv from "dotenv";

const app = express();
const port = 1337;

dotenv.config();
export const secretToken = process.env.SECRET_TOKEN;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/account/register", (req, res) => {
  const initialAccount = req.body;
  const account = registerAccount(initialAccount);
  if (account === null) {
    res.status(403).end();
  } else {
    const accessToken = jwt.sign({ id: account.id, type: account.type }, secretToken);
    res.json({ token: accessToken, id: account.id, type: account.type }).send();
  }
});
app.post("/account/login", (req, res) => {
  const credentials = req.body;
  const account = loginAccount(credentials.email, credentials.password);
  if (account === null) {
    res.status(404).end();
  } else {
    const accessToken = jwt.sign({ id: account.id, type: account.type }, secretToken);
    res.json({ token: accessToken, id: account.id, type: account.type }).send();
  }
});
app.get("/account/info", authenticateJWT, (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const account = getAccountById(id);
  res.json(account).send();
});
app.post("/account/info", authenticateJWT, (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const updatedAccount = authReq.body;
  const account = updateAccountById(id, updatedAccount);
  if (account === null) {
    res.status(500).end();
  } else {
    res.status(200).end();
  }
});
app.post("/activity/", (req, res) => {
  const activity = req.body;
  const activityId = addActivity(activity);
  res.json({ activityId }).send();
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
app.listen(port, () => {
  console.log(`activee backend listening on port ${port}`);
});
