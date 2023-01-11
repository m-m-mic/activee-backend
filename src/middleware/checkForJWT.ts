import { secretToken } from "../index";
import jwt from "jsonwebtoken";

// CheckForJWT untersucht lediglich, ob ein valider Token vorliegt, bricht aber den Request nicht ab, wenn dies nicht
// der Fall ist
export const checkForJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    // Verifizierung des vom Frontend erhaltenen Tokens
    jwt.verify(token, secretToken, (err, account) => {
      if (err) {
        req.account = null;
        next();
      }
      req.account = account;
      next();
    });
  } else {
    req.account = null;
    next();
  }
};
