import type { User } from "../models/User";
import { STORAGE_TYPE } from "../config/storage";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const USERS_KEY = "manageme_users";
const CURRENT_USER_KEY = "manageme_current_user";
const SUPER_ADMIN_EMAIL = "bednarskipiotrpawel@gmail.com";

export class UserService {
  static getAll(): User[] {
    if (STORAGE_TYPE !== "firebase") {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : [];
    }

    const users: User[] = [];

    getDocs(collection(db, "users")).then((snapshot) => {
      snapshot.forEach((docItem) => {
        users.push(docItem.data() as User);
      });
    });

    return users;
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

      if (STORAGE_TYPE !== "firebase") {
        users.push(user);
        this.saveAll(users);
      } else {
        addDoc(collection(db, "users"), { ...user });
      }
    }

    this.setCurrentUser(user);

    return user;
  }

  static update(updatedUser: User) {
    if (STORAGE_TYPE !== "firebase") {
      const users = this.getAll().map((u) =>
        u.id === updatedUser.id ? updatedUser : u,
      );

      this.saveAll(users);
    } else {
      updateDoc(doc(db, "users", updatedUser.id), {
        ...updatedUser,
      });
    }

    const current = this.getCurrentUser();
    if (current && current.id === updatedUser.id) {
      this.setCurrentUser(updatedUser);
    }
  }
}
