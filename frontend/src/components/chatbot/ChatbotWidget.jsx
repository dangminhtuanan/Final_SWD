import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { chatbotAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ChatbotWidget = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedHistory = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !isAuthenticated || hasLoadedHistory.current) return;
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setError("");
      try {
        const response = await chatbotAPI.getHistory();
        const logs = Array.isArray(response?.data) ? response.data : [];
        const history = logs
          .slice()
          .reverse()
          .flatMap((log) => {
            const items = [];
            if (log?.message) {
              items.push({ role: "user", text: log.message });
            }
            if (log?.response) {
              items.push({ role: "assistant", text: log.response });
            }
            return items;
          });
        setMessages(history);
        hasLoadedHistory.current = true;
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending, isOpen, isLoadingHistory]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isSending) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setIsSending(true);

    try {
      const response = await chatbotAPI.chat({ message });
      const reply = response?.data?.response || response?.data?.message;
      const suggestions = Array.isArray(response?.data?.suggestions)
        ? response.data.suggestions
        : [];
      if (!reply) {
        throw new Error("Empty response");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply, suggestions },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setError("Unable to connect to chatbot. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex w-80 sm:w-96 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden" style={{ height: '480px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 bg-black px-4 py-3 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Shopping Assistant</div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                <span className="text-xs text-white/60">Online</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" ref={scrollRef}>
            {/* Not logged in */}
            {!isAuthenticated && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <MessageCircle className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">Log in to use the chatbot</p>
                <p className="text-xs text-gray-400">Get product suggestions, size guides, and more</p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="mt-1 rounded-full bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  Log In
                </button>
              </div>
            )}

            {/* Loading history */}
            {isAuthenticated && isLoadingHistory && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                <span className="text-xs text-gray-400">Loading history...</span>
              </div>
            )}

            {/* Empty state */}
            {isAuthenticated && !isLoadingHistory && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <MessageCircle className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">How can I help you today?</p>
                <p className="text-xs text-gray-400">Ask about products, sizes, prices, or recommendations</p>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {['Find a product', 'Size guide', 'Best sellers'].map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => { setInput(hint); }}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:border-black hover:bg-gray-100 transition-colors"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {/* Bot avatar */}
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-black mb-0.5">
                    <MessageCircle className="h-3 w-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === "user"
                      ? "rounded-br-sm bg-black text-white"
                      : "rounded-bl-sm bg-gray-100 text-gray-900"
                    }`}
                >
                  {msg.text}
                  {/* Product suggestions */}
                  {msg.role === "assistant" &&
                    Array.isArray(msg.suggestions) &&
                    msg.suggestions.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {msg.suggestions.map((item) => (
                          <button
                            type="button"
                            key={item.productId}
                            onClick={() => navigate(`/product/${item.productId}`)}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white text-left text-[11px] text-gray-700 transition hover:shadow-md hover:border-gray-300"
                            title={item.name}
                          >
                            <div className="h-16 w-full bg-gray-100">
                              {item.thumbnailUrl ? (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="px-2 py-1.5">
                              <div className="truncate font-medium text-gray-900" title={item.name}>
                                {item.name}
                              </div>
                              {typeof item.price === "number" && (
                                <div className="text-gray-500">
                                  {item.price.toLocaleString("vi-VN")}₫
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isSending && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-black">
                  <MessageCircle className="h-3 w-3 text-white" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-100 bg-white px-3 py-3 flex-shrink-0">
            {error && (
              <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={isAuthenticated ? "Type a message..." : "Log in to chat"}
                className="min-h-[40px] flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
                disabled={!isAuthenticated || isSending}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!isAuthenticated || isSending || !input.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-black text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
        aria-label="Toggle chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default ChatbotWidget;
