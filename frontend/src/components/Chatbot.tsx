'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load chat history when opened
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = () => {
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([{
          text: "Hello! I'm your security assistant. How can I help you analyze security threats and vulnerabilities?",
          isUser: false
        }]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([{
        text: "Hello! I'm your security assistant. How can I help you analyze security threats and vulnerabilities?",
        isUser: false
      }]);
    }
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          text: data.response || data.message,
          isUser: false
        }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    localStorage.removeItem('chatHistory');
    setMessages([{
      text: "Hello! I'm your security assistant. How can I help you analyze security threats and vulnerabilities?",
      isUser: false
    }]);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    const chatContent = document.getElementById('chat-content');
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-primary"
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      ) : (
        <Card className="w-[450px] h-[600px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Security Assistant</div>
                <div className="text-xs text-muted-foreground">Always here to help</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="hover:bg-primary/10 transition-colors"
                title="Clear chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent 
            id="chat-content"
            className="flex-1 overflow-y-scroll p-4 space-y-4 no-scrollbar bg-gradient-to-b from-background to-muted/20"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-1`}
              >
                {!message.isUser && (
                  <div className="p-1.5 bg-primary/10 rounded-lg h-fit">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[85%] shadow-sm ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted/50 border border-muted-foreground/10 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.text}
                  </div>
                </div>
                {message.isUser && (
                  <div className="p-1.5 bg-primary rounded-lg h-fit">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2 justify-start animate-in fade-in-0">
                <div className="p-1.5 bg-primary/10 rounded-lg h-fit">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted/50 rounded-2xl px-4 py-2 border border-muted-foreground/10 rounded-bl-none">
                  <div className="flex gap-1 items-center px-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-2 border-t bg-gradient-to-r from-primary/10 to-primary/5">
            <form onSubmit={handleSend} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about security threats..."
                className="flex-1 bg-background/60 focus-visible:ring-primary/20"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 