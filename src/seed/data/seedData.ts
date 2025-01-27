import * as bcrypt from 'bcrypt';

interface SeedData {
    users: SeedUser[];
}

interface SeedUser {
    email: string;
    fullName: string;
    password: string;
    roles: string[];
  }

export const initialData: SeedData = {
  users: [
    {
      fullName: 'Diego Ceron Gutierrez',
      email: 'diego.ceron@gmail.com',
      password: bcrypt.hashSync('StrongPassword!123', 10),
      roles: ['admin'],
    },
  ],
};
