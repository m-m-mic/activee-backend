import { nanoid } from "nanoid";
import fs from "fs";

export interface InitialAccount {
  email: string;
  password: string;
  type: string;
  first_name: string;
  last_name: string;
  club: string | null;
  phone_number: string | null;
  birthday: string | null;
  address: Address;
  languages: Array<string | null>;
  genders: Array<string | null>;
  sports: Array<Sport>;
  transport: Array<string | null>;
  distance: number | null;
  times: Array<TableDate | null>;
  related_accounts: Array<RelatedAccount | null>;
}

export interface Address {
  street: string;
  house_number: string;
  zip_code: string;
  city: string;
}
interface Sport {
  value: string;
  name: string;
}
interface TableDate {
  day: string;
  starting_hour: number;
}
interface RelatedAccount {
  id: number;
  first_name: string;
  last_name: string;
}
export interface Account extends InitialAccount {
  id: string;
  tier: string;
}
export function registerAccount(initialAccount: InitialAccount) {
  const account = {
    ...initialAccount,
    id: nanoid(8),
    tier: "parent",
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
export function loginAccount(email: string, password: string) {
  const data = fs.readFileSync("src/json/accounts.json", "utf-8");
  const accounts = JSON.parse(data);
  // for loop iterates over array and returns account with matching credentials
  for (const account of accounts) {
    if (account.email === email && account.password === password) {
      return account;
    }
  }
  return null;
}

export function getAccountById(id: string) {
  const data = fs.readFileSync("src/json/accounts.json", "utf-8");
  const accounts = JSON.parse(data);
  // for loop iterates over array and returns account with matching credentials
  for (const account of accounts) {
    if (account.id === id) {
      return account;
    }
  }
  return null;
}

export function updateAccountById(updatedAccount: Account) {
  const data = fs.readFileSync("src/json/accounts.json", "utf-8");
  const accounts = JSON.parse(data);
  // for loop iterates over array
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].id === updatedAccount.id) {
      // activity with matching id gets updated
      accounts[i] = updatedAccount;
      // array with updated activity is written onto account.json
      const json = JSON.stringify(accounts);
      fs.writeFileSync("src/json/accounts.json", json, "utf-8");
      // the id of the new activity is returned so the frontend can navigate to the new activity page
      return accounts[i];
    }
  }
  return null;
}
export function getAccountListById(id: string) {
  const data = fs.readFileSync("src/json/accounts.json", "utf-8");
  const accounts = JSON.parse(data);
  for (const account of accounts) {
    if (account.id === id && account.tier === "parent") {
      return [
        { id: account.id, first_name: account.first_name, last_name: account.last_name, main_profile: true },
        ...account.related_accounts,
      ];
    } else if (account.id === id && account.tier === "child") {
      for (const mainAccount of accounts) {
        if (mainAccount.id === account.related_accounts[0].id) {
          return [
            { id: mainAccount.id, first_name: mainAccount.first_name, last_name: mainAccount.last_name, main_profile: true },
            ...mainAccount.related_accounts,
          ];
        }
      }
    }
  }
  return null;
}

export function changeProfileById(id: string) {
  const data = fs.readFileSync("src/json/accounts.json", "utf-8");
  const accounts = JSON.parse(data);
  // for loop iterates over array and returns account with matching id
  for (const account of accounts) {
    if (account.id === id) {
      return account;
    }
  }
  return null;
}
