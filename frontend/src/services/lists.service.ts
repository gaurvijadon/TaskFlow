import api from './api';
import type { List } from '../types';

export const listsService = {
  async getLists(boardId: string): Promise<List[]> {
    const res = await api.get('/lists', { params: { boardId } });
    return res.data.lists;
  },

  async createList(data: { title: string; boardId: string }): Promise<List> {
    const res = await api.post('/lists', data);
    return res.data.list;
  },

  async updateList(id: string, data: { title?: string; order?: number }): Promise<List> {
    const res = await api.put(`/lists/${id}`, data);
    return res.data.list;
  },

  async deleteList(id: string): Promise<void> {
    await api.delete(`/lists/${id}`);
  },
};
