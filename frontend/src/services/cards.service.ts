import api from './api';
import type { Card, Priority } from '../types';

export const cardsService = {
  async getCards(boardId: string): Promise<Card[]> {
    const res = await api.get('/cards', { params: { boardId } });
    return res.data.cards;
  },

  async createCard(data: {
    title: string;
    description?: string;
    priority?: Priority;
    dueDate?: string;
    listId: string;
  }): Promise<Card> {
    const res = await api.post('/cards', data);
    return res.data.card;
  },

  async updateCard(
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: Priority;
      dueDate?: string | null;
      listId?: string;
      order?: number;
    }
  ): Promise<Card> {
    const res = await api.put(`/cards/${id}`, data);
    return res.data.card;
  },

  async deleteCard(id: string): Promise<void> {
    await api.delete(`/cards/${id}`);
  },

  async reorderCards(
    updates: Array<{ _id: string; listId: string; order: number }>
  ): Promise<void> {
    await api.put('/cards/reorder', { updates });
  },
};
