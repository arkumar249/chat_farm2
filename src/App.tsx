import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000"; // FastAPI backend URL

export default function App() {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // On mount, restore or create chat session
  useEffect(() => {
    const init = async () => {
      let sessionId = localStorage.getItem("agri_chat_session_id");
      if (!sessionId) {
        // No session, create new chat
        const res = await axios.post(`${API_BASE}/chats/new`);
        sessionId = res.data.session_id;
        localStorage.setItem("agri_chat_session_id", sessionId);
      }
      setCurrentChat(sessionId);
      fetchChats();
      loadChat(sessionId);
    };
    init();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chats`);
      // For each chat, fetch its messages and get the first user message
      const chatsWithNames = await Promise.all(
        res.data.chats.map(async (chat) => {
          const chatRes = await axios.get(`${API_BASE}/chats/${chat.session_id}`);
          const firstUserMsg = chatRes.data.messages?.find(
            (msg) => msg.sender === "user"
          );
          return {
            ...chat,
            chatName: firstUserMsg ? firstUserMsg.text : "New Chat",
          };
        })
      );
      // Sort so newest chats are first
      setChats(chatsWithNames.reverse());
    } catch (err) {
      console.error("Error fetching chats", err);
    }
  };

  const startNewChat = async () => {
    const res = await axios.post(`${API_BASE}/chats/new`);
    setCurrentChat(res.data.session_id);
    setMessages([]);
    setShowWelcome(true);
    localStorage.setItem("agri_chat_session_id", res.data.session_id);
    // Add temp chat to top of list
    setChats((prev) => [
      {
        session_id: res.data.session_id,
        chatName: "New Chat",
      },
      ...prev,
    ]);
  };

  const loadChat = async (sessionId) => {
    setCurrentChat(sessionId);
    const res = await axios.get(`${API_BASE}/chats/${sessionId}`);
    setMessages(res.data.messages);
    setShowWelcome(res.data.messages.length === 0);
    localStorage.setItem("agri_chat_session_id", sessionId);
  };

  // After sending a message, update chat name if it's the first user message
  const sendMessage = async () => {
    if (!input.trim() || !currentChat || isLoading) return;

    const newMessages = [
      ...messages,
      {
        sender: "user",
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ];
    setMessages(newMessages);
    setShowWelcome(false);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chats/${currentChat}/message`, {
        sender: "user",
        text: input,
      });
      setMessages([
        ...newMessages,
        {
          ...res.data.reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      // If this is the first user message, update chat name in sidebar
      if (newMessages.length === 1) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.session_id === currentChat
              ? { ...chat, chatName: input }
              : chat
          )
        );
      }
    } catch (err) {
      console.error("Error sending message", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-200 via-yellow-50 to-green-500 text-gray-900">
      {/* Sidebar */}
      <aside className="w-full max-w-xs bg-gradient-to-b from-green-100 via-yellow-50 to-green-300 shadow-xl border-r border-green-200 flex flex-col md:w-1/4">
        {/* Header */}
        <div className="p-6 flex items-center gap-3 border-b border-green-100">
          <span className="text-4xl">🌱</span>
          <span className="text-2xl font-extrabold tracking-tight text-green-700">FarmSage</span>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            className="w-full bg-gradient-to-r from-green-500 via-yellow-400 to-green-400 hover:from-green-600 hover:to-green-500 text-white py-2 rounded-xl shadow-lg transition font-semibold"
            onClick={startNewChat}
          >
            <span className="mr-2">➕</span> New Chat
          </button>
        </div>

        {/* Recent Chats */}
        <div className="px-6 text-xs uppercase tracking-wide text-green-700 mb-2">Recent Chats</div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-2">
          {chats.map((chat, idx) => (
            <button
              key={chat.session_id}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition shadow-sm
              ${chat.session_id === currentChat
                ? "bg-gradient-to-r from-yellow-200 to-green-100 text-green-900 font-semibold ring-2 ring-green-400"
                : "bg-white hover:bg-green-50 text-gray-700"}
            `}
              onClick={() => loadChat(chat.session_id)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-300 via-yellow-200 to-green-400 text-green-700 font-bold shadow">
                {chat.chatName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left truncate">
                {chat.chatName.length > 30
                  ? chat.chatName.slice(0, 30) + "..."
                  : chat.chatName}
              </div>
              <span className="text-xs text-green-400 ml-2 hidden md:inline">
                {chat.session_id.slice(0, 6)}...
              </span>
            </button>
          ))}
        </nav>

        {/* Light Mode Toggle */}
        <div className="mt-auto p-4 flex items-center gap-2 text-green-500 border-t border-green-100">
          <span>☀️</span>
          <span className="text-sm">Light Mode</span>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-yellow-50 via-green-100 to-green-300 relative">
        {/* Chat Header */}
        {currentChat && (
          <header className="p-6 border-b border-green-100 bg-gradient-to-r from-green-200 via-yellow-100 to-green-100 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 via-yellow-400 to-green-400 flex items-center justify-center text-white font-bold text-xl shadow">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <div className="font-semibold text-lg text-green-700">AgriAI Assistant</div>
              <div className="text-xs text-green-500">Online</div>
            </div>
          </header>
        )}

        {/* Messages */}
        <section className="flex-1 overflow-y-auto px-4 py-6 md:px-12 bg-transparent">
          {showWelcome ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-24 h-24 bg-gradient-to-br from-green-200 via-yellow-100 to-green-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <span className="text-5xl">🌾</span>
              </div>
              <h3 className="text-2xl font-extrabold mb-2 text-green-700">Welcome to FarmSage</h3>
              <p className="text-green-700 text-center max-w-md">
                Your intelligent farming companion.<br />
                Ask about crop management, weather patterns, pest control, soil health, and more.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex mb-6 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-end gap-2 max-w-[80%]`}>
                    {msg.sender !== "user" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 via-yellow-200 to-green-500 flex items-center justify-center text-white font-bold shadow">
                        <span className="text-lg">🤖</span>
                      </div>
                    )}
                    <div
                      className={`px-5 py-3 rounded-2xl shadow-lg text-base break-words
                      ${msg.sender === "user"
                        ? "bg-gradient-to-r from-green-500 to-green-400 text-white rounded-br-none"
                        : "bg-gradient-to-r from-yellow-100 to-green-100 text-green-900 rounded-bl-none border border-green-200"}
                    `}
                    >
                      {msg.text}
                      <div className="text-xs text-green-500 mt-2 text-right">
                        {msg.time || "06:32 PM"}
                      </div>
                    </div>
                    {msg.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-200 via-yellow-100 to-green-400 flex items-center justify-center text-green-700 font-bold shadow">
                        <span className="text-lg">👨‍🌾</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex mb-6 justify-start">
                  <div className="flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg bg-gradient-to-r from-yellow-100 to-green-100 text-green-700 border border-green-200 animate-pulse">
                    <span className="mr-2">⏳</span>
                    <span>Generating answer...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Input Bar */}
        <footer className="w-full px-4 py-4 bg-gradient-to-r from-green-100 via-yellow-50 to-green-200 border-t border-green-100 flex items-center gap-3 fixed bottom-0 left-0 md:static md:rounded-b-2xl md:shadow-lg">
          <button className="text-green-400 text-2xl hover:text-green-600 transition mr-2">
            📎
          </button>
          <input
            className="flex-1 border border-green-200 bg-green-50 text-green-900 rounded-xl px-4 py-3 mr-2 focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            className={`bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white px-6 py-3 rounded-xl shadow-lg transition text-xl font-bold
            ${isLoading || !input.trim() ? "opacity-60 cursor-not-allowed" : ""}
          `}
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            ➤
          </button>
        </footer>
      </main>
    </div>
  );
}

