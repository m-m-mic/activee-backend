import { Account } from "../models/accounts";
import { authenticatedRequest, authenticateJWT } from "../middleware/authenticateJWT";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { AccountType } from "../interfaces";
import { getAccountListById } from "../scripts/accountScripts";
import { secretToken } from "../index";

export const accountRoutes = express.Router();

// POST-Request für Registrierung/Neuerstellung eines Accounts
accountRoutes.post("/account/register", async (req, res) => {
  try {
    const newAccount = new Account({ ...req.body });
    await newAccount.save();
    const accessToken = jwt.sign({ id: newAccount.id, type: newAccount.type }, secretToken);
    return res.status(201).send({
      token: accessToken,
      id: newAccount.id,
      type: newAccount.type,
      tier: newAccount.tier,
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// POST-Request für Anmeldung eines Accounts
accountRoutes.post("/account/login", async (req, res) => {
  const credentials = req.body;
  try {
    Account.findOne({ email: credentials.email }).then((account) => {
      if (!account) {
        return res.status(404).end();
      }
      if (account.password != credentials.password) {
        return res.status(403).end();
      }
      const accessToken = jwt.sign({ id: account.id, type: account.type }, secretToken);
      return res.send({
        token: accessToken,
        id: account.id,
        type: account.type,
        tier: account.tier,
      });
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res.status(400).send(error.message);
  }
});

// GET-Request für Informationen über den eigenen Account
accountRoutes.get("/account/info", authenticateJWT, async (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const requestedAccount = await Account.findOne({ _id: id });
      if (!requestedAccount) {
        res.status(404).send("Account not found");
      }
      return res.send(requestedAccount);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  } else {
    return res.status(403).send("Invalid account id");
  }
});

// PATCH-Request zum Aktualisieren der eigenen Informationen
accountRoutes.patch("/account/info", authenticateJWT, async (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const updatedValues = req.body;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const updated = await Account.findOneAndUpdate({ _id: id }, updatedValues, { new: true, runValidators: true });
      if (!updated) {
        return res.status(404).send("Account not found");
      }
      return res.send(updated);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  } else {
    return res.status(403).send("Invalid account id");
  }
});

// GET-Request der Unterprofile des eigenen Accounts
accountRoutes.get("/account/profile-list", authenticateJWT, async (req: Request, res: Response) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const accounts: AccountType[] = await Account.find();
      const profileList = await getAccountListById(id, accounts);
      return res.send(profileList);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  } else {
    return res.status(403).send("Invalid account id");
  }
});

// POST-Request zum Hinzufügen eines neuen Profils
accountRoutes.post("/account/create-profile", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const addedProfile = req.body;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const newProfile = new Account({ ...addedProfile });
      await newProfile.save();
      await Account.updateOne(
        { id },
        {
          $addToSet: {
            related_accounts: {
              _id: newProfile.id,
              first_name: newProfile.first_name,
              last_name: newProfile.last_name,
            },
          },
        }
      );
      const accessToken = await jwt.sign({ id: newProfile.id, type: newProfile.type }, secretToken);
      return res.send({
        token: accessToken,
        id: newProfile.id,
        type: newProfile.type,
        tier: newProfile.tier,
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  } else {
    return res.status(403).send("Invalid profile id");
  }
});

// DELETE-Request zum Entfernen eines Unterprofils
accountRoutes.delete("/account/delete-profile", authenticateJWT, async (req, res) => {
  const authReq = req as authenticatedRequest;
  const id = authReq.account.id;
  const deletedProfileId = req.body.id;
  if (mongoose.Types.ObjectId.isValid(id) && mongoose.Types.ObjectId.isValid(deletedProfileId)) {
    try {
      const deleted = await Account.findOneAndDelete({ _id: deletedProfileId });
      if (!deleted) {
        return res.status(404).send("Profile not found");
      }
      await Account.updateOne(
        { id },
        {
          $pull: { related_accounts: { _id: deletedProfileId } },
        }
      );
      return res.status(200).send("Profile deleted");
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  } else {
    return res.status(403).send("Invalid profile id");
  }
});

// POST-Request zum Wechseln des Profils
accountRoutes.post("/account/change-profile", authenticateJWT, async (req, res) => {
  const id = req.body.id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      await Account.findOne({ _id: id }).then((account) => {
        if (account) {
          const accessToken = jwt.sign({ id: account.id, type: account.type }, secretToken);
          return res.send({
            token: accessToken,
            id: account.id,
            type: account.type,
            tier: account.tier,
          });
        } else {
          return res.status(404).send("Profile not found");
        }
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return res.status(400).send(error.message);
    }
  } else {
    return res.status(403).send("Invalid profile id");
  }
});
