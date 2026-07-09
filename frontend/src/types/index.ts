export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  color: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  title: string;
  boardId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Card {
  _id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  listId: string;
  boardId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
