import jwt from "jsonwebtoken";
import { Request } from "express";
import { secretToken } from "../index";

// TypeScript Interface, damit account als Teil von request erkannt wird
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
    // Verifizierung des vom Frontend erhaltenen Tokens
    jwt.verify(token, secretToken, (err, account) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.account = account;
      // Fortführung des Requests
      next();
    });
  } else {
    return res.sendStatus(401);
  }
};
