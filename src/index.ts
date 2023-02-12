import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { activityRoutes } from "./routes/activityRoutes";
import { accountRoutes } from "./routes/accountRoutes";
import { languageRoutes } from "./routes/languageRoutes";
import { requiredItemRoutes } from "./routes/requiredItemRoutes";
import { sportRoutes } from "./routes/sportRoutes";

const app = express();
const port = 3033;
dotenv.config();

// SecretToken wird verwendet, um JsonWebToken zu generieren
export const secretToken = process.env.SECRET_TOKEN;
// URL zur Datenbank
const mongoDbUrl: string = process.env.MONGODB_URL as string;

export const denyChangeRequests = process.env.DENY_CHANGE_REQUEST;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
mongoose.set("strictQuery", true);

const connectAndStartBackend = async () => {
  try {
    await mongoose.connect(mongoDbUrl);
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

// Health Check für Render.com deployment
app.use("/health-check", (req, res) => {
  res.status(200).send("activee api running.");
});
// ROUTES Importe für die verschiedene Collections
app.use(accountRoutes);
app.use(activityRoutes);
app.use(languageRoutes);
app.use(requiredItemRoutes);
app.use(sportRoutes);
