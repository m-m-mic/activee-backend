export interface InitialActivity {
  name: string;
  club: string;
}
export interface Activity extends InitialActivity {
  id: number;
}
const activities: Activity[] = [];
let activityId = 0;
export function addActivity(initialActivity: InitialActivity) {
  const activity = {
    ...initialActivity,
    id: activityId++,
  };
  activities.push(activity);
  console.log(activity);
  return activity.id;
}
export function getActivities() {
  return activities;
}

export function getActivityById(id: number) {
  for (const activity of activities) {
    if (activity.id === id) {
      return activity;
    }
  }
  return null;
}

export function updateActivityById(id: number, updatedActivity: Activity) {
  for (let i = 0; i < activities.length; i++) {
    if (activities[i].id === id) {
      activities[i] = updatedActivity;
      return activities[i].id;
    }
  }
  return null;
}
