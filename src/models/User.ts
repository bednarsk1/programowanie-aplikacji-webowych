export type UserRole = "admin" | "developer" | "devops" | "guest";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
}
