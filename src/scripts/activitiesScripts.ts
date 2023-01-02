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

export function getUserActivities(id: string, type: string, activities: ActivityType[]) {
  const userActivities: ActivityType[] = [];
  if (type === "organisation") {
    for (const activity of activities) {
      for (const trainer of activity.trainers) {
        if (trainer._id === id) {
          userActivities.push(activity);
        }
      }
    }
  } else if (type === "participant") {
    for (const activity of activities) {
      for (const participant of activity.participants) {
        if (participant._id === id) {
          userActivities.push(activity);
        }
      }
    }
  } else {
    return null;
  }
  return userActivities;
}
