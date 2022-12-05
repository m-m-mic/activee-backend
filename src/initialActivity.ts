import fs from "fs";
import { nanoid } from "nanoid";

// TypeScript interface determines what attributes 'InitialActivity' and 'Activity' can have and what types they should be to prevent unintended type coercion
export interface InitialActivity {
  name: string;
  club: string;
  sport: string;
}
export interface Activity extends InitialActivity {
  id: string;
}
// addActivity writes a new activity to the activities.json file
export function addActivity(initialActivity: InitialActivity) {
  // each activity is given a unique id (using nanoid library) so all activities can be properly distinguished
  const activity = {
    ...initialActivity,
    id: nanoid(8),
  };
  // activities.json is read and converted so a new activity can be added to the array
  const data = fs.readFileSync("src/json/activities.json", "utf-8");
  const activities = JSON.parse(data);
  activities.push(activity);
  const json = JSON.stringify(activities);
  // updated array is written onto activities.json
  fs.writeFileSync("src/json/activities.json", json, "utf-8");
  return activity.id;
}
export function getActivities() {
  const data = fs.readFileSync("src/json/activities.json", "utf-8");
  // function returns activities.json in its entirety
  return JSON.parse(data);
}

export function getActivityById(id: string) {
  const data = fs.readFileSync("src/json/activities.json", "utf-8");
  const activities = JSON.parse(data);
  // for loop iterates over array and returns activity with matching id
  for (const activity of activities) {
    if (activity.id === id) {
      return activity;
    }
  }
  return null;
}

export function updateActivityById(id: string, updatedActivity: Activity) {
  const data = fs.readFileSync("src/json/activities.json", "utf-8");
  const activities = JSON.parse(data);
  // for loop iterates over array
  for (let i = 0; i < activities.length; i++) {
    if (activities[i].id === id) {
      // activity with matching id gets updated
      activities[i] = updatedActivity;
      // array with updated activity is written onto activities.json
      const json = JSON.stringify(activities);
      fs.writeFileSync("src/json/activities.json", json, "utf-8");
      // the id of the new activity is returned so the frontend can navigate to the new activity page
      return activities[i].id;
    }
  }
  return null;
}

export function searchActivities(searchQuery: string) {
  const searchResult: Activity[] = [];
  const data = fs.readFileSync("src/json/activities.json", "utf-8");
  const activities = JSON.parse(data);
  // for loop iterates over array and checks if activity name includes search query
  for (const activity of activities) {
    if (activity.name.toLowerCase().includes(searchQuery)) {
      searchResult.push(activity);
    }
  }
  return searchResult;
}
