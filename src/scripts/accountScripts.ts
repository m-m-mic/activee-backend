import { AccountType } from "../interfaces";

export function getAccountListById(id: string, accounts: AccountType[]) {
  for (const account of accounts) {
    if (account._id.toString() === id && account.tier === "parent") {
      // Falls der Account, welcher den Request geschickt hat, das Hauptprofil ist, wird dessen "related_accounts" Liste
      // zurückgegeben
      return [
        { _id: account._id, first_name: account.first_name, last_name: account.last_name, main_profile: true },
        ...account.related_accounts,
      ];
    } else if (account._id.toString() === id && account.tier === "child") {
      // Falls der Account, welcher den Request geschickt hat, ein Unterprofil ist, wird nach dem Oberprofil gesucht
      // und dessen Informationen und "related_accounts" Liste zurückgegeben
      for (const mainAccount of accounts) {
        if (mainAccount._id.toString() === account.related_accounts[0]._id) {
          return [
            { _id: mainAccount._id, first_name: mainAccount.first_name, last_name: mainAccount.last_name, main_profile: true },
            ...mainAccount.related_accounts,
          ];
        }
      }
    }
  }
  return null;
}
