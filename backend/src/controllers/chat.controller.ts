// src/controllers/chatController.ts
import { Request, Response } from 'express';
import { ChatSession } from '../models/Chat';
import { TeamMember } from '../models/TeamMember';
import Mission from '../models/Mission';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const createOrUpdateChat = async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    const { userId, missionId, message } = req.body;

    // 기존 채팅 세션 찾기 또는 새로 생성
    let chatSession = await ChatSession.findOne({
      teamName,
      userId,
      missionId,
      status: 'active'
    });

    if (!chatSession) {
      chatSession = new ChatSession({
        teamName,
        userId,
        missionId
      });
    }

    // 사용자 메시지 추가
    chatSession.messages.push({
      content: message,
      role: 'user',
      timestamp: new Date()
    });

    // 미션 정보 가져오기 (있는 경우)
    let missionPrompt = '';
    if (missionId) {
      const mission = await Mission.findById(missionId);
      if (mission) {
        missionPrompt = `${mission.introduction || ''}\n${mission.mainContent}\n${mission.examples || ''}\n${mission.conclusion || ''}\n\n`;
      }
    }

    // Anthropic API 호출
    const completion = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: missionPrompt + message
        }
      ]
    });

    // AI 응답 추출 (타입 안전성 개선)
    const aiResponse = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : '';
      
    chatSession.messages.push({
      content: aiResponse,
      role: 'assistant',
      timestamp: new Date()
    });

    // 채팅 저장
    await chatSession.save();

    // TeamMember의 chatHistory 업데이트
    await TeamMember.findByIdAndUpdate(userId, {
      $addToSet: { chatHistory: chatSession._id }
    });

    res.json({
      message: '메시지가 성공적으로 처리되었습니다.',
      response: aiResponse,
      chatSession
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: '채팅 처리 중 오류가 발생했습니다.' });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    const { userId, missionId } = req.query;

    const query = {
      teamName,
      userId,
      ...(missionId && { missionId })
    };

    const chatSessions = await ChatSession.find(query)
      .sort({ createdAt: -1 })
      .limit(10);  // 최근 10개 세션만

    res.json(chatSessions);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: '채팅 기록을 불러오는데 실패했습니다.' });
  }
};

export const summarizeChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    
    const chatSession = await ChatSession.findById(chatId);
    if (!chatSession) {
      return res.status(404).json({ message: '채팅을 찾을 수 없습니다.' });
    }

    // 전체 대화 내용을 하나의 문자열로 합치기
    const conversation = chatSession.messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Anthropic API를 사용하여 요약 생성
    const completion = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `다음 대화를 간단히 요약해주세요:\n\n${conversation}`
        }
      ]
    });

    // 요약 저장 (타입 안전성 개선)
    chatSession.summary = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : '';
    await chatSession.save();

    res.json({
      message: '채팅이 성공적으로 요약되었습니다.',
      summary: chatSession.summary
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: '채팅 요약 중 오류가 발생했습니다.' });
  }
};