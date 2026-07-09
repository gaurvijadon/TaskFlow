import api from './api';
import type { Board } from '../types';

export const boardsService = {
  async getBoards(): Promise<Board[]> {
    const res = await api.get('/boards');
    return res.data.boards;
  },

  async createBoard(data: { title: string; description?: string; color?: string }): Promise<Board> {
    const res = await api.post('/boards', data);
    return res.data.board;
  },

  async updateBoard(
    id: string,
    data: { title?: string; description?: string; color?: string }
  ): Promise<Board> {
    const res = await api.put(`/boards/${id}`, data);
    return res.data.board;
  },

  async deleteBoard(id: string): Promise<void> {
    await api.delete(`/boards/${id}`);
  },
};
