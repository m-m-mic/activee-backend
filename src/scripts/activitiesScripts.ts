import { ActivityType } from "../interfaces";

export function searchActivities(searchQuery: string, activities: ActivityType[]) {
  const searchResult: ActivityType[] = [];
  // Iteriert über das gegebene activities-Array und überprüft, ob der Name, Verein oder die Sportart einer Aktivität den Suchbegriff enthält.
  for (const activity of activities) {
    if (
      activity.name.toLowerCase().includes(searchQuery) ||
      activity.club.toLowerCase().includes(searchQuery) ||
      activity.sport.name.toLowerCase().includes(searchQuery)
    ) {
      // Übereinstimmende Aktivität wird in die searchResult-Liste gepushed
      searchResult.push(activity);
    }
  }
  // Funktion gibt Liste mit allen Suchergebnissen zurück
  return searchResult;
}

// Mit der Funktion wird anhand von den Angaben des Nutzers im Profil ein Modell erstellt, mit welchen alle Aktivitäten
// durchsucht und gefiltert werden können.
// Wenn der Nutzer Angaben getätigt hat, müssen die Angaben der Aktivität mit diesen übereinstimmen
export function constructPreferenceModel(account, id) {
  let model = {};
  if (account.genders.length > 0) {
    model = { ...model, "gender._id": { $in: account.genders } };
  }
  if (account.sports.length > 0) {
    const sportIds: string[] = [];
    for (const sport of account.sports) {
      sportIds.push(sport._id);
    }
    model = { ...model, "sport._id": { $in: sportIds } };
  }
  if (account.languages.length > 0) {
    const languageIds: string[] = [];
    for (const language of account.languages) {
      languageIds.push(language._id);
    }
    model = { ...model, "languages._id": { $in: languageIds } };
  }
  if (account.birthday) {
    const age = getAge(account.birthday);
    model = {
      ...model,
      $or: [
        { "age.age": { $lte: age }, "age.isOlderThan": true },
        { "age.age": { $gte: age }, "age.isOlderThan": false },
      ],
    };
  }
  if (id) {
    model = { ...model, participants: { $nin: id } };
  }
  return model;
}

export function deleteDuplicateEntries(filteredList, completeList) {
  const cleanedList = completeList;
  for (const activity of filteredList) {
    for (let i = 0; i < cleanedList.length; i++) {
      if (cleanedList[i]._id.toString() === activity._id.toString()) {
        cleanedList.splice(i, 1);
      }
    }
  }
  return cleanedList;
}

// Berechnet das Alter des Nutzers anhand vom Geburtsdatum
function getAge(birthday) {
  const currentDate = new Date();
  const birthDate = new Date(birthday);
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const month = currentDate.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Sortiert zufällig eine Liste
export function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}
