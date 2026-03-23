export type UserRole = "admin" | "developer" | "devops";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}