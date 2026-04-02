import { Button } from "@/components/ui/button";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAIResponse } from "../lib/chatAI";
import type { ChatMessage, Expense, UserProfile } from "../types";

const SUGGESTIONS = [
  "Can I spend ₹500 today?",
  "How to save more?",
  "Show my budget",
  "My expenses",
  "Health score",
  "Goal progress",
];

interface Props {
  messages: ChatMessage[];
  profile: UserProfile;
  expenses: Expense[];
  onSendMessage: (msgs: ChatMessage[]) => void;
}

function formatTextPart(part: string, i: number): React.ReactNode {
  if (part.startsWith("**") && part.endsWith("**")) {
    // biome-ignore lint/suspicious/noArrayIndexKey: positional text fragments
    return (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    );
  }
  if (part === "\n") {
    // biome-ignore lint/suspicious/noArrayIndexKey: positional text fragments
    return <br key={i} />;
  }
  return part;
}

function formatText(text: string): React.ReactNode {
  return text.split(/(\*\*.*?\*\*|\n)/g).map(formatTextPart);
}

export default function ChatScreen({
  messages,
  profile,
  expenses,
  onSendMessage,
}: Props) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgCount = messages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever messages or typing changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount, typing]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: trimmed,
      sender: "user",
      timestamp: Date.now(),
    };
    const newMsgs = [...messages, userMsg];
    onSendMessage(newMsgs);
    setInput("");
    setTyping(true);
    setTimeout(
      () => {
        const aiText = getAIResponse(trimmed, profile, expenses);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          sender: "ai",
          timestamp: Date.now(),
        };
        onSendMessage([...newMsgs, aiMsg]);
        setTyping(false);
      },
      800 + Math.random() * 400,
    );
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl brand-bg flex items-center justify-center glow-brand">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">AI Assistant</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full inline-block" />
              Always here to help
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-primary/10 brand-text border border-primary/20 hover:bg-primary/20 transition-colors whitespace-nowrap"
              data-ocid="chat.toggle"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-none">
        {messages.length === 0 && (
          <div className="text-center py-8" data-ocid="chat.empty_state">
            <div className="w-16 h-16 rounded-2xl brand-bg flex items-center justify-center mx-auto mb-3 glow-brand">
              <Bot className="w-8 h-8 text-background" />
            </div>
            <p className="font-semibold text-foreground">
              Hi! I&apos;m your AI Cash Manager
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ask me anything about your finances
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${
              msg.sender === "user" ? "flex-row-reverse" : ""
            } animate-fade-up`}
            style={{ animationDelay: `${i * 20}ms` }}
            data-ocid={`chat.item.${i + 1}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.sender === "ai" ? "brand-bg" : "bg-muted"
              }`}
            >
              {msg.sender === "ai" ? (
                <Bot className="w-3.5 h-3.5 text-background" />
              ) : (
                <User className="w-3.5 h-3.5 text-foreground" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "brand-bg text-background rounded-tr-sm"
                  : "chat-bubble-ai text-foreground rounded-tl-sm"
              }`}
            >
              {msg.sender === "ai" ? formatText(msg.text) : msg.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full brand-bg flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-background" />
            </div>
            <div
              className="chat-bubble-ai rounded-2xl rounded-tl-sm px-4 py-3"
              data-ocid="chat.loading_state"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((dotIdx) => (
                  <div
                    key={dotIdx}
                    className="w-1.5 h-1.5 rounded-full brand-bg"
                    style={{
                      animation: `pulse 1.2s ease ${dotIdx * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border/40 flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me anything..."
            className="flex-1 h-11 px-4 rounded-xl bg-muted/50 border border-border/60 text-foreground placeholder:text-muted-foreground/60 text-sm outline-none focus:border-primary/50 transition-colors"
            disabled={typing}
            data-ocid="chat.input"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            className="h-11 w-11 p-0 brand-bg text-background rounded-xl hover:opacity-90 disabled:opacity-40 flex-shrink-0"
            data-ocid="chat.submit_button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
