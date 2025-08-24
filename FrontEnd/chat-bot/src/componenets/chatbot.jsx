// // // import React, { useState, useRef, useEffect } from "react";
// // // import { motion } from "framer-motion";
// // // import { RefreshCw, Send, Bot, User } from "lucide-react";

// // // const ChatBot = () => {
// // //   const [messages, setMessages] = useState([]);
// // //   const [inputMessage, setInputMessage] = useState("");
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [databaseInfo, setDatabaseInfo] = useState(null);
// // //   const messagesEndRef = useRef(null);

// // //   // Scroll to bottom if user is already near bottom
// // //   const scrollToBottom = () => {
// // //     if (
// // //       messagesEndRef.current &&
// // //       Math.abs(
// // //         messagesEndRef.current.parentNode.scrollHeight -
// // //           messagesEndRef.current.parentNode.scrollTop -
// // //           messagesEndRef.current.parentNode.clientHeight
// // //       ) < 100
// // //     ) {
// // //       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
// // //     }
// // //   };

// // //   // Load from localStorage
// // //   useEffect(() => {
// // //     const savedMessages =
// // //       JSON.parse(localStorage.getItem("chatMessages")) || [];
// // //     setMessages(savedMessages);
// // //     fetchDatabaseInfo();
// // //   }, []);

// // //   // Save to localStorage
// // //   useEffect(() => {
// // //     localStorage.setItem("chatMessages", JSON.stringify(messages));
// // //     scrollToBottom();
// // //   }, [messages]);

// // //   const fetchDatabaseInfo = async () => {
// // //     try {
// // //       const response = await fetch("http://localhost:5000/api/database-info");
// // //       const data = await response.json();
// // //       setDatabaseInfo(data);
// // //     } catch (error) {
// // //       console.error("Error fetching database info:", error);
// // //     }
// // //   };

// // //   const handleSendMessage = async (e) => {
// // //     e.preventDefault();

// // //     if (!inputMessage.trim() || isLoading) return;

// // //     const userMessage = {
// // //       id: Date.now(),
// // //       text: inputMessage,
// // //       sender: "user",
// // //       timestamp: new Date().toLocaleTimeString(),
// // //     };

// // //     setMessages((prev) => [...prev, userMessage]);
// // //     setInputMessage("");
// // //     setIsLoading(true);

// // //     try {
// // //       const response = await fetch("http://localhost:5000/api/query", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },
// // //         body: JSON.stringify({ query: inputMessage }),
// // //       });

// // //       const data = await response.json();

// // //       if (data.success) {
// // //         const botMessage = {
// // //           id: Date.now() + 1,
// // //           text: data.response,
// // //           sender: "bot",
// // //           timestamp: new Date().toLocaleTimeString(),
// // //         };
// // //         setMessages((prev) => [...prev, botMessage]);
// // //       } else {
// // //         throw new Error(data.error || "Failed to get response");
// // //       }
// // //     } catch (error) {
// // //       const errorMessage = {
// // //         id: Date.now() + 1,
// // //         text: `⚠️ ${error.message}`,
// // //         sender: "error",
// // //         timestamp: new Date().toLocaleTimeString(),
// // //       };
// // //       setMessages((prev) => [...prev, errorMessage]);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
// // //       {/* Header */}
// // //       <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
// // //         <div>
// // //           <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
// // //           {databaseInfo && (
// // //             <div className="text-sm opacity-90 mt-1">
// // //               {databaseInfo.document_count} docs loaded{" "}
// // //               {databaseInfo.pdfs_in_database?.length > 0 && (
// // //                 <span className="ml-2">
// // //                   ({databaseInfo.pdfs_in_database.join(", ")})
// // //                 </span>
// // //               )}
// // //             </div>
// // //           )}
// // //         </div>
// // //         <button
// // //           onClick={fetchDatabaseInfo}
// // //           className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
// // //         >
// // //           <RefreshCw size={14} /> <span>Refresh</span>
// // //         </button>
// // //       </div>

// // //       {/* Messages */}
// // //       <div className="flex-1 overflow-y-auto p-4 space-y-4">
// // //         {messages.length === 0 ? (
// // //           <div className="text-center text-gray-500 mt-8">
// // //             <p className="text-lg">👋 Welcome to Medical RAG ChatBot!</p>
// // //             <p className="text-sm mt-2">
// // //               Ask questions about drug information and medical documents.
// // //             </p>
// // //           </div>
// // //         ) : (
// // //           messages.map((message) => (
// // //             <motion.div
// // //               key={message.id}
// // //               initial={{ opacity: 0, y: 10 }}
// // //               animate={{ opacity: 1, y: 0 }}
// // //               transition={{ duration: 0.3 }}
// // //               className={`flex ${
// // //                 message.sender === "user" ? "justify-end" : "justify-start"
// // //               }`}
// // //             >
// // //               <div className="flex items-end space-x-2 max-w-xl">
// // //                 {message.sender !== "user" && (
// // //                   <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
// // //                     {message.sender === "bot" ? (
// // //                       <Bot size={18} className="text-blue-600" />
// // //                     ) : (
// // //                       "⚠️"
// // //                     )}
// // //                   </div>
// // //                 )}
// // //                 <div
// // //                   className={`rounded-2xl px-4 py-2 shadow-md ${
// // //                     message.sender === "user"
// // //                       ? "bg-blue-600 text-white rounded-br-none"
// // //                       : message.sender === "error"
// // //                       ? "bg-red-100 text-red-800 border border-red-300"
// // //                       : "bg-white text-gray-800 rounded-bl-none"
// // //                   }`}
// // //                 >
// // //                   <p className="text-sm whitespace-pre-wrap">{message.text}</p>
// // //                   <span className="text-xs opacity-70 block mt-1 text-right">
// // //                     {message.timestamp}
// // //                   </span>
// // //                 </div>
// // //                 {message.sender === "user" && (
// // //                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
// // //                     <User size={18} className="text-gray-700" />
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             </motion.div>
// // //           ))
// // //         )}

// // //         {/* Loading typing dots */}
// // //         {isLoading && (
// // //           <motion.div
// // //             initial={{ opacity: 0 }}
// // //             animate={{ opacity: 1 }}
// // //             className="flex justify-start"
// // //           >
// // //             <div className="flex items-center space-x-2 bg-white shadow-md rounded-2xl px-4 py-2 max-w-xs">
// // //               <Bot size={18} className="text-blue-600" />
// // //               <div className="flex space-x-1">
// // //                 <motion.div
// // //                   className="w-2 h-2 bg-gray-400 rounded-full"
// // //                   animate={{ y: [0, -4, 0] }}
// // //                   transition={{
// // //                     duration: 0.6,
// // //                     repeat: Infinity,
// // //                     delay: 0,
// // //                   }}
// // //                 />
// // //                 <motion.div
// // //                   className="w-2 h-2 bg-gray-400 rounded-full"
// // //                   animate={{ y: [0, -4, 0] }}
// // //                   transition={{
// // //                     duration: 0.6,
// // //                     repeat: Infinity,
// // //                     delay: 0.2,
// // //                   }}
// // //                 />
// // //                 <motion.div
// // //                   className="w-2 h-2 bg-gray-400 rounded-full"
// // //                   animate={{ y: [0, -4, 0] }}
// // //                   transition={{
// // //                     duration: 0.6,
// // //                     repeat: Infinity,
// // //                     delay: 0.4,
// // //                   }}
// // //                 />
// // //               </div>
// // //             </div>
// // //           </motion.div>
// // //         )}

// // //         <div ref={messagesEndRef} />
// // //       </div>

// // //       {/* Input */}
// // //       <form
// // //         onSubmit={handleSendMessage}
// // //         className="p-4 bg-white border-t shadow-md"
// // //       >
// // //         <div className="flex space-x-2">
// // //           <textarea
// // //             rows={1}
// // //             value={inputMessage}
// // //             onChange={(e) => setInputMessage(e.target.value)}
// // //             onKeyDown={(e) => {
// // //               if (e.key === "Enter" && !e.shiftKey) {
// // //                 e.preventDefault();
// // //                 handleSendMessage(e);
// // //               }
// // //             }}
// // //             placeholder="Ask about medical information..."
// // //             className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //             disabled={isLoading}
// // //           />
// // //           <button
// // //             type="submit"
// // //             disabled={isLoading || !inputMessage.trim()}
// // //             className="bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
// // //           >
// // //             <Send size={18} />
// // //           </button>
// // //         </div>
// // //       </form>
// // //     </div>
// // //   );
// // // };

// // // export default ChatBot;
// // import React, { useState, useRef, useEffect } from "react";
// // import { motion } from "framer-motion";
// // import { RefreshCw, Send, Bot, User } from "lucide-react";

// // const ChatBot = () => {
// //   const [messages, setMessages] = useState([]);
// //   const [inputMessage, setInputMessage] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [databaseInfo, setDatabaseInfo] = useState(null);
// //   const messagesEndRef = useRef(null);
// //   const [conversationId, setConversationId] = useState(null);

// //   // Generate a unique conversation ID for this session
// //   useEffect(() => {
// //     const newConversationId = Date.now().toString();
// //     setConversationId(newConversationId);
    
// //     // Load from localStorage
// //     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
// //     setMessages(savedMessages);
// //     fetchDatabaseInfo();
// //   }, []);

// //   // Save to localStorage
// //   useEffect(() => {
// //     localStorage.setItem("chatMessages", JSON.stringify(messages));
// //     scrollToBottom();
// //   }, [messages]);

// //   const fetchDatabaseInfo = async () => {
// //     try {
// //       const response = await fetch("http://localhost:5001/api/database-info");
// //       const data = await response.json();
// //       setDatabaseInfo(data);
// //     } catch (error) {
// //       console.error("Error fetching database info:", error);
// //     }
// //   };

// //   const handleSendMessage = async (e) => {
// //     e.preventDefault();

// //     if (!inputMessage.trim() || isLoading) return;

// //     const userMessage = {
// //       id: Date.now(),
// //       text: inputMessage,
// //       sender: "user",
// //       timestamp: new Date().toLocaleTimeString(),
// //     };

// //     setMessages((prev) => [...prev, userMessage]);
// //     setInputMessage("");
// //     setIsLoading(true);

// //     try {
// //       const response = await fetch("http://localhost:5001/api/query", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ 
// //           query: inputMessage,
// //           conversation_id: conversationId 
// //         }),
// //       });

// //       const data = await response.json();

// //       if (data.success) {
// //         const botMessage = {
// //           id: Date.now() + 1,
// //           text: data.response,
// //           sender: "bot",
// //           timestamp: new Date().toLocaleTimeString(),
// //         };
// //         setMessages((prev) => [...prev, botMessage]);
// //       } else {
// //         throw new Error(data.error || "Failed to get response");
// //       }
// //     } catch (error) {
// //       const errorMessage = {
// //         id: Date.now() + 1,
// //         text: `⚠️ ${error.message}`,
// //         sender: "error",
// //         timestamp: new Date().toLocaleTimeString(),
// //       };
// //       setMessages((prev) => [...prev, errorMessage]);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Scroll to bottom if user is already near bottom
// //   const scrollToBottom = () => {
// //     if (
// //       messagesEndRef.current &&
// //       Math.abs(
// //         messagesEndRef.current.parentNode.scrollHeight -
// //           messagesEndRef.current.parentNode.scrollTop -
// //           messagesEndRef.current.parentNode.clientHeight
// //       ) < 100
// //     ) {
// //       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
// //       {/* Header */}
// //       <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
// //         <div>
// //           <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
// //           {databaseInfo && (
// //             <div className="text-sm opacity-90 mt-1">
// //               {databaseInfo.document_count} docs loaded{" "}
// //               {databaseInfo.pdfs_in_database?.length > 0 && (
// //                 <span className="ml-2">
// //                   ({databaseInfo.pdfs_in_database.join(", ")})
// //                 </span>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //         <button
// //           onClick={fetchDatabaseInfo}
// //           className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
// //         >
// //           <RefreshCw size={14} /> <span>Refresh</span>
// //         </button>
// //       </div>

// //       {/* Messages */}
// //       <div className="flex-1 overflow-y-auto p-4 space-y-4">
// //         {messages.length === 0 ? (
// //           <div className="text-center text-gray-500 mt-8">
// //             <p className="text-lg">👋 Welcome to Medical RAG ChatBot!</p>
// //             <p className="text-sm mt-2">
// //               Ask questions about drug information and medical documents.
// //             </p>
// //           </div>
// //         ) : (
// //           messages.map((message) => (
// //             <motion.div
// //               key={message.id}
// //               initial={{ opacity: 0, y: 10 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               transition={{ duration: 0.3 }}
// //               className={`flex ${
// //                 message.sender === "user" ? "justify-end" : "justify-start"
// //               }`}
// //             >
// //               <div className="flex items-end space-x-2 max-w-xl">
// //                 {message.sender !== "user" && (
// //                   <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
// //                     {message.sender === "bot" ? (
// //                       <Bot size={18} className="text-blue-600" />
// //                     ) : (
// //                       "⚠️"
// //                     )}
// //                   </div>
// //                 )}
// //                 <div
// //                   className={`rounded-2xl px-4 py-2 shadow-md ${
// //                     message.sender === "user"
// //                       ? "bg-blue-600 text-white rounded-br-none"
// //                       : message.sender === "error"
// //                       ? "bg-red-100 text-red-800 border border-red-300"
// //                       : "bg-white text-gray-800 rounded-bl-none"
// //                   }`}
// //                 >
// //                   <p className="text-sm whitespace-pre-wrap">{message.text}</p>
// //                   <span className="text-xs opacity-70 block mt-1 text-right">
// //                     {message.timestamp}
// //                   </span>
// //                 </div>
// //                 {message.sender === "user" && (
// //                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
// //                     <User size={18} className="text-gray-700" />
// //                   </div>
// //                 )}
// //               </div>
// //             </motion.div>
// //           ))
// //         )}

// //         {/* Loading typing dots */}
// //         {isLoading && (
// //           <motion.div
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             className="flex justify-start"
// //           >
// //             <div className="flex items-center space-x-2 bg-white shadow-md rounded-2xl px-4 py-2 max-w-xs">
// //               <Bot size={18} className="text-blue-600" />
// //               <div className="flex space-x-1">
// //                 <motion.div
// //                   className="w-2 h-2 bg-gray-400 rounded-full"
// //                   animate={{ y: [0, -4, 0] }}
// //                   transition={{
// //                     duration: 0.6,
// //                     repeat: Infinity,
// //                     delay: 0,
// //                   }}
// //                 />
// //                 <motion.div
// //                   className="w-2 h-2 bg-gray-400 rounded-full"
// //                   animate={{ y: [0, -4, 0] }}
// //                   transition={{
// //                     duration: 0.6,
// //                     repeat: Infinity,
// //                     delay: 0.2,
// //                   }}
// //                 />
// //                 <motion.div
// //                   className="w-2 h-2 bg-gray-400 rounded-full"
// //                   animate={{ y: [0, -4, 0] }}
// //                   transition={{
// //                     duration: 0.6,
// //                     repeat: Infinity,
// //                     delay: 0.4,
// //                   }}
// //                 />
// //               </div>
// //             </div>
// //           </motion.div>
// //         )}

// //         <div ref={messagesEndRef} />
// //       </div>

// //       {/* Input */}
// //       <form
// //         onSubmit={handleSendMessage}
// //         className="p-4 bg-white border-t shadow-md"
// //       >
// //         <div className="flex space-x-2">
// //           <textarea
// //             rows={1}
// //             value={inputMessage}
// //             onChange={(e) => setInputMessage(e.target.value)}
// //             onKeyDown={(e) => {
// //               if (e.key === "Enter" && !e.shiftKey) {
// //                 e.preventDefault();
// //                 handleSendMessage(e);
// //               }
// //             }}
// //             placeholder="Ask about medical information..."
// //             className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             disabled={isLoading}
// //           />
// //           <button
// //             type="submit"
// //             disabled={isLoading || !inputMessage.trim()}
// //             className="bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
// //           >
// //             <Send size={18} />
// //           </button>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // };

// // export default ChatBot;


// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import { RefreshCw, Send, Bot, User, Trash2 } from "lucide-react";

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [databaseInfo, setDatabaseInfo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [conversationId, setConversationId] = useState(null);
//   const [conversationHistory, setConversationHistory] = useState([]);

//   // Generate a unique conversation ID for this session
//   useEffect(() => {
//     const newConversationId = Date.now().toString();
//     setConversationId(newConversationId);
    
//     // Load from localStorage
//     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     setMessages(savedMessages);
//     fetchDatabaseInfo();
//     loadConversationHistory();
//   }, []);

//   // Save to localStorage
//   useEffect(() => {
//     localStorage.setItem("chatMessages", JSON.stringify(messages));
//     scrollToBottom();
//   }, [messages]);

//   const loadConversationHistory = async () => {
//     try {
//       const response = await fetch(`http://localhost:5001/api/conversation/${conversationId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setConversationHistory(data.history || []);
//       }
//     } catch (error) {
//       console.error("Error loading conversation history:", error);
//     }
//   };

//   const clearConversation = async () => {
//     try {
//       const response = await fetch(`http://localhost:5001/api/conversation/${conversationId}`, {
//         method: 'DELETE'
//       });
      
//       if (response.ok) {
//         setMessages([]);
//         setConversationHistory([]);
//         localStorage.removeItem("chatMessages");
//         // Generate new conversation ID
//         const newConversationId = Date.now().toString();
//         setConversationId(newConversationId);
//       }
//     } catch (error) {
//       console.error("Error clearing conversation:", error);
//     }
//   };

//   const fetchDatabaseInfo = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       setDatabaseInfo(data);
//     } catch (error) {
//       console.error("Error fetching database info:", error);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();

//     if (!inputMessage.trim() || isLoading) return;

//     const userMessage = {
//       id: Date.now(),
//       text: inputMessage,
//       sender: "user",
//       timestamp: new Date().toLocaleTimeString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:5001/api/query", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//           query: inputMessage,
//           conversation_id: conversationId 
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         const botMessage = {
//           id: Date.now() + 1,
//           text: data.response,
//           sender: "bot",
//           timestamp: new Date().toLocaleTimeString(),
//         };
//         setMessages((prev) => [...prev, botMessage]);
//         // Reload conversation history to get updated context
//         loadConversationHistory();
//       } else {
//         throw new Error(data.error || "Failed to get response");
//       }
//     } catch (error) {
//       const errorMessage = {
//         id: Date.now() + 1,
//         text: `⚠️ ${error.message}`,
//         sender: "error",
//         timestamp: new Date().toLocaleTimeString(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Scroll to bottom if user is already near bottom
//   const scrollToBottom = () => {
//     if (
//       messagesEndRef.current &&
//       Math.abs(
//         messagesEndRef.current.parentNode.scrollHeight -
//           messagesEndRef.current.parentNode.scrollTop -
//           messagesEndRef.current.parentNode.clientHeight
//       ) < 100
//     ) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
//         <div>
//           <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
//           {databaseInfo && (
//             <div className="text-sm opacity-90 mt-1">
//               {databaseInfo.document_count} docs loaded{" "}
//               {databaseInfo.pdfs_in_database?.length > 0 && (
//                 <span className="ml-2">
//                   ({databaseInfo.pdfs_in_database.join(", ")})
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={clearConversation}
//             className="flex items-center space-x-1 text-sm bg-red-500 text-white px-3 py-1 rounded-md shadow hover:bg-red-600 transition"
//             title="Clear conversation"
//           >
//             <Trash2 size={14} /> <span>Clear</span>
//           </button>
//           <button
//             onClick={fetchDatabaseInfo}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <RefreshCw size={14} /> <span>Refresh</span>
//           </button>
//         </div>
//       </div>

//       {/* Conversation context bar */}
//       {conversationHistory.length > 0 && (
//         <div className="bg-blue-100 text-blue-800 p-2 text-sm border-b">
//           <div className="flex items-center space-x-2">
//             <span className="font-semibold">Context:</span>
//             <span className="truncate">
//               {conversationHistory[conversationHistory.length - 1]?.user_query || "Active conversation"}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 ? (
//           <div className="text-center text-gray-500 mt-8">
//             <p className="text-lg">👋 Welcome to Medical RAG ChatBot!</p>
//             <p className="text-sm mt-2">
//               Ask questions about drug information and medical documents.
//               <br />
//               The system now remembers conversation context for follow-up questions.
//             </p>
//           </div>
//         ) : (
//           messages.map((message) => (
//             <motion.div
//               key={message.id}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//               className={`flex ${
//                 message.sender === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div className="flex items-end space-x-2 max-w-xl">
//                 {message.sender !== "user" && (
//                   <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
//                     {message.sender === "bot" ? (
//                       <Bot size={18} className="text-blue-600" />
//                     ) : (
//                       "⚠️"
//                     )}
//                   </div>
//                 )}
//                 <div
//                   className={`rounded-2xl px-4 py-2 shadow ${
//                     message.sender === "user"
//                       ? "bg-blue-600 text-white rounded-br-md"
//                       : message.sender === "error"
//                       ? "bg-red-100 text-red-800 rounded-bl-md"
//                       : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
//                   }`}
//                 >
//                   <p className="whitespace-pre-wrap">{message.text}</p>
//                   <p className="text-xs opacity-70 mt-1 text-right">
//                     {message.timestamp}
//                   </p>
//                 </div>
//                 {message.sender === "user" && (
//                   <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow">
//                     <User size={18} className="text-gray-600" />
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           ))
//         )}
//         {isLoading && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="flex justify-start space-x-2"
//           >
//             <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
//               <Bot size={18} className="text-blue-600" />
//             </div>
//             <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow">
//               <div className="flex space-x-1">
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//               </div>
//             </div>
//           </motion.div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <form
//         onSubmit={handleSendMessage}
//         className="p-4 border-t bg-white shadow-inner"
//       >
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             placeholder="Ask about drug information..."
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             disabled={isLoading}
//           />
//           <button
//             type="submit"
//             disabled={isLoading || !inputMessage.trim()}
//             className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
//           >
//             {isLoading ? (
//               <RefreshCw size={20} className="animate-spin" />
//             ) : (
//               <Send size={20} />
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ChatBot;


// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import { RefreshCw, Send, Bot, User, Trash2 } from "lucide-react";

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [databaseInfo, setDatabaseInfo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [conversationId, setConversationId] = useState(null);
//   const [conversationHistory, setConversationHistory] = useState([]);

//   // Generate a unique conversation ID for this session
//   useEffect(() => {
//     const newConversationId = Date.now().toString();
//     setConversationId(newConversationId);
    
//     // Load from localStorage
//     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     setMessages(savedMessages);
//     fetchDatabaseInfo();
//     loadConversationHistory();
//   }, []);

//   // Save to localStorage
//   useEffect(() => {
//     localStorage.setItem("chatMessages", JSON.stringify(messages));
//     scrollToBottom();
//   }, [messages]);

//   const loadConversationHistory = async () => {
//     if (!conversationId) return;
    
//     try {
//       const response = await fetch(`http://localhost:5001/api/conversation/${conversationId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setConversationHistory(data.history || []);
        
//         // If we have history but no messages, populate messages from history
//         if (data.history.length > 0 && messages.length === 0) {
//           const historyMessages = data.history.flatMap(exchange => [
//             {
//               id: Date.now() + Math.random(),
//               text: exchange.user_query,
//               sender: "user",
//               timestamp: new Date(exchange.timestamp).toLocaleTimeString(),
//             },
//             {
//               id: Date.now() + Math.random() + 1,
//               text: exchange.assistant_response,
//               sender: "bot",
//               timestamp: new Date(exchange.timestamp).toLocaleTimeString(),
//             }
//           ]);
//           setMessages(historyMessages);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading conversation history:", error);
//     }
//   };

//   const clearConversation = async () => {
//     try {
//       const response = await fetch(`http://localhost:5001/api/conversation/${conversationId}`, {
//         method: 'DELETE'
//       });
      
//       if (response.ok) {
//         setMessages([]);
//         setConversationHistory([]);
//         localStorage.removeItem("chatMessages");
//         // Generate new conversation ID
//         const newConversationId = Date.now().toString();
//         setConversationId(newConversationId);
//       }
//     } catch (error) {
//       console.error("Error clearing conversation:", error);
//     }
//   };

//   const fetchDatabaseInfo = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       setDatabaseInfo(data);
//     } catch (error) {
//       console.error("Error fetching database info:", error);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();

//     if (!inputMessage.trim() || isLoading) return;

//     const userMessage = {
//       id: Date.now(),
//       text: inputMessage,
//       sender: "user",
//       timestamp: new Date().toLocaleTimeString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:5001/api/query", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//           query: inputMessage,
//           conversation_id: conversationId 
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         const botMessage = {
//           id: Date.now() + 1,
//           text: data.response,
//           sender: "bot",
//           timestamp: new Date().toLocaleTimeString(),
//         };
//         setMessages((prev) => [...prev, botMessage]);
//         // Reload conversation history to get updated context
//         loadConversationHistory();
//       } else {
//         throw new Error(data.error || "Failed to get response");
//       }
//     } catch (error) {
//       const errorMessage = {
//         id: Date.now() + 1,
//         text: `⚠️ ${error.message}`,
//         sender: "error",
//         timestamp: new Date().toLocaleTimeString(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Scroll to bottom if user is already near bottom
//   const scrollToBottom = () => {
//     if (
//       messagesEndRef.current &&
//       Math.abs(
//         messagesEndRef.current.parentNode.scrollHeight -
//           messagesEndRef.current.parentNode.scrollTop -
//           messagesEndRef.current.parentNode.clientHeight
//       ) < 100
//     ) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
//         <div>
//           <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
//           {databaseInfo && (
//             <div className="text-sm opacity-90 mt-1">
//               {databaseInfo.document_count} docs loaded{" "}
//               {databaseInfo.pdfs_in_database?.length > 0 && (
//                 <span className="ml-2">
//                   ({databaseInfo.pdfs_in_database.join(", ")})
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={clearConversation}
//             className="flex items-center space-x-1 text-sm bg-red-500 text-white px-3 py-1 rounded-md shadow hover:bg-red-600 transition"
//             title="Clear conversation"
//           >
//             <Trash2 size={14} /> <span>Clear</span>
//           </button>
//           <button
//             onClick={fetchDatabaseInfo}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <RefreshCw size={14} /> <span>Refresh</span>
//           </button>
//         </div>
//       </div>

//       {/* Conversation context bar */}
//       {conversationHistory.length > 0 && (
//         <div className="bg-blue-100 text-blue-800 p-2 text-sm border-b">
//           <div className="flex items-center space-x-2">
//             <span className="font-semibold">Context:</span>
//             <span className="truncate">
//               {conversationHistory[conversationHistory.length - 1]?.user_query || "Active conversation"}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 ? (
//           <div className="text-center text-gray-500 mt-8">
//             <p className="text-lg">👋 Welcome to Medical RAG ChatBot!</p>
//             <p className="text-sm mt-2">
//               Ask questions about drug information and medical documents.
//               <br />
//               The system now remembers conversation context for follow-up questions.
//             </p>
//           </div>
//         ) : (
//           messages.map((message) => (
//             <motion.div
//               key={message.id}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//               className={`flex ${
//                 message.sender === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div className="flex items-end space-x-2 max-w-xl">
//                 {message.sender !== "user" && (
//                   <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
//                     {message.sender === "bot" ? (
//                       <Bot size={18} className="text-blue-600" />
//                     ) : (
//                       "⚠️"
//                     )}
//                   </div>
//                 )}
//                 <div
//                   className={`rounded-2xl px-4 py-2 shadow ${
//                     message.sender === "user"
//                       ? "bg-blue-600 text-white rounded-br-md"
//                       : message.sender === "error"
//                       ? "bg-red-100 text-red-800 rounded-bl-md"
//                       : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
//                   }`}
//                 >
//                   <p className="whitespace-pre-wrap">{message.text}</p>
//                   <p className="text-xs opacity-70 mt-1 text-right">
//                     {message.timestamp}
//                   </p>
//                 </div>
//                 {message.sender === "user" && (
//                   <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow">
//                     <User size={18} className="text-gray-600" />
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           ))
//         )}
//         {isLoading && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="flex justify-start space-x-2"
//           >
//             <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
//               <Bot size={18} className="text-blue-600" />
//             </div>
//             <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow">
//               <div className="flex space-x-1">
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//               </div>
//             </div>
//           </motion.div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <form
//         onSubmit={handleSendMessage}
//         className="p-4 border-t bg-white shadow-inner"
//       >
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             placeholder="Ask about drug information..."
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isLoading}
//           />
//           <button
//             type="submit"
//             disabled={isLoading || !inputMessage.trim()}
//             className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
//           >
//             {isLoading ? (
//               <RefreshCw size={20} className="animate-spin" />
//             ) : (
//               <Send size={20} />
//             )}
//           </button>
//         </div>
//         <div className="text-xs text-gray-500 mt-2 text-center">
//           The chatbot now remembers conversation context for follow-up questions
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ChatBot;


import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Send, Bot, User, Trash2 } from "lucide-react";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);
  const [conversationContext, setConversationContext] = useState(null);

  // Generate a unique conversation ID for this session
  useEffect(() => {
    const newConversationId = Date.now().toString();
    setConversationId(newConversationId);
    
    // Load from localStorage
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(savedMessages);
    fetchDatabaseInfo();
    loadConversationContext(newConversationId);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const loadConversationContext = async (conversationId) => {
    if (!conversationId) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/conversation/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversationContext(data);
        
        // If we have history but no messages, populate messages from history
        if (data.history && data.history.length > 0 && messages.length === 0) {
          const historyMessages = data.history.flatMap(exchange => [
            {
              id: Date.now() + Math.random(),
              text: exchange.user_query,
              sender: "user",
              timestamp: new Date(exchange.timestamp).toLocaleTimeString(),
            },
            {
              id: Date.now() + Math.random() + 1,
              text: exchange.assistant_response,
              sender: "bot",
              timestamp: new Date(exchange.timestamp).toLocaleTimeString(),
            }
          ]);
          setMessages(historyMessages);
        }
      }
    } catch (error) {
      console.error("Error loading conversation context:", error);
    }
  };

  const clearConversation = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/conversation/${conversationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMessages([]);
        setConversationContext(null);
        localStorage.removeItem("chatMessages");
        // Generate new conversation ID
        const newConversationId = Date.now().toString();
        setConversationId(newConversationId);
        loadConversationContext(newConversationId);
      }
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
  };

  const fetchDatabaseInfo = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/database-info");
      const data = await response.json();
      setDatabaseInfo(data);
    } catch (error) {
      console.error("Error fetching database info:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: inputMessage,
          conversation_id: conversationId 
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, botMessage]);
        // Reload conversation context to get updated data
        loadConversationContext(conversationId);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `⚠️ ${error.message}`,
        sender: "error",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom if user is already near bottom
  const scrollToBottom = () => {
    if (
      messagesEndRef.current &&
      Math.abs(
        messagesEndRef.current.parentNode.scrollHeight -
          messagesEndRef.current.parentNode.scrollTop -
          messagesEndRef.current.parentNode.clientHeight
      ) < 100
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
          {databaseInfo && (
            <div className="text-sm opacity-90 mt-1">
              {databaseInfo.document_count} docs loaded{" "}
              {databaseInfo.pdfs_in_database?.length > 0 && (
                <span className="ml-2">
                  ({databaseInfo.pdfs_in_database.join(", ")})
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={clearConversation}
            className="flex items-center space-x-1 text-sm bg-red-500 text-white px-3 py-1 rounded-md shadow hover:bg-red-600 transition"
            title="Clear conversation"
          >
            <Trash2 size={14} /> <span>Clear</span>
          </button>
          <button
            onClick={fetchDatabaseInfo}
            className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
          >
            <RefreshCw size={14} /> <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Conversation context bar */}
      {conversationContext && (
        <div className="bg-blue-100 text-blue-800 p-2 text-sm border-b">
          <div className="flex flex-col space-y-1">
            {conversationContext.current_drug && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Current Drug:</span>
                <span className="capitalize">{conversationContext.current_drug}</span>
              </div>
            )}
            {conversationContext.history && conversationContext.history.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Last Query:</span>
                <span className="truncate">
                  {conversationContext.history[conversationContext.history.length - 1]?.user_query}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">👋 Welcome to Medical RAG ChatBot!</p>
            <p className="text-sm mt-2">
              Ask questions about drug information and medical documents.
              <br />
              The system now remembers conversation context for follow-up questions.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-end space-x-2 max-w-xl">
                {message.sender !== "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
                    {message.sender === "bot" ? (
                      <Bot size={18} className="text-blue-600" />
                    ) : (
                      "⚠️"
                    )}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 shadow ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : message.sender === "error"
                      ? "bg-red-100 text-red-800 rounded-bl-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow">
                    <User size={18} className="text-gray-600" />
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
              <Bot size={18} className="text-blue-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t bg-white shadow-inner"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about drug information..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          The chatbot now remembers conversation context for follow-up questions
        </div>
      </form>
    </div>
  );
};

export default ChatBot;