import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActor } from "@/hooks/useActor";
import { detectIntent, getLocalResponse } from "@/lib/aiResponses";
import { Bot, Send, Wifi, WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content: string;
  timestamp: Date;
}

const QUICK_REPLIES = [
  "Track My Order",
  "Return Policy",
  "Refund Status",
  "Shipping Delay",
  "Cancel Order",
  "Contact Support",
];

const GREETING: ChatMessage = {
  id: "greeting",
  role: "agent",
  content: "Hi! I'm your LamaStore Support AI. How can I help you today? 😊",
  timestamp: new Date(),
};

export function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { actor } = useActor();

  useEffect(() => {
    if (actor && !sessionId) {
      actor
        .createSession()
        .then((id) => {
          setSessionId(id);
          setBackendAvailable(true);
        })
        .catch(() => {
          setBackendAvailable(false);
        });
    }
  }, [actor, sessionId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on all renders
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    let responseText: string;

    try {
      if (actor && sessionId && backendAvailable) {
        responseText = await actor.addUserMessageWithResponse(
          sessionId,
          text.trim(),
        );
      } else {
        // Simulate typing delay for local responses
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 800),
        );
        const intent = detectIntent(text.trim());
        responseText = getLocalResponse(intent);
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const intent = detectIntent(text.trim());
      responseText = getLocalResponse(intent);
    }

    const agentMsg: ChatMessage = {
      id: `agent-${Date.now()}`,
      role: "agent",
      content: responseText,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, agentMsg]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-md"
      style={{ height: "520px" }}
    >
      {/* Chat header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: "oklch(0.57 0.19 256)" }}
      >
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-none">
            LamaStore Support AI
          </p>
          <p className="text-blue-100 text-xs mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
            Online — replies instantly
          </p>
        </div>
        <div title={backendAvailable ? "Connected to AI" : "Local AI mode"}>
          {backendAvailable ? (
            <Wifi className="w-4 h-4 text-white/70" />
          ) : (
            <WifiOff className="w-4 h-4 text-white/50" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ background: "#f8fafc" }}
        data-ocid="chat.panel"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "agent" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                  style={{ background: "oklch(0.57 0.19 256)" }}
                >
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "rounded-tr-sm text-slate-800"
                    : "rounded-tl-sm text-white"
                }`}
                style={{
                  background:
                    msg.role === "user" ? "#e2e8f0" : "oklch(0.57 0.19 256)",
                  color: msg.role === "user" ? "#1e293b" : "white",
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                style={{ background: "oklch(0.57 0.19 256)" }}
              >
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1"
                style={{ background: "oklch(0.57 0.19 256)" }}
                data-ocid="chat.loading_state"
              >
                <span className="w-2 h-2 rounded-full bg-white/80 typing-dot" />
                <span className="w-2 h-2 rounded-full bg-white/80 typing-dot" />
                <span className="w-2 h-2 rounded-full bg-white/80 typing-dot" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick replies */}
      <div className="px-3 py-2 bg-white border-t border-gray-100">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleQuickReply(reply)}
              disabled={isTyping}
              data-ocid="chat.button"
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all disabled:opacity-50"
              style={{
                borderColor: "oklch(0.57 0.19 256)",
                color: "oklch(0.57 0.19 256)",
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-gray-100"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isTyping}
          data-ocid="chat.input"
          className="flex-1 rounded-full text-sm border-gray-200 bg-gray-50 text-slate-800 placeholder:text-gray-400 focus-visible:ring-1"
          style={{ color: "#1e293b" }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isTyping}
          data-ocid="chat.submit_button"
          className="w-9 h-9 rounded-full flex-shrink-0 text-white"
          style={{ background: "oklch(0.57 0.19 256)" }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
