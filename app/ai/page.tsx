"use client";

import { useFinanceStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Bot, Send, User, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAdvisorPage() {
  const { accounts, transactions, debts, goals, settings } = useFinanceStore();
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!mounted) return null;

  const suggestedPrompts = [
    "How can I clear my debt faster?",
    "Am I on track for my goals?",
    "Analyze my spending this month",
    "Give me 3 tips to save more"
  ];

  const handleSend = async (content: string = input) => {
    if (!content.trim() || !settings.apiKey) return;

    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Context Construction
    const context = `
      User Financial State:
      Net Worth: ${formatCurrency(accounts.reduce((sum, a) => sum + Number(a.openingBalance), 0) - debts.reduce((sum, d) => sum + Number(d.balance), 0), settings.currency)}
      Total Debt: ${formatCurrency(debts.reduce((sum, d) => sum + Number(d.balance), 0), settings.currency)}
      Active Goals: ${goals.map(g => `${g.name} (${Math.round((g.saved/g.target)*100)}%)`).join(', ')}
      Recent Transactions: ${transactions.slice(0, 10).map(t => `${t.date}: ${t.description} (${t.type === 'expense' ? '-' : '+'}${t.amount})`).join(', ')}
    `;

    try {
      // Direct Anthropic API call as per requirements
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true' // Required for browser calls
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: `Context: ${context}\n\nUser Question: ${content}` }
          ],
        }),
      });

      const data = await response.json();
      if (data.content && data.content[0]) {
        setMessages([...newMessages, { role: 'assistant', content: data.content[0].text }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages([...newMessages, { role: 'assistant', content: "I'm sorry, I encountered an error connecting to my brain. Please check your API key in settings." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">AI Advisor</h1>
          <p className="text-muted-foreground mt-1">Intelligent financial insights powered by Claude.</p>
        </div>
        {!settings.apiKey && (
          <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl text-sm font-medium border border-amber-500/20">
            <AlertCircle className="w-4 h-4" />
            Missing API Key in Settings
          </div>
        )}
      </div>

      <div className="flex-1 glass rounded-[2.5rem] flex flex-col overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">How can I help you today?</h3>
                <p className="text-muted-foreground mt-2">
                  I have access to your accounts, debts, and goals. Ask me for a strategy or an analysis.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {suggestedPrompts.map(p => (
                  <button 
                    key={p}
                    onClick={() => handleSend(p)}
                    className="text-xs font-semibold p-3 rounded-2xl bg-secondary hover:bg-primary/10 hover:text-primary transition-all text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[80%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                  m.role === 'user' ? "bg-secondary" : "bg-primary/10 text-primary"
                )}>
                  {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={cn(
                  "p-5 rounded-[2rem]",
                  m.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "glass rounded-tl-none text-sm leading-relaxed"
                )}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-4 mr-auto">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="glass p-5 rounded-[2rem] rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-secondary/30 border-t border-border/50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-background/50 border border-border/50 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button 
              disabled={isLoading || !settings.apiKey}
              className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-primary/20"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
