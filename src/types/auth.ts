export type UserRole = 'Student' | 'Publisher' | 'Admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  token?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => void;
}
