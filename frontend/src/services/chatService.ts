import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const chatService = {
  sendMessage: async (teamName: string, message: string, missionId?: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${teamName}/chat`, {
        message,
        missionId
      });
      return response.data;
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
      throw error;
    }
  },

  getChatHistory: async (teamName: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${teamName}/chat/history`);
      return response.data;
    } catch (error) {
      console.error('채팅 이력 조회 중 오류:', error);
      throw error;
    }
  },

  summarizeChat: async (teamName: string, chatId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${teamName}/chat/${chatId}/summarize`);
      return response.data;
    } catch (error) {
      console.error('채팅 요약 중 오류:', error);
      throw error;
    }
  }
};