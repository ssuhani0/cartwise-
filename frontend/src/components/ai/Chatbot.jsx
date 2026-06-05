import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Chatbot({
  messages,
  loading,
  onSend,
  input,
  onInputChange,
  messagesEndRef,
  language,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-3 max-w-[85%]"
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary p-0.5 shrink-0">
                  <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
  
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted rounded-bl-sm border border-border/50',
                )}
              >
                {msg.content}
              </div>
  
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          </div>
        ))}

        {loading && (
          <div className="flex w-full justify-start">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary p-0.5 shrink-0">
                <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex gap-1 py-4 px-5 rounded-2xl bg-muted rounded-bl-sm border border-border/50 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'hi' ? 'अपना संदेश लिखें...' : 'Type your message...'}
            rows={1}
            className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => onSend(input)}
            disabled={!input.trim() || loading}
            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
