import type { User } from "./user.js";

export interface DecodedToken {
  exp: number;
  user: User;
  iat: number;
}
