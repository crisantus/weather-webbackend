import bcrypt from "bcrypt";

// More rounds means stronger hashing but slower password operations.
const SALT_ROUNDS = 10;

// Hash a plain password before saving it to the database.
export const hashPassword = (password: string) => bcrypt.hash(password, SALT_ROUNDS);

// Compare a login password with the saved password hash.
export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
