// TypeScript Interface mit allen Typen für values in einem Account
export interface AccountType {
  _id: string;
  email: string;
  password: string;
  type: string;
  tier: string;
  first_name: string;
  last_name: string;
  club: string;
  phone_number: string;
  birthday: string;
  address: Address;
  languages: PreselectOption[];
  genders: string[];
  sports: PreselectOption[];
  transport: string[];
  distance: number;
  times: TableDate[];
  related_accounts: RelatedAccount[];
  activities: AccountActivity[];
}

// TypeScript Interface mit allen Typen für values in einer Aktivität
export interface ActivityType {
  name: string;
  club: string;
  sport: PreselectOption;
  gender: PreselectOption;
  age: Age;
  league: string;
  languages: PreselectOption[];
  maximum_participants: number;
  requirements: string;
  required_items: PreselectOption[];
  addition_info: string;
  membership_fee: string;
  dates: Date[];
  address: Address;
  trainers: Trainer[];
  participants: Participant[];
}

export interface Address {
  street: string;
  house_number: string;
  zip_code: string;
  city: string;
}

interface TableDate {
  day: string;
  starting_hour: number;
}
interface RelatedAccount {
  _id: string;
  first_name: string;
  last_name: string;
}
interface AccountActivity {
  _id: string;
  name: string;
  sport: PreselectOption;
}

interface PreselectOption {
  _id: string;
  name: string;
}

interface Age {
  isOlderThan: boolean;
  age: number;
}

interface Date {
  day: string;
  starting_time: string;
  ending_time: string;
}

interface Trainer {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  show_email: boolean;
  phone_number: string;
  show_phone_number: boolean;
}

interface Participant {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  birthday: string;
}
