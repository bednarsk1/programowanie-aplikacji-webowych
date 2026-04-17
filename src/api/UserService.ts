import type { User } from "../models/User";

const USERS_KEY = "manageme_users";
const CURRENT_USER_KEY = "manageme_current_user";
const SUPER_ADMIN_EMAIL = "bednarskipiotrpawel@gmail.com";

export class UserService {
  static getAll(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveAll(users: User[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  static getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  static setCurrentUser(user: User) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  static login(email: string): User {
    const users = this.getAll();

    let user = users.find((u) => u.email === email);

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email,
        role: email === SUPER_ADMIN_EMAIL ? "admin" : "guest",
        isBlocked: false,
      };

      users.push(user);
      this.saveAll(users);
    }

    this.setCurrentUser(user);

    return user;
  }

  static update(updatedUser: User) {
    const users = this.getAll().map((u) =>
      u.id === updatedUser.id ? updatedUser : u,
    );

    this.saveAll(users);

    const current = this.getCurrentUser();
    if (current && current.id === updatedUser.id) {
      this.setCurrentUser(updatedUser);
    }
  }
}
