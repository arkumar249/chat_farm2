import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  
    <App />
 
);
// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const API_BASE = "http://127.0.0.1:8000"; // FastAPI backend URL

// export default function App() {
//   const [chats, setChats] = useState([]);
//   const [currentChat, setCurrentChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);

//   // On mount, restore or create chat session
//   useEffect(() => {
//     const init = async () => {
//       let sessionId = localStorage.getItem("agri_chat_session_id");
//       if (!sessionId) {
//         // No session, create new chat
//         const res = await axios.post(`${API_BASE}/chats/new`);
//         sessionId = res.data.session_id;
//         localStorage.setItem("agri_chat_session_id", sessionId);
//       }
//       setCurrentChat(sessionId);
//       fetchChats();
//       loadChat(sessionId);
//     };
//     init();
//   }, []);

//   const fetchChats = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/chats`);
//       // For each chat, fetch its messages and get the first user message
//       const chatsWithNames = await Promise.all(
//         res.data.chats.map(async (chat) => {
//           const chatRes = await axios.get(`${API_BASE}/chats/${chat.session_id}`);
//           const firstUserMsg = chatRes.data.messages?.find(
//             (msg) => msg.sender === "user"
//           );
//           return {
//             ...chat,
//             chatName: firstUserMsg ? firstUserMsg.text : "New Chat",
//           };
//         })
//       );
//       // Sort so newest chats are first
//       setChats(chatsWithNames.reverse());
//     } catch (err) {
//       console.error("Error fetching chats", err);
//     }
//   };

//   const startNewChat = async () => {
//     const res = await axios.post(`${API_BASE}/chats/new`);
//     setCurrentChat(res.data.session_id);
//     setMessages([]);
//     setShowWelcome(true);
//     localStorage.setItem("agri_chat_session_id", res.data.session_id);
//     // Add temp chat to top of list
//     setChats((prev) => [
//       {
//         session_id: res.data.session_id,
//         chatName: "New Chat",
//       },
//       ...prev,
//     ]);
//   };

//   const loadChat = async (sessionId) => {
//     setCurrentChat(sessionId);
//     const res = await axios.get(`${API_BASE}/chats/${sessionId}`);
//     setMessages(res.data.messages);
//     setShowWelcome(res.data.messages.length === 0);
//     localStorage.setItem("agri_chat_session_id", sessionId);
//   };

//   // After sending a message, update chat name if it's the first user message
//   const sendMessage = async () => {
//     if (!input.trim() || !currentChat || isLoading) return;

//     const newMessages = [
//       ...messages,
//       {
//         sender: "user",
//         text: input,
//         time: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       },
//     ];
//     setMessages(newMessages);
//     setShowWelcome(false);
//     setInput("");
//     setIsLoading(true);

//     try {
//       const res = await axios.post(`${API_BASE}/chats/${currentChat}/message`, {
//         sender: "user",
//         text: input,
//       });
//       setMessages([
//         ...newMessages,
//         {
//           ...res.data.reply,
//           time: new Date().toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//         },
//       ]);
//       // If this is the first user message, update chat name in sidebar
//       if (newMessages.length === 1) {
//         setChats((prev) =>
//           prev.map((chat) =>
//             chat.session_id === currentChat
//               ? { ...chat, chatName: input }
//               : chat
//           )
//         );
//       }
//     } catch (err) {
//       console.error("Error sending message", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-900 text-white">
//       {/* Sidebar */}
//       <div className="w-1/4 bg-gray-800 border-r border-gray-700 flex flex-col">
//         {/* Header */}
//         <div className="p-4 text-xl font-bold border-b border-gray-700">
//           AgriAI Chat
//         </div>

//         {/* New Chat Button */}
//         <div className="p-4">
//           <button
//             className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg shadow-md transition"
//             onClick={startNewChat}
//           >
//             + New Chat
//           </button>
//         </div>

//         {/* Recent Chats */}
//         <div className="px-4 text-sm text-gray-400 mb-2">Recent Chats</div>
//         <div className="flex-1 overflow-y-auto px-2 space-y-2">
//           {chats.map((chat, idx) => (
//             <div
//               key={chat.session_id}
//               className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition ${
//                 chat.session_id === currentChat
//                   ? "bg-yellow-500 text-black font-semibold"
//                   : "bg-gray-700 hover:bg-gray-600"
//               }`}
//               onClick={() => loadChat(chat.session_id)}
//             >
//               <span className="truncate font-semibold">
//                 <span className="text-green-400">🗨️</span>{" "}
//                 {chat.chatName.length > 30
//                   ? chat.chatName.slice(0, 30) + "..."
//                   : chat.chatName}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* Light Mode Toggle */}
//         <div className="mt-auto p-4 flex items-center space-x-2 text-gray-300 border-t border-gray-700">
//           <span>☀️</span>
//           <span>Light Mode</span>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Chat Header */}
//         {currentChat && (
//           <div className="p-4 border-b border-gray-700 bg-gray-800 flex items-center">
//             <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mr-3">
//               AI
//             </div>
//             <div>
//               <div className="font-semibold">AgriAI Assistant</div>
//               <div className="text-xs text-gray-400">Online</div>
//             </div>
//           </div>
//         )}

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
//           {showWelcome ? (
//             <div className="flex flex-col items-center justify-center h-full">
//               <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
//                 <span className="text-3xl">🌾</span>
//               </div>
//               <h3 className="text-2xl font-semibold mb-2 text-green-400">
//                 Welcome to AgriAI Assistant
//               </h3>
//               <p className="text-gray-300 text-center max-w-md">
//                 Your intelligent farming companion. Ask about crop management, weather patterns, pest control, soil health, and more.
//               </p>
//             </div>
//           ) : (
//             <>
//               {messages.map((msg, idx) => (
//                 <div
//                   key={idx}
//                   className={`mb-4 flex ${
//                     msg.sender === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`px-4 py-2 rounded-2xl max-w-[70%] shadow-md ${
//                       msg.sender === "user"
//                         ? "bg-green-600 text-white rounded-br-none"
//                         : "bg-gray-700 text-white rounded-bl-none"
//                     }`}
//                   >
//                     {msg.text}
//                     <div className="text-xs text-gray-300 mt-1 text-right">
//                       {msg.time || "06:32 PM"}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//               {isLoading && (
//                 <div className="mb-4 flex justify-start">
//                   <div className="px-4 py-2 rounded-2xl max-w-[70%] shadow-md bg-gray-700 text-white rounded-bl-none flex items-center">
//                     <span className="animate-pulse mr-2">⏳</span>
//                     <span>Generating answer...</span>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Input Bar */}
//         <div className="p-4 border-t border-gray-700 bg-gray-800 flex items-center">
//           <button className="text-gray-400 mr-2 text-xl">📎</button>
//           <input
//             className="flex-1 border border-gray-600 bg-gray-900 text-white rounded-lg px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Type your message..."
//             disabled={isLoading}
//           />
//           <button
//             className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg shadow-md transition text-xl"
//             onClick={sendMessage}
//             disabled={isLoading || !input.trim()}
//           >
//             ➤
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }