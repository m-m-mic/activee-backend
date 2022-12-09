import { nanoid } from "nanoid";
import fs from "fs";

export interface initialAccount {
  type: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
export interface Account extends initialAccount {
  id: string;
}
export function addAccount(initialAccount: initialAccount) {
  const account = {
    ...initialAccount,
    id: nanoid(8),
  };
  const data = fs.readFileSync("src/json/accounts.json", "utf-8");
  const accounts = JSON.parse(data);
  for (const existingAccount of accounts) {
    if (existingAccount.email === account.email) {
      return null;
    }
  }
  accounts.push(account);
  const json = JSON.stringify(accounts);
  // updated array is written onto accounts.json
  fs.writeFileSync("src/json/accounts.json", json, "utf-8");
  return account;
}
export function getAccount(email: string, password: string) {
  const data = fs.readFileSync("src/json/accounts.json", "utf-8");
  const accounts = JSON.parse(data);
  // for loop iterates over array and returns account with matching credentials
  for (const account of accounts) {
    if (account.email === email && account.password === password) {
      return { id: account.id, type: account.type, first_name: account.first_name, last_name: account.last_name };
    }
  }
  return null;
}
