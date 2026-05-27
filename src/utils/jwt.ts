import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenUser = {
  id: string;
  email: string;
  name: string;
};

// Create a signed token that the frontend stores after login/register.
export const createToken = (tokenUser: TokenUser) => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign({ tokenUser }, env.JWT_SECRET, options);
};

// Verify a token from the Authorization header and read the user payload.
export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as { tokenUser: TokenUser };
};
