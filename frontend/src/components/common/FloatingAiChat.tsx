import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Minimize2 } from 'lucide-react';
import { api } from '../../services/api';
import type { AiChatMessage } from '../../types';

export const FloatingAiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Tải tin nhắn gần nhất nếu chưa có
      if (messages.length === 0) {
        api.ai.getChatMessages(1).then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setMessages(res.data);
          } else {
            // Tin nhắn chào mừng ban đầu
            setMessages([
              {
                id: 1,
                role: 'assistant',
                content:
                  'Xin chào! Tôi là Trợ lý Cố vấn Quyết định Tài chính AI của bạn. Bạn muốn hỏi gì về số dư, chi tiêu hoặc cần lời khuyên nào hôm nay?',
              },
            ]);
          }
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AiChatMessage = {
      id: Date.now(),
      role: 'user',
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.ai.sendChatMessage(1, textToSend.trim());
      if (res.success && res.data) {
        const replyText: string = res.data;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: replyText,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: 'Xin lỗi, đã xảy ra lỗi kết nối với AI. Bạn vui lòng thử lại sau giây lát nhé.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại kết nối mạng.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Tháng này tôi còn bao nhiêu tiền tiêu?',
    'Đánh giá cơ cấu chi tiêu của tôi',
    'Cho tôi 1 lời khuyên tiết kiệm',
  ];

  return (
    <>
      {/* 1. NÚT BẤM NỔI GÓC DƯỚI BÊN PHẢI (FLOATING BUTTON) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '28px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(30, 58, 138, 0.35)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(30, 58, 138, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(30, 58, 138, 0.35)';
          }}
        >
          <Sparkles size={18} color="#fde047" />
          <span>Hỏi Trợ lý AI</span>
        </button>
      )}

      {/* 2. CỬA SỔ CHATBOT POPUP */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '28px',
            zIndex: 9999,
            width: '390px',
            height: '560px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.22)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Trợ lý Tài chính AI</div>
                <div style={{ fontSize: '11px', color: '#bfdbfe', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                  Đang hoạt động (RAG Finance)
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Thu nhỏ"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  fontSize: '11px',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#fafafa',
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: isUser ? '#2563eb' : '#ffffff',
                    color: isUser ? '#ffffff' : '#1e293b',
                    fontSize: '13px',
                    lineHeight: '1.45',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: isUser ? 'none' : '1px solid #e2e8f0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
              );
            })}

            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 14px',
                  borderRadius: '14px 14px 14px 2px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  color: '#64748b',
                  fontStyle: 'italic',
                }}
              >
                AI đang suy nghĩ và tính toán số liệu...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi tài chính..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '13px',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: input.trim() && !isLoading ? '#2563eb' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
