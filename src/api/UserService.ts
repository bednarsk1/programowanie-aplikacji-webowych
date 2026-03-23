import type { User } from "../models/User";

const users: User[] = [
  {
    id: "1",
    firstName: "Jan",
    lastName: "Admin",
    role: "admin",
  },
  {
    id: "2",
    firstName: "Anna",
    lastName: "Developer",
    role: "developer",
  },
  {
    id: "3",
    firstName: "Piotr",
    lastName: "DevOps",
    role: "devops",
  },
];

export class UserService {
  static getCurrentUser(): User {
    return users[0]; // admin
  }

  static getAll(): User[] {
    return users;
  }
}