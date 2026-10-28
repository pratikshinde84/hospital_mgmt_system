import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '../../lib/motion';
import { Bot, X, Send, Trash2, Minimize2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import {
  sendChatMessage,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
  createMessage,
  SUGGESTED_PROMPTS,
} from '../../services/chatService';
import type { ChatMessage } from '../../types';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';

interface ChatBotProps {
  fullPage?: boolean;
  className?: string;
}

export function ChatBot({ fullPage = false, className }: ChatBotProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(fullPage);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory(user?.id));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    saveChatHistory(user?.id, messages);
  }, [messages, user?.id]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    setInput('');
    const userMsg = createMessage('user', content);
    const loadingMsg = createMessage('assistant', '', true);

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsTyping(true);

    const result = await sendChatMessage(messages.filter((m) => !m.isLoading), content);

    setMessages((prev) => {
      const withoutLoading = prev.filter((m) => !m.isLoading);
      const responseMsg = createMessage(
        'assistant',
        result.success
          ? (result.response ?? 'I could not generate a response.')
          : (result.error ?? 'An error occurred.')
      );
      return [...withoutLoading, responseMsg];
    });
    setIsTyping(false);
  };

  const handleClear = () => {
    setMessages([]);
    clearChatHistory(user?.id);
  };

  const chatContent = (
    <div className={cn('flex flex-col', fullPage ? 'h-full' : 'h-[500px]')}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 rounded-t-2xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">MediCore AI Assistant</p>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
            title="Clear conversation"
          >
            <Trash2 size={14} />
          </button>
          {!fullPage && (
            <>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-slate-800"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
          >
            {/* Disclaimer */}
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 shrink-0">
              For general information only. Not medical advice. For emergencies, call 112.
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto mb-4">
                    <Bot size={28} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    MediCore AI Assistant
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                    Ask me about hospitals, appointments, or general health information.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTED_PROMPTS.slice(0, 4).map((p) => (
                      <button
                        key={p}
                        onClick={() => handleSend(p)}
                        className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-100 dark:border-blue-800"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] px-3 py-2.5 rounded-2xl text-sm',
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-tl-sm'
                    )}
                  >
                    {msg.isLoading ? (
                      <div className="flex items-center gap-1.5 py-1">
                        {[0, 0.15, 0.3].map((d) => (
                          <motion.div
                            key={d}
                            className="w-1.5 h-1.5 rounded-full bg-slate-400"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: d }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className={cn('prose prose-sm max-w-none', msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert')}>
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <p className={cn('text-xs mt-1', msg.role === 'user' ? 'text-blue-200' : 'text-slate-400')}>
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask me anything about healthcare..."
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                Not medical advice - For emergencies call 112
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (fullPage) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {chatContent}
      </div>
    );
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            aria-label="Open AI Assistant"
          >
            <Bot size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl overflow-hidden z-50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {chatContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

