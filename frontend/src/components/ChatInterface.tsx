import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { chatService } from '../services/chatService';
import axios from 'axios';


interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [teamName, setTeamName] = useState<string>('default-team');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 초기 미션 로드
    const loadMissions = async () => {
      try {
        const response = await axios.get('/api/missions');
        setMissions(response.data);
      } catch (error) {
        console.error('미션 로드 중 오류:', error);
      }
    };

    loadMissions();
  }, []);

  useEffect(() => {
    // 스크롤 자동 하단 고정
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputMessage('');

    try {
      const response = await chatService.sendMessage(
        teamName, 
        inputMessage, 
        currentMission?.id
      );

      const newAIMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.message,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, newAIMessage]);
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
    }
  };

  const selectMission = (mission: Mission) => {
    setCurrentMission(mission);
    // 미션 시작 메시지 추가
    const startMessage: Message = {
      id: `system-${Date.now()}`,
      content: `미션 "${mission.title}"을 시작합니다.`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([startMessage]);
  };

  return (
    <div className="flex h-screen">
      {/* 미션 사이드바 */}
      <div className="w-1/4 p-4 bg-gray-100 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">미션 목록</h2>
        {missions.map(mission => (
          <Button 
            key={mission.id} 
            variant={currentMission?.id === mission.id ? 'default' : 'outline'}
            className="w-full mb-2"
            onClick={() => selectMission(mission)}
          >
            {mission.title}
          </Button>
        ))}
      </div>

      {/* 채팅 인터페이스 */}
      <div className="flex-grow flex flex-col">
        <Card className="flex-grow flex flex-col">
          <CardContent className="flex-grow overflow-y-auto">
            <ScrollArea className="h-full">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`inline-block p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="p-4">
            <div className="flex w-full space-x-2">
              <Input 
                placeholder="메시지를 입력하세요"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!currentMission}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!currentMission || !inputMessage.trim()}
              >
                전송
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;