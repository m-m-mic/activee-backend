import jwt from "jsonwebtoken";
import { Request } from "express";
import { secretToken } from "../index";

export interface authenticatedRequest extends Request {
  account: authenticatedAccount;
}
export interface authenticatedAccount {
  id: string;
  type: string;
}
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretToken, (err, account) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.account = account;
      next();
    });
  } else {
    return res.sendStatus(401);
  }
};
