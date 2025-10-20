import { User } from "./user.model";


export type RegisterDto = Omit<User, '_id' | 'role'> & { password?: string };

export type LoginDto = {
  email: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  user: User;
};
