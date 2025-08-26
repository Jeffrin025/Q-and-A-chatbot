// chatbot.jsx

// the version that works completely but also does not have parallel processing 


// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import { RefreshCw, Send, Bot, User, Trash2, Mic, Moon, Sun, Copy, Volume2, VolumeX, Upload, X } from "lucide-react";

// const ChatBot = ({ username, onSaveChat }) => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [databaseInfo, setDatabaseInfo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [conversationId, setConversationId] = useState(null);
//   const [conversationContext, setConversationContext] = useState(null);
//   const [darkMode, setDarkMode] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [speakingMessageId, setSpeakingMessageId] = useState(null);
//   const recognitionRef = useRef(null);

//   // 🟢 PDF Upload & Selection States
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState({});
//   const [selectedPdf, setSelectedPdf] = useState("");
//   const [availablePdfs, setAvailablePdfs] = useState([]);

//   // 🟢 Load available PDFs
//   useEffect(() => {
//     fetchAvailablePdfs();
//   }, []);

//   const fetchAvailablePdfs = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       if (data.pdfs_in_database) {
//         setAvailablePdfs(data.pdfs_in_database);
//       }
//     } catch (error) {
//       console.error("Error fetching PDFs:", error);
//     }
//   };

//   // 🟢 Upload handler
//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await fetch("http://localhost:5001/api/upload-pdf", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (data.success) {
//         setUploadStatus({
//           id: data.upload_id,
//           filename: data.filename,
//           status: "queued",
//           progress: 0,
//         });
//         // Start polling
//         pollUploadStatus(data.upload_id);
//       } else {
//         alert(`Upload failed: ${data.error}`);
//       }
//     } catch (error) {
//       alert("Upload failed");
//       console.error("Upload error:", error);
//     }
//   };

//   // 🟢 Poll upload status
//   const pollUploadStatus = async (uploadId) => {
//     const checkStatus = async () => {
//       try {
//         const response = await fetch(`http://localhost:5001/api/upload-status/${uploadId}`);
//         const status = await response.json();

//         setUploadStatus(status);

//         if (status.status === "processing" || status.status === "queued") {
//           setTimeout(checkStatus, 2000);
//         } else if (status.status === "completed") {
//           alert(`File ${status.filename} processed successfully!`);
//           fetchAvailablePdfs();
//         } else if (status.status === "failed") {
//           alert(`Processing failed: ${status.error || "Unknown error"}`);
//         }
//       } catch (error) {
//         console.error("Error checking status:", error);
//       }
//     };

//     checkStatus();
//   };

//   // 🟢 Speech Recognition Setup
//   useEffect(() => {
//     if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
//       const SpeechRecognition =
//         window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognition = new SpeechRecognition();
//       recognition.lang = "en-US";
//       recognition.interimResults = false;
//       recognition.maxAlternatives = 1;

//       recognition.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         setInputMessage(transcript);
//       };

//       recognition.onend = () => setIsListening(false);

//       recognitionRef.current = recognition;
//     }
//   }, []);

//   const startListening = () => {
//     if (recognitionRef.current && !isListening) {
//       setIsListening(true);
//       recognitionRef.current.start();
//     }
//   };

//   // 🟢 Text-to-Speech
//   const speakText = (text, messageId) => {
//     if ("speechSynthesis" in window) {
//       if (speakingMessageId) {
//         speechSynthesis.cancel();
//       }
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = "en-US";

//       utterance.onend = () => setSpeakingMessageId(null);
//       utterance.onerror = () => setSpeakingMessageId(null);

//       speechSynthesis.speak(utterance);
//       setSpeakingMessageId(messageId);
//     }
//   };

//   const stopSpeaking = () => {
//     if ("speechSynthesis" in window) {
//       speechSynthesis.cancel();
//       setSpeakingMessageId(null);
//     }
//   };

//   // Conversation Setup
//   useEffect(() => {
//     const newConversationId = Date.now().toString();
//     setConversationId(newConversationId);
//     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     setMessages(savedMessages);
//     fetchDatabaseInfo();
//     loadConversationContext(newConversationId);
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("chatMessages", JSON.stringify(messages));
//     scrollToBottom();
//   }, [messages]);

//   const saveChatToServer = async (message, sender) => {
//     try {
//       await fetch("http://localhost:5000/api/save-chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username,
//           message,
//           sender,
//           timestamp: new Date().toISOString()
//         })
//       });
//       if (onSaveChat) onSaveChat();
//     } catch (error) {
//       console.error("Error saving chat:", error);
//     }
//   };

//   const loadConversationContext = async (conversationId) => {
//     try {
//       const response = await fetch(`http://localhost:5001/api/conversation/${conversationId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setConversationContext(data);
//       }
//     } catch (error) {
//       console.error("Error loading conversation context:", error);
//     }
//   };

//   const clearConversation = async () => {
//     try {
//       await fetch(`http://localhost:5001/api/conversation/${conversationId}`, {
//         method: "DELETE",
//       });
//       setMessages([]);
//       setConversationContext(null);
//       localStorage.removeItem("chatMessages");
//       setConversationId(Date.now().toString());
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

//   // 🟢 Modified sendMessage with PDF selection
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
//     saveChatToServer(inputMessage, "user");
//     setInputMessage("");
//     setIsLoading(true);

//     try {
//       let response;
//       if (selectedPdf) {
//         response = await fetch("http://localhost:5001/api/query-pdf", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             query: inputMessage,
//             pdf_name: selectedPdf,
//             conversation_id: conversationId
//           }),
//         });
//       } else {
//         response = await fetch("http://localhost:5001/api/query", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ query: inputMessage, conversation_id: conversationId }),
//         });
//       }

//       const data = await response.json();

//       if (data.success) {
//         const botMessage = {
//           id: Date.now() + 1,
//           text: data.response,
//           sender: "bot",
//           timestamp: new Date().toLocaleTimeString(),
//         };
//         setMessages((prev) => [...prev, botMessage]);
//         saveChatToServer(data.response, "bot");
//       }
//     } catch (error) {
//       const errorMessage = {
//         id: Date.now() + 1,
//         text: `⚠️ ${error.message}`,
//         sender: "error",
//         timestamp: new Date().toLocaleTimeString(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//       saveChatToServer(`Error: ${error.message}`, "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const copyMessage = (text) => {
//     navigator.clipboard.writeText(text);
//     // You could use a toast notification here instead of alert
//   };

//   const downloadChat = () => {
//     const chatText = messages.map((m) => `[${m.sender}] ${m.text}`).join("\n");
//     const blob = new Blob([chatText], { type: "text/plain" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "chat_history.txt";
//     link.click();
//   };

//   return (

//     //new bit

//     <div className="w-screen h-screen flex flex-col">
//       <div className={`flex flex-col flex-1 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
//     {



//     <div className={`flex flex-col h-full ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex justify-between items-center">
//         <div>
//           <h1 className="text-xl font-bold text-gray-800">💊 Medical RAG ChatBot</h1>
//           {databaseInfo && <p className="text-sm text-gray-500">{databaseInfo.document_count} documents loaded</p>}
//         </div>
//         <div className="flex space-x-2">
//           <button onClick={clearConversation} className="flex items-center space-x-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition">
//             <Trash2 size={16}/>
//             <span>Clear</span>
//           </button>
//           <button onClick={fetchDatabaseInfo} className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition">
//             <RefreshCw size={16}/>
//             <span>Refresh</span>
//           </button>
//           <button onClick={downloadChat} className="flex items-center space-x-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition">
//             <span>Save Chat</span>
//           </button>
//           <button onClick={() => setDarkMode(!darkMode)} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition">
//             {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
//           </button>
//         </div>
//       </div>

//       {/* PDF Select + Upload */}
//       <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-gray-50">
//         <div className="flex-1">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Select PDF</label>
//           <select 
//             value={selectedPdf} 
//             onChange={(e) => setSelectedPdf(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//           >
//             <option value="">All PDFs</option>
//             {availablePdfs.map(pdf => (
//               <option key={pdf} value={pdf}>{pdf}</option>
//             ))}
//           </select>
//         </div>
        
//         <button 
//           onClick={() => setShowUploadModal(true)}
//           className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mt-6 transition"
//         >
//           <Upload size={16}/>
//           <span>Upload PDF</span>
//         </button>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
//         {messages.length === 0 && (
//           <div className="flex flex-col items-center justify-center h-full text-gray-400">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
//               <Bot size={48} className="mx-auto text-blue-500 mb-4" />
//               <h3 className="text-lg font-medium text-gray-700 mb-2">Welcome to Medical RAG ChatBot</h3>
//               <p className="text-gray-500">Ask questions about drug information, or select a specific PDF to query.</p>
//             </div>
//           </div>
//         )}
        
//         {messages.map((message) => (
//           <motion.div 
//             key={message.id} 
//             initial={{ opacity: 0, y: 10 }} 
//             animate={{ opacity: 1, y: 0 }}
//             className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
//           >
//             <div className={`p-4 rounded-2xl max-w-xl relative ${message.sender === "user" 
//               ? "bg-blue-600 text-white" 
//               : message.sender === "error" 
//                 ? "bg-red-100 text-red-800 border border-red-200"
//                 : "bg-white text-gray-800 shadow-sm border border-gray-200"}`}
//             >
//               <p className="whitespace-pre-wrap">{message.text}</p>
//               <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
              
//               {message.sender === "bot" && (
//                 <div className="absolute -bottom-4 right-2 flex space-x-1 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
//                   <button 
//                     onClick={() => copyMessage(message.text)} 
//                     className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                     title="Copy message"
//                   >
//                     <Copy size={14}/>
//                   </button>
//                   {speakingMessageId === message.id ? (
//                     <button 
//                       onClick={stopSpeaking} 
//                       className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-gray-100 transition"
//                       title="Stop speaking"
//                     >
//                       <VolumeX size={14}/>
//                     </button>
//                   ) : (
//                     <button 
//                       onClick={() => speakText(message.text, message.id)} 
//                       className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                       title="Read aloud"
//                     >
//                       <Volume2 size={14}/>
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         ))}
        
//         {isLoading && (
//           <div className="flex justify-start">
//             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 max-w-xs">
//               <div className="flex space-x-2 items-center">
//                 <div className="flex space-x-1">
//                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                 </div>
//                 <span className="text-sm text-gray-500">Processing your question...</span>
//               </div>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
//         <div className="flex space-x-3">
//           <button 
//             type="button" 
//             onClick={startListening} 
//             className={`w-12 h-12 rounded-full flex items-center justify-center transition ${isListening 
//               ? "bg-red-500 text-white animate-pulse" 
//               : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
//             title={isListening ? "Listening..." : "Voice input"}
//           >
//             <Mic size={20} />
//           </button>
          
//           <input 
//             value={inputMessage} 
//             onChange={(e) => setInputMessage(e.target.value)} 
//             placeholder="Ask about drug information..." 
//             className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//           />
          
//           <button 
//             type="submit" 
//             disabled={isLoading || !inputMessage.trim()}
//             className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
//           >
//             <Send size={20}/>
//           </button>
//         </div>
//       </form>

//       {/* Upload Modal */}
//       {showUploadModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
//             <div className="flex justify-between items-center mb-5">
//               <h2 className="text-xl font-semibold text-gray-800">Upload PDF Document</h2>
//               <button 
//                 onClick={() => setShowUploadModal(false)}
//                 className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
//               >
//                 <X size={20} />
//               </button>
//             </div>
            
//             <div className="mb-5">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF file</label>
//               <div className="flex items-center justify-center w-full">
//                 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
//                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                     <Upload className="w-8 h-8 mb-3 text-gray-400" />
//                     <p className="mb-2 text-sm text-gray-500">Click to upload or drag and drop</p>
//                     <p className="text-xs text-gray-500">PDF (max. 10MB)</p>
//                   </div>
//                   <input 
//                     type="file" 
//                     accept=".pdf"
//                     onChange={handleFileUpload}
//                     className="hidden"
//                   />
//                 </label>
//               </div>
//             </div>
            
//             {uploadStatus.id && (
//               <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                 <div className="flex justify-between items-center mb-2">
//                   <span className="text-sm font-medium text-blue-700">Processing: {uploadStatus.filename}</span>
//                   <span className={`text-xs font-medium px-2 py-1 rounded-full ${
//                     uploadStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
//                     uploadStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
//                     'bg-blue-100 text-blue-800'
//                   }`}>
//                     {uploadStatus.status.charAt(0).toUpperCase() + uploadStatus.status.slice(1)}
//                   </span>
//                 </div>
                
//                 {uploadStatus.progress > 0 && (
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
//                       style={{ width: `${uploadStatus.progress}%` }}
//                     ></div>
//                   </div>
//                 )}
                
//                 {uploadStatus.status === 'processing' && uploadStatus.progress > 0 && (
//                   <p className="text-xs text-blue-600 mt-2">{uploadStatus.progress}% complete</p>
//                 )}
//               </div>
//             )}
            
//             <div className="flex justify-end">
//               <button 
//                 onClick={() => setShowUploadModal(false)}
//                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//     //new bit 
//     }
//   </div>
// </div>

//   );
// };

// export default ChatBot;























// ==================================================================the version with the recomendations===========================================================================

// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   RefreshCw, Send, Bot, User, Trash2, Mic, Moon, Sun, Copy, 
//   Download, BookOpen, Database, Zap, Settings, X, Maximize2,
//   Minimize2, Bookmark, BookmarkCheck, Heart, Share2, Image, FileText
// } from "lucide-react";

// const ChatBot = ({ username, onSaveChat }) => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [databaseInfo, setDatabaseInfo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [conversationId, setConversationId] = useState(null);
//   const [conversationContext, setConversationContext] = useState(null);
//   const [darkMode, setDarkMode] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const recognitionRef = useRef(null);
//   const [suggestedQuestions, setSuggestedQuestions] = useState([
//     "What are the side effects of ibuprofen?",
//     "How does metformin work for diabetes?",
//     "What is the recommended dosage for amoxicillin?",
//     "Are there any interactions between warfarin and aspirin?"
//   ]);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);
//   const [ttsEnabled, setTtsEnabled] = useState(true);
//   const [autoScroll, setAutoScroll] = useState(true);
//   const [savedChats, setSavedChats] = useState([]);
//   const [activeTab, setActiveTab] = useState("chat");
//   const [showReferences, setShowReferences] = useState(false);
//   const [references, setReferences] = useState([]);
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const fileInputRef = useRef(null);

//   // 🟢 Speech Recognition Setup
//   useEffect(() => {
//     if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
//       const SpeechRecognition =
//         window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognition = new SpeechRecognition();
//       recognition.lang = "en-US";
//       recognition.interimResults = true;
//       recognition.continuous = false;
//       recognition.maxAlternatives = 1;

//       recognition.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         setInputMessage(transcript);
//       };

//       recognition.onend = () => setIsListening(false);
//       recognition.onerror = (event) => {
//         console.error("Speech recognition error", event.error);
//         setIsListening(false);
//       };

//       recognitionRef.current = recognition;
//     }
//   }, []);

//   const startListening = () => {
//     if (recognitionRef.current && !isListening) {
//       setIsListening(true);
//       try {
//         recognitionRef.current.start();
//       } catch (error) {
//         console.error("Speech recognition start error", error);
//         setIsListening(false);
//       }
//     }
//   };

//   // 🟢 Text-to-Speech
//   const speakText = (text) => {
//     if (ttsEnabled && "speechSynthesis" in window) {
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = "en-US";
//       utterance.rate = 0.9;
//       utterance.pitch = 1.0;
//       speechSynthesis.speak(utterance);
//     }
//   };

//   // Generate conversation ID
//   useEffect(() => {
//     const newConversationId = Date.now().toString();
//     setConversationId(newConversationId);
//     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     setMessages(savedMessages);
//     fetchDatabaseInfo();
//     loadConversationContext(newConversationId);
//     loadSavedChats();
//   }, []);

//   // Save chat
//   useEffect(() => {
//     localStorage.setItem("chatMessages", JSON.stringify(messages));
//     if (autoScroll) {
//       scrollToBottom();
//     }
//   }, [messages]);

//   const saveChatToServer = async (message, sender) => {
//     try {
//       await fetch("http://localhost:5001/api/save-chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username,
//           message,
//           sender,
//           timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//         })
//       });
//       if (onSaveChat) onSaveChat();
//     } catch (error) {
//       console.error("Error saving chat:", error);
//     }
//   };

//   const loadSavedChats = () => {
//     const saved = JSON.parse(localStorage.getItem("savedChats")) || [];
//     setSavedChats(saved);
//   };

//   const saveCurrentChat = () => {
//     const newSavedChat = {
//       id: Date.now(),
//       title: `Chat ${new Date().toLocaleDateString()}`,
//       messages: [...messages],
//       timestamp: new Date().toLocaleString()
//     };
    
//     const updatedSavedChats = [...savedChats, newSavedChat];
//     setSavedChats(updatedSavedChats);
//     localStorage.setItem("savedChats", JSON.stringify(updatedSavedChats));
    
//     alert("Chat saved successfully!");
//   };

//   const loadConversationContext = async (conversationId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/conversation/${conversationId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setConversationContext(data);
//       }
//     } catch (error) {
//       console.error("Error loading conversation context:", error);
//     }
//   };

//   const clearConversation = async () => {
//     if (window.confirm("Are you sure you want to clear the conversation?")) {
//       try {
//         await fetch(`http://localhost:5000/api/conversation/${conversationId}`, {
//           method: "DELETE",
//         });
//         setMessages([]);
//         setConversationContext(null);
//         localStorage.removeItem("chatMessages");
//         setConversationId(Date.now().toString());
//       } catch (error) {
//         console.error("Error clearing conversation:", error);
//       }
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

//   // 🟢 PDF Upload Functions
//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file && file.type === "application/pdf") {
//       setSelectedFile(file);
//       setUploadStatus("");
//     } else {
//       setUploadStatus("Please select a PDF file");
//     }
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       setUploadStatus("Please select a file first");
//       return;
//     }

//     setIsUploading(true);
//     setUploadStatus("Uploading and processing PDF...");

//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const response = await fetch("http://localhost:5001/api/upload-and-process", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setUploadStatus(`✅ ${data.message}`);
//         setSelectedFile(null);
//         setTimeout(() => {
//           fetchDatabaseInfo();
//         }, 1500);
//       } else {
//         setUploadStatus(`❌ Error: ${data.error}`);
//       }
//     } catch (error) {
//       setUploadStatus(`❌ Upload failed: ${error.message}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const ingestAllPDFs = async () => {
//     setIsUploading(true);
//     setUploadStatus("Processing all PDFs in the folder...");

//     try {
//       const response = await fetch("http://localhost:5001/api/ingest-all", {
//         method: "POST",
//       });

//       const data = await response.json();

//       if (data.success) {
//         setUploadStatus(`✅ Processed ${data.processed_pdfs} PDFs with ${data.document_count} documents`);
//         setTimeout(() => {
//           fetchDatabaseInfo();
//         }, 1500);
//       } else {
//         setUploadStatus(`❌ Error: ${data.error}`);
//       }
//     } catch (error) {
//       setUploadStatus(`❌ Processing failed: ${error.message}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleSendMessage = async (e, messageContent = null) => {
//     e?.preventDefault();
//     const content = messageContent || inputMessage;
//     if (!content.trim() || isLoading) return;

//     const userMessage = {
//       id: Date.now(),
//       text: content,
//       sender: "user",
//       timestamp: new Date().toLocaleTimeString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     saveChatToServer(content, "user");
//     setInputMessage("");
//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:5001/api/query", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query: content, conversation_id: conversationId }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         const botMessage = {
//           id: Date.now() + 1,
//           text: data.response,
//           sender: "bot",
//           timestamp: new Date().toLocaleTimeString(),
//           references: data.references || []
//         };
//         setMessages((prev) => [...prev, botMessage]);
//         saveChatToServer(data.response, "bot");
//         if (data.references) setReferences(data.references);
//         speakText(data.response);
//       }
//     } catch (error) {
//       const errorMessage = {
//         id: Date.now() + 1,
//         text: `⚠️ ${error.message}`,
//         sender: "error",
//         timestamp: new Date().toLocaleTimeString(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//       saveChatToServer(`Error: ${error.message}`, "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const scrollToBottom = () => {
//     if (messagesEndRef.current && autoScroll) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const copyMessage = (text) => {
//     navigator.clipboard.writeText(text);
//     const copyBtn = document.activeElement;
//     const originalHtml = copyBtn.innerHTML;
//     copyBtn.innerHTML = "✓";
//     setTimeout(() => {
//       copyBtn.innerHTML = originalHtml;
//     }, 1500);
//   };

//   const downloadChat = () => {
//     const chatText = messages.map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`).join("\n");
//     const blob = new Blob([chatText], { type: "text/plain" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `medical_chat_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
//     link.click();
//   };

//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       document.documentElement.requestFullscreen().catch(err => {
//         console.error(`Error attempting to enable full-screen mode: ${err.message}`);
//       });
//       setIsFullscreen(true);
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//         setIsFullscreen(false);
//       }
//     }
//   };

//   const handleSuggestedQuestionClick = (question) => {
//     setInputMessage(question);
//     setTimeout(() => {
//       const fakeEvent = { preventDefault: () => {} };
//       handleSendMessage(fakeEvent, question);
//     }, 100);
//   };

//   // 🟢 Render Messages
//   const renderMessages = () => (
//     <AnimatePresence>
//       {messages.map((message) => (
//         <motion.div 
//           key={message.id}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           transition={{ duration: 0.3 }}
//           className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
//         >
//           <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl p-4 ${
//             message.sender === "user" 
//               ? "bg-blue-500 text-white rounded-br-none" 
//               : message.sender === "error"
//               ? "bg-red-100 text-red-800 border border-red-300"
//               : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-md"
//           }`}>
//             <div className="flex items-start justify-between">
//               <div className="flex-1">
//                 <p className="text-sm whitespace-pre-wrap">{message.text}</p>
//                 {message.references && message.references.length > 0 && (
//                   <div className="mt-2 pt-2 border-t border-gray-200">
//                     <p className="text-xs font-semibold text-gray-600">Sources:</p>
//                     {message.references.map((ref, idx) => (
//                       <p key={idx} className="text-xs text-gray-500">• {ref}</p>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <button
//                 onClick={() => copyMessage(message.text)}
//                 className="ml-2 p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
//                 title="Copy message"
//               >
//                 <Copy size={14} />
//               </button>
//             </div>
//             <div className="flex items-center justify-between mt-2">
//               <span className="text-xs opacity-70">
//                 {message.sender === "user" ? "You" : "Assistant"} • {message.timestamp}
//               </span>
//               {message.sender === "bot" && (
//                 <button
//                   onClick={() => speakText(message.text)}
//                   className="text-xs text-gray-500 hover:text-gray-700"
//                   title="Read aloud"
//                 >
//                   🔊
//                 </button>
//               )}
//             </div>
//           </div>
//         </motion.div>
//       ))}
//     </AnimatePresence>
//   );

//   // 🟢 Render References Tab
//   const renderReferences = () => (
//     <div className="p-4">
//       <h3 className="text-lg font-semibold mb-4">Document References</h3>
//       {references.length > 0 ? (
//         <div className="space-y-3">
//           {references.map((ref, index) => (
//             <div key={index} className="p-3 bg-white rounded-lg shadow border">
//               <p className="text-sm text-gray-700">{ref}</p>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500">No references available. Ask a question to see sources.</p>
//       )}
//     </div>
//   );

//   // 🟢 Render Settings Modal
//   const renderSettings = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-96">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold">Settings</h3>
//           <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
//             <X size={20} />
//           </button>
//         </div>
        
//         <div className="space-y-4">
//           <div>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={ttsEnabled}
//                 onChange={(e) => setTtsEnabled(e.target.checked)}
//                 className="mr-2"
//               />
//               Enable Text-to-Speech
//             </label>
//           </div>
          
//           <div>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={autoScroll}
//                 onChange={(e) => setAutoScroll(e.target.checked)}
//                 className="mr-2"
//               />
//               Auto-scroll to new messages
//             </label>
//           </div>
          
//           <div>
//             <h4 className="font-medium mb-2">Appearance</h4>
//             <button
//               onClick={() => setDarkMode(!darkMode)}
//               className={`px-4 py-2 rounded ${
//                 darkMode ? "bg-yellow-500 text-white" : "bg-gray-800 text-white"
//               }`}
//             >
//               {darkMode ? "Light Mode" : "Dark Mode"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // 🟢 Render Upload Modal
//   const renderUploadModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-96">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold">Upload Medical PDF</h3>
//           <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
//             <X size={20} />
//           </button>
//         </div>
        
//         <div className="space-y-4">
//           <div
//             className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileSelect}
//               accept=".pdf"
//               className="hidden"
//             />
//             <FileText size={32} className="mx-auto text-gray-400 mb-2" />
//             <p className="text-sm text-gray-600">
//               {selectedFile ? selectedFile.name : "Click to select PDF file"}
//             </p>
//             <p className="text-xs text-gray-500 mt-1">Supported: PDF documents</p>
//           </div>

//           {uploadStatus && (
//             <div className={`text-sm p-3 rounded-lg ${
//               uploadStatus.includes("✅") 
//                 ? "bg-green-100 text-green-800" 
//                 : uploadStatus.includes("❌")
//                 ? "bg-red-100 text-red-800"
//                 : "bg-blue-100 text-blue-800"
//             }`}>
//               {uploadStatus}
//             </div>
//           )}

//           <div className="flex space-x-2">
//             <button
//               onClick={handleUpload}
//               disabled={!selectedFile || isUploading}
//               className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
//             >
//               {isUploading ? "Processing..." : "Upload PDF"}
//             </button>
//             <button
//               onClick={ingestAllPDFs}
//               disabled={isUploading}
//               className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
//             >
//               Process All PDFs
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
   
//     <div className={`flex h-screen ${isFullscreen ? "fixed inset-0 z-50" : "rounded-lg shadow-xl"} ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-gray-50 to-blue-50"}`}>
//       {/* Sidebar */}
//       <div className={`w-64 ${darkMode ? "bg-gray-800" : "bg-blue-800"} text-white p-4 flex flex-col`}>
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-bold flex items-center">
//             <Heart className="mr-2" size={20} /> MedChat
//           </h2>
//           <button onClick={() => setShowSettings(!showSettings)} className="p-1 rounded hover:bg-blue-700">
//             <Settings size={18} />
//           </button>
//         </div>

//         <div className="mb-6 p-3 rounded-lg bg-blue-700">
//           <div className="flex items-center mb-2">
//             <Database size={16} className="mr-2" />
//             <span className="font-medium">Knowledge Base</span>
//           </div>
//           {databaseInfo && (
//             <div className="text-sm">
//               <p>{databaseInfo.document_count} medical documents</p>
//               <p>Last updated: {new Date().toLocaleDateString()}</p>
//             </div>
//           )}
//           <button 
//             onClick={() => setShowSettings(true)}
//             className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-1 rounded text-sm"
//           >
//             Upload PDF
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto">
//           <h3 className="font-medium mb-2 flex items-center">
//             <Bookmark size={16} className="mr-2" /> Saved Chats
//           </h3>
//           <div className="space-y-2">
//             {savedChats.slice(0, 5).map(chat => (
//               <div key={chat.id} className="p-2 bg-blue-700 rounded text-sm truncate cursor-pointer hover:bg-blue-600">
//                 {chat.title}
//               </div>
//             ))}
//             {savedChats.length === 0 && (
//               <p className="text-blue-200 text-sm">No saved chats yet</p>
//             )}
//           </div>
//         </div>

//         <div className="mt-4 pt-4 border-t border-blue-700">
//           <div className="flex items-center justify-between text-sm">
//             <span>{username || "Guest"}</span>
//             <button 
//               onClick={toggleFullscreen} 
//               className="p-1 rounded hover:bg-blue-700"
//             >
//               {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <div className={`p-4 shadow-md flex justify-between items-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
//           <div>
//             <h1 className="text-xl font-bold flex items-center">
//               <Bot className="mr-2" /> Medical RAG ChatBot
//             </h1>
//             {databaseInfo && (
//               <p className="text-sm opacity-75">{databaseInfo.document_count} medical documents loaded</p>
//             )}
//           </div>
//           <div className="flex space-x-2">
//             <button 
//               onClick={clearConversation} 
//               className={`px-3 py-2 rounded flex items-center space-x-1 ${darkMode ? "bg-red-700 hover:bg-red-600" : "bg-red-500 hover:bg-red-600 text-white"}`}
//             >
//               <Trash2 size={14} /> Clear
//             </button>
//             <button 
//               onClick={fetchDatabaseInfo} 
//               className={`px-3 py-2 rounded flex items-center space-x-1 ${darkMode ? "bg-green-700 hover:bg-green-600" : "bg-green-500 hover:bg-green-600 text-white"}`}
//             >
//               <RefreshCw size={14} /> Refresh
//             </button>
//             <button 
//               onClick={saveCurrentChat} 
//               className={`px-3 py-2 rounded flex items-center space-x-1 ${darkMode ? "bg-blue-700 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
//             >
//               <BookmarkCheck size={14} /> Save
//             </button>
//             <button 
//               onClick={() => setDarkMode(!darkMode)} 
//               className={`px-3 py-2 rounded ${darkMode ? "bg-yellow-600 hover:bg-yellow-500" : "bg-gray-800 hover:bg-gray-700 text-white"}`}
//             >
//               {darkMode ? <Sun size={16} /> : <Moon size={16} />}
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className={`flex border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
//           <button 
//             className={`px-4 py-2 font-medium ${activeTab === "chat" ? (darkMode ? "text-blue-400 border-b-2 border-blue-400" : "text-blue-600 border-b-2 border-blue-600") : ""}`}
//             onClick={() => setActiveTab("chat")}
//           >
//             Chat
//           </button>
//           <button 
//             className={`px-4 py-2 font-medium ${activeTab === "sources" ? (darkMode ? "text-blue-400 border-b-2 border-blue-400" : "text-blue-600 border-b-2 border-blue-600") : ""}`}
//             onClick={() => setActiveTab("sources")}
//           >
//             References
//           </button>
//         </div>

//         {/* Messages Area */}
//         <div className="flex-1 overflow-hidden flex">
//           <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? "bg-gray-900" : "bg-gradient-to-b from-blue-50 to-gray-50"}`}>
//             {activeTab === "chat" ? (
//               <>
//                 {messages.length === 0 ? (
//                   <div className="h-full flex flex-col items-center justify-center">
//                     <div className="text-center max-w-lg mx-auto p-6 rounded-lg bg-white bg-opacity-90 shadow-lg">
//                       <Zap className="mx-auto mb-4 text-blue-500" size={40} />
//                       <h2 className="text-2xl font-bold mb-4">Medical Knowledge Assistant</h2>
//                       <p className="mb-6">Ask questions about medications, treatments, side effects, and more based on our extensive medical database.</p>
                      
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {suggestedQuestions.map((question, index) => (
//                           <motion.div
//                             key={index}
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                           >
//                             <button
//                               onClick={() => handleSuggestedQuestionClick(question)}
//                               className={`w-full text-left p-3 rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600 text-white"} transition-colors`}
//                             >
//                               {question}
//                             </button>
//                           </motion.div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-4 pb-4">
//                     {renderMessages()}
//                     {isLoading && (
//                       <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         className="flex justify-start"
//                       >
//                         <div className="flex items-center space-x-2 bg-white shadow-md rounded-2xl px-4 py-2 max-w-xs">
//                           <Bot size={18} className="text-blue-600" />
//                           <div className="flex space-x-1">
//                             <motion.div
//                               className="w-2 h-2 bg-gray-400 rounded-full"
//                               animate={{ y: [0, -4, 0] }}
//                               transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
//                             />
//                             <motion.div
//                               className="w-2 h-2 bg-gray-400 rounded-full"
//                               animate={{ y: [0, -4, 0] }}
//                               transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
//                             />
//                             <motion.div
//                               className="w-2 h-2 bg-gray-400 rounded-full"
//                               animate={{ y: [0, -4, 0] }}
//                               transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
//                             />
//                           </div>
//                         </div>
//                       </motion.div>
//                     )}
//                     <div ref={messagesEndRef} />
//                   </div>
//                 )}
//               </>
//             ) : (
//               renderReferences()
//             )}
//           </div>
//         </div>

//         {/* Input Area */}
//         <form onSubmit={handleSendMessage} className={`p-4 border-t ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
//           <div className="flex space-x-2">
//             <div className="flex-1 relative">
//               <textarea
//                 rows={2}
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSendMessage(e);
//                   }
//                 }}
//                 placeholder="Ask about medical information..."
//                 className={`w-full border rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                   darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"
//                 }`}
//                 disabled={isLoading}
//               />
//               <button
//                 type="button"
//                 onClick={startListening}
//                 disabled={isListening}
//                 className={`absolute right-2 bottom-2 p-1 rounded ${
//                   isListening 
//                     ? "text-red-500 animate-pulse" 
//                     : "text-gray-400 hover:text-blue-500"
//                 }`}
//                 title="Voice input"
//               >
//                 <Mic size={18} />
//               </button>
//             </div>
//             <button
//               type="submit"
//               disabled={isLoading || !inputMessage.trim()}
//               className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
//                 darkMode 
//                   ? "bg-blue-600 hover:bg-blue-700 text-white" 
//                   : "bg-blue-500 hover:bg-blue-600 text-white"
//               } disabled:opacity-50 disabled:cursor-not-allowed`}
//             >
//               <Send size={18} />
//               <span>Send</span>
//             </button>
//           </div>
//           <div className="flex justify-between items-center mt-2">
//             <span className="text-xs text-gray-500">
//               Press Enter to send, Shift+Enter for new line
//             </span>
//             <div className="flex space-x-2">
//               <button
//                 type="button"
//                 onClick={downloadChat}
//                 className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
//                 title="Download chat"
//               >
//                 <Download size={14} className="mr-1" />
//                 Export
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>

//       {/* Modals */}
//       {showSettings && renderSettings()}
//       {showReferences && renderUploadModal()}
//     </div>
    
//     );
//   };

// export default ChatBot;


// version similar to simple but with parallel processing 


// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import { RefreshCw, Send, Bot, User, Trash2, Mic, Upload, X, Database, FileText, Copy, Volume2, VolumeX } from "lucide-react";

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [databaseInfo, setDatabaseInfo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [processingQueue, setProcessingQueue] = useState([]);
//   const fileInputRef = useRef(null);
//   const [selectedPdf, setSelectedPdf] = useState("");
//   const [availablePdfs, setAvailablePdfs] = useState([]);
//   const [speakingMessageId, setSpeakingMessageId] = useState(null);

//   // Load from localStorage
//   useEffect(() => {
//     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     setMessages(savedMessages);
//     fetchDatabaseInfo();
//     fetchAvailablePdfs();
//   }, []);

//   // Save to localStorage
//   useEffect(() => {
//     localStorage.setItem("chatMessages", JSON.stringify(messages));
//     scrollToBottom();
//   }, [messages]);

//   const fetchDatabaseInfo = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       setDatabaseInfo(data);
//     } catch (error) {
//       console.error("Error fetching database info:", error);
//     }
//   };

//   const fetchAvailablePdfs = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       if (data.pdfs_in_database) {
//         setAvailablePdfs(data.pdfs_in_database);
//       }
//     } catch (error) {
//       console.error("Error fetching PDFs:", error);
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
//       let response;
//       if (selectedPdf) {
//         response = await fetch("http://localhost:5001/api/query-pdf", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             query: inputMessage,
//             pdf_name: selectedPdf,
//           }),
//         });
//       } else {
//         response = await fetch("http://localhost:5001/api/query", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ query: inputMessage }),
//         });
//       }

//       const data = await response.json();

//       if (data.success) {
//         const botMessage = {
//           id: Date.now() + 1,
//           text: data.response,
//           sender: "bot",
//           timestamp: new Date().toLocaleTimeString(),
//         };
//         setMessages((prev) => [...prev, botMessage]);
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

//   // Use the working upload function from your previous version
//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setIsUploading(true);
//       setUploadStatus("Uploading file...");

//       const response = await fetch("http://localhost:5001/api/upload-pdf", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setUploadStatus(`✅ File uploaded successfully! Processing started for ${data.filename}`);
//         setSelectedFile(null);
        
//         // Add to processing queue
//         const processingJob = {
//           id: data.upload_id,
//           filename: data.filename,
//           status: "processing",
//           startTime: new Date().toISOString(),
//         };
        
//         const newQueue = [...processingQueue, processingJob];
//         setProcessingQueue(newQueue);
        
//         // Start monitoring
//         monitorProcessing(processingJob);
//       } else {
//         setUploadStatus(`❌ Error: ${data.error}`);
//       }
//     } catch (error) {
//       setUploadStatus(`❌ Upload failed: ${error.message}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const monitorProcessing = async (job) => {
//     const checkStatus = async () => {
//       try {
//         const response = await fetch(`http://localhost:5001/api/upload-status/${job.id}`);
//         const status = await response.json();

//         if (status.status === "completed") {
//           // Remove from queue
//           const newQueue = processingQueue.filter(item => item.id !== job.id);
//           setProcessingQueue(newQueue);
          
//           // Update database info
//           fetchDatabaseInfo();
//           fetchAvailablePdfs();
          
//           // Show success message in chat
//           const successMessage = {
//             id: Date.now(),
//             text: `✅ PDF processing completed: ${job.filename} is now available for querying`,
//             sender: "system",
//             timestamp: new Date().toLocaleTimeString(),
//           };
//           setMessages((prev) => [...prev, successMessage]);
          
//         } else if (status.status === "failed") {
//           // Remove from queue
//           const newQueue = processingQueue.filter(item => item.id !== job.id);
//           setProcessingQueue(newQueue);
          
//           const errorMessage = {
//             id: Date.now(),
//             text: `❌ PDF processing failed: ${job.filename}`,
//             sender: "system",
//             timestamp: new Date().toLocaleTimeString(),
//           };
//           setMessages((prev) => [...prev, errorMessage]);
          
//         } else if (status.status === "processing") {
//           // Update status and continue monitoring
//           setTimeout(() => checkStatus(), 2000);
//         }
//       } catch (error) {
//         console.error("Error checking processing status:", error);
//         setTimeout(() => checkStatus(), 3000);
//       }
//     };

//     checkStatus();
//   };

//   const speakText = (text, messageId) => {
//     if ("speechSynthesis" in window) {
//       if (speakingMessageId) {
//         speechSynthesis.cancel();
//       }
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = "en-US";

//       utterance.onend = () => setSpeakingMessageId(null);
//       utterance.onerror = () => setSpeakingMessageId(null);

//       speechSynthesis.speak(utterance);
//       setSpeakingMessageId(messageId);
//     }
//   };

//   const stopSpeaking = () => {
//     if ("speechSynthesis" in window) {
//       speechSynthesis.cancel();
//       setSpeakingMessageId(null);
//     }
//   };

//   const copyMessage = (text) => {
//     navigator.clipboard.writeText(text);
//   };

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
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
//               {databaseInfo.document_count} docs loaded
//               {processingQueue.length > 0 && (
//                 <span className="ml-2">({processingQueue.length} processing...)</span>
//               )}
//             </div>
//           )}
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={() => setShowUploadModal(true)}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <Upload size={14} /> <span>Upload PDF</span>
//           </button>
//           <button
//             onClick={() => {
//               fetchDatabaseInfo();
//               fetchAvailablePdfs();
//             }}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <RefreshCw size={14} /> <span>Refresh</span>
//           </button>
//         </div>
//       </div>

//       {/* PDF Selection */}
//       <div className="bg-white p-3 border-b shadow-sm">
//         <select 
//           value={selectedPdf} 
//           onChange={(e) => setSelectedPdf(e.target.value)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         >
//           <option value="">All PDFs</option>
//           {availablePdfs.map(pdf => (
//             <option key={pdf} value={pdf}>{pdf}</option>
//           ))}
//         </select>
//       </div>

//       {/* Processing Queue Status */}
//       {processingQueue.length > 0 && (
//         <div className="bg-yellow-100 border-b border-yellow-300 p-2">
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-yellow-800">
//               ⚡ {processingQueue.length} PDF(s) processing...
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
//                 {message.sender !== "user" && message.sender !== "system" && (
//                   <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
//                     <Bot size={18} className="text-blue-600" />
//                   </div>
//                 )}
//                 {message.sender === "system" && (
//                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
//                     <Database size={18} className="text-gray-600" />
//                   </div>
//                 )}
//                 <div
//                   className={`rounded-2xl px-4 py-2 shadow-md ${
//                     message.sender === "user"
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : message.sender === "error"
//                       ? "bg-red-100 text-red-800 border border-red-300"
//                       : message.sender === "system"
//                       ? "bg-gray-200 text-gray-700 border border-gray-300"
//                       : "bg-white text-gray-800 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm whitespace-pre-wrap">{message.text}</p>
//                   <span className="text-xs opacity-70 block mt-1 text-right">
//                     {message.timestamp}
//                   </span>
                  
//                   {message.sender === "bot" && (
//                     <div className="flex space-x-1 mt-2 justify-end">
//                       <button 
//                         onClick={() => copyMessage(message.text)} 
//                         className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                         title="Copy message"
//                       >
//                         <Copy size={14}/>
//                       </button>
//                       {speakingMessageId === message.id ? (
//                         <button 
//                           onClick={stopSpeaking} 
//                           className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-gray-100 transition"
//                           title="Stop speaking"
//                         >
//                           <VolumeX size={14}/>
//                         </button>
//                       ) : (
//                         <button 
//                           onClick={() => speakText(message.text, message.id)} 
//                           className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                           title="Read aloud"
//                         >
//                           <Volume2 size={14}/>
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//                 {message.sender === "user" && (
//                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
//                     <User size={18} className="text-gray-700" />
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           ))
//         )}

//         {isLoading && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="flex justify-start"
//           >
//             <div className="flex items-center space-x-2 bg-white shadow-md rounded-2xl px-4 py-2 max-w-xs">
//               <Bot size={18} className="text-blue-600" />
//               <div className="flex space-x-1">
//                 <motion.div
//                   className="w-2 h-2 bg-gray-400 rounded-full"
//                   animate={{ y: [0, -4, 0] }}
//                   transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
//                 />
//                 <motion.div
//                   className="w-2 h-2 bg-gray-400 rounded-full"
//                   animate={{ y: [0, -4, 0] }}
//                   transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
//                 />
//                 <motion.div
//                   className="w-2 h-2 bg-gray-400 rounded-full"
//                   animate={{ y: [0, -4, 0] }}
//                   transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
//                 />
//               </div>
//             </div>
//           </motion.div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <form
//         onSubmit={handleSendMessage}
//         className="p-4 bg-white border-t shadow-md"
//       >
//         <div className="flex space-x-2">
//           <textarea
//             rows={1}
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSendMessage(e);
//               }
//             }}
//             placeholder="Ask about medical information..."
//             className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isLoading}
//           />
//           <button
//             type="submit"
//             disabled={isLoading || !inputMessage.trim()}
//             className="bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             <Send size={18} />
//           </button>
//         </div>
//       </form>

//       {/* Upload Modal */}
//       {showUploadModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg p-6 w-96">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Upload PDF Document</h3>
//               <button
//                 onClick={() => {
//                   setShowUploadModal(false);
//                   setUploadStatus("");
//                   setSelectedFile(null);
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div
//                 className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleFileUpload}
//                   accept=".pdf"
//                   className="hidden"
//                 />
//                 <FileText size={32} className="mx-auto text-gray-400 mb-2" />
//                 <p className="text-sm text-gray-600">
//                   Click to select PDF file
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Supported: PDF documents
//                 </p>
//               </div>

//               {uploadStatus && (
//                 <div className={`text-sm p-3 rounded-lg ${
//                   uploadStatus.includes("✅") 
//                     ? "bg-green-100 text-green-800" 
//                     : uploadStatus.includes("❌")
//                     ? "bg-red-100 text-red-800"
//                     : "bg-blue-100 text-blue-800"
//                 }`}>
//                   {uploadStatus}
//                 </div>
//               )}

//               {processingQueue.length > 0 && (
//                 <div className="mt-4 p-3 bg-gray-100 rounded-lg">
//                   <h4 className="font-medium mb-2">Processing Queue</h4>
//                   {processingQueue.map((job) => (
//                     <div key={job.id} className="flex justify-between items-center text-sm mb-2">
//                       <span className="truncate">{job.filename}</span>
//                       <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
//                         Processing...
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatBot;





















// FINAL WORKING CODE WITH PARALLEL PROCESSING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// parallel processing handling the issue of not monitoring the pdf upload once the pop up is closed

// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import { RefreshCw, Send, Bot, User, Trash2, Mic, Upload, X, Database, FileText, Copy, Volume2, VolumeX } from "lucide-react";

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [databaseInfo, setDatabaseInfo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [processingQueue, setProcessingQueue] = useState([]);
//   const fileInputRef = useRef(null);
//   const [selectedPdf, setSelectedPdf] = useState("");
//   const [availablePdfs, setAvailablePdfs] = useState([]);
//   const [speakingMessageId, setSpeakingMessageId] = useState(null);
//   const [conversationId, setConversationId] = useState("");

//   // Load from localStorage
//   useEffect(() => {
//     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     const savedConversationId = localStorage.getItem("conversationId") || "";
    
//     setMessages(savedMessages);
//     setConversationId(savedConversationId);
//     fetchDatabaseInfo();
//     fetchAvailablePdfs();
//   }, []);

//   // Save to localStorage
//   useEffect(() => {
//     localStorage.setItem("chatMessages", JSON.stringify(messages));
//     scrollToBottom();
//   }, [messages]);

//   // Monitor processing queue even when modal is closed
//   useEffect(() => {
//     processingQueue.forEach(job => {
//       if (!job.status || job.status !== 'monitoring') {
//         monitorProcessing(job);
//       }
//     });
//   }, [processingQueue.length]);

//   const fetchDatabaseInfo = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       setDatabaseInfo(data);
//     } catch (error) {
//       console.error("Error fetching database info:", error);
//     }
//   };

//   // const fetchAvailablePdfs = async () => {
//   //   try {
//   //     const response = await fetch("http://localhost:5001/api/database-info");
//   //     const data = await response.json();
//   //     if (data.pdfs_in_database) {
//   //       setAvailablePdfs(data.pdfs_in_database);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching PDFs:", error);
//   //   }
//   // };
//   const fetchAvailablePdfs = async () => {
//   try {
//     const response = await fetch("http://localhost:5001/api/database-info");
//     const data = await response.json();
//     if (data.pdfs_in_database) {
//       setAvailablePdfs(data.pdfs_in_database);
      
//       // If we just processed a PDF, auto-select it
//       if (processingQueue.length > 0 && data.pdfs_in_database.length > availablePdfs.length) {
//         const newPdf = data.pdfs_in_database.find(pdf => !availablePdfs.includes(pdf));
//         if (newPdf) {
//           setSelectedPdf(newPdf);
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error fetching PDFs:", error);
//   }
// };
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
//       // Get or create a conversation ID
//       let currentConversationId = conversationId;
//       if (!currentConversationId) {
//         currentConversationId = Date.now().toString();
//         setConversationId(currentConversationId);
//         localStorage.setItem("conversationId", currentConversationId);
//       }

//       let response;
//       if (selectedPdf) {
//         response = await fetch("http://localhost:5001/api/query-pdf", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             query: inputMessage,
//             pdf_name: selectedPdf,
//             conversation_id: currentConversationId,
//           }),
//         });
//       } else {
//         response = await fetch("http://localhost:5001/api/query", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ 
//             query: inputMessage,
//             conversation_id: currentConversationId,
//           }),
//         });
//       }

//       const data = await response.json();

//       if (data.success) {
//         // Store the conversation_id if provided by the backend
//         if (data.conversation_id) {
//           setConversationId(data.conversation_id);
//           localStorage.setItem("conversationId", data.conversation_id);
//         }
        
//         const botMessage = {
//           id: Date.now() + 1,
//           text: data.response,
//           sender: "bot",
//           timestamp: new Date().toLocaleTimeString(),
//         };
//         setMessages((prev) => [...prev, botMessage]);
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

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setIsUploading(true);
//       setUploadStatus("Uploading file...");

//       const response = await fetch("http://localhost:5001/api/upload-pdf", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setUploadStatus(`✅ File uploaded successfully! Processing started for ${data.filename}`);
//         setSelectedFile(null);
        
//         // Add to processing queue
//         const processingJob = {
//           id: data.upload_id,
//           filename: data.filename,
//           status: "queued",
//           startTime: new Date().toISOString(),
//         };
        
//         setProcessingQueue(prev => [...prev, processingJob]);
//       } else {
//         setUploadStatus(`❌ Error: ${data.error}`);
//       }
//     } catch (error) {
//       setUploadStatus(`❌ Upload failed: ${error.message}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const monitorProcessing = async (job) => {
//     // Check if already monitoring this job
//     if (processingQueue.find(item => item.id === job.id)?.status === 'monitoring') {
//       return;
//     }
    
//     // Update queue to show we're monitoring this job
//     setProcessingQueue(prev => prev.map(item => 
//       item.id === job.id ? {...item, status: 'monitoring'} : item
//     ));
    
//     const checkStatus = async () => {
//       try {
//         const response = await fetch(`http://localhost:5001/api/upload-status/${job.id}`);
//         const status = await response.json();

//         if (status.status === "completed") {
//           // Remove from queue
//           setProcessingQueue(prev => prev.filter(item => item.id !== job.id));
          
//           // Update database info
//           fetchDatabaseInfo();
//           fetchAvailablePdfs();
          
//           // Show success message in chat
//           const successMessage = {
//             id: Date.now(),
//             text: `✅ PDF processing completed: ${job.filename} is now available for querying`,
//             sender: "system",
//             timestamp: new Date().toLocaleTimeString(),
//           };
//           setMessages((prev) => [...prev, successMessage]);
          
//         } else if (status.status === "failed") {
//           // Remove from queue
//           setProcessingQueue(prev => prev.filter(item => item.id !== job.id));
          
//           const errorMessage = {
//             id: Date.now(),
//             text: `❌ PDF processing failed: ${job.filename}`,
//             sender: "system",
//             timestamp: new Date().toLocaleTimeString(),
//           };
//           setMessages((prev) => [...prev, errorMessage]);
          
//         } else if (status.status === "processing") {
//           // Update status and continue monitoring
//           setTimeout(() => checkStatus(), 2000);
//         }
//       } catch (error) {
//         console.error("Error checking processing status:", error);
//         setTimeout(() => checkStatus(), 3000);
//       }
//     };

//     checkStatus();
//   };

//   const speakText = (text, messageId) => {
//     if ("speechSynthesis" in window) {
//       if (speakingMessageId) {
//         speechSynthesis.cancel();
//       }
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = "en-US";

//       utterance.onend = () => setSpeakingMessageId(null);
//       utterance.onerror = () => setSpeakingMessageId(null);

//       speechSynthesis.speak(utterance);
//       setSpeakingMessageId(messageId);
//     }
//   };

//   const stopSpeaking = () => {
//     if ("speechSynthesis" in window) {
//       speechSynthesis.cancel();
//       setSpeakingMessageId(null);
//     }
//   };

//   const copyMessage = (text) => {
//     navigator.clipboard.writeText(text);
//   };

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const startNewConversation = () => {
//     localStorage.removeItem("conversationId");
//     localStorage.removeItem("chatMessages");
//     setMessages([]);
//     setConversationId("");
//     setSelectedPdf("");
//   };

//   return (

    
//     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
//         <div>
//           <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
//           {databaseInfo && (
//             <div className="text-sm opacity-90 mt-1">
//               {databaseInfo.document_count} docs loaded
//               {processingQueue.length > 0 && (
//                 <span className="ml-2">({processingQueue.length} processing...)</span>
//               )}
//             </div>
//           )}
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={() => setShowUploadModal(true)}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <Upload size={14} /> <span>Upload PDF</span>
//           </button>
//           <button
//             onClick={startNewConversation}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <Trash2 size={14} /> <span>New Chat</span>
//           </button>
//           <button
//             onClick={() => {
//               fetchDatabaseInfo();
//               fetchAvailablePdfs();
//             }}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <RefreshCw size={14} /> <span>Refresh</span>
//           </button>
//         </div>
//       </div>

//       {/* PDF Selection */}
//       <div className="bg-white p-3 border-b shadow-sm">
//         <select 
//           value={selectedPdf} 
//           onChange={(e) => setSelectedPdf(e.target.value)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         >
//           <option value="">All PDFs</option>
//           {availablePdfs.map(pdf => (
//             <option key={pdf} value={pdf}>{pdf}</option>
//           ))}
//         </select>
//       </div>

//       {/* Processing Queue Status */}
//       {processingQueue.length > 0 && (
//         <div className="bg-yellow-100 border-b border-yellow-300 p-2">
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-yellow-800">
//               ⚡ {processingQueue.length} PDF(s) processing...
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
//                 {message.sender !== "user" && message.sender !== "system" && (
//                   <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
//                     <Bot size={18} className="text-blue-600" />
//                   </div>
//                 )}
//                 {message.sender === "system" && (
//                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
//                     <Database size={18} className="text-gray-600" />
//                   </div>
//                 )}
//                 <div
//                   className={`rounded-2xl px-4 py-2 shadow-md ${
//                     message.sender === "user"
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : message.sender === "error"
//                       ? "bg-red-100 text-red-800 border border-red-300"
//                       : message.sender === "system"
//                       ? "bg-gray-200 text-gray-700 border border-gray-300"
//                       : "bg-white text-gray-800 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm whitespace-pre-wrap">{message.text}</p>
//                   <span className="text-xs opacity-70 block mt-1 text-right">
//                     {message.timestamp}
//                   </span>
                  
//                   {message.sender === "bot" && (
//                     <div className="flex space-x-1 mt-2 justify-end">
//                       <button 
//                         onClick={() => copyMessage(message.text)} 
//                         className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                         title="Copy message"
//                       >
//                         <Copy size={14}/>
//                       </button>
//                       {speakingMessageId === message.id ? (
//                         <button 
//                           onClick={stopSpeaking} 
//                           className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-gray-100 transition"
//                           title="Stop speaking"
//                         >
//                           <VolumeX size={14}/>
//                         </button>
//                       ) : (
//                         <button 
//                           onClick={() => speakText(message.text, message.id)} 
//                           className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                           title="Read aloud"
//                         >
//                           <Volume2 size={14}/>
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//                 {message.sender === "user" && (
//                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
//                     <User size={18} className="text-gray-700" />
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           ))
//         )}

//         {isLoading && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="flex justify-start"
//           >
//             <div className="flex items-center space-x-2 bg-white shadow-md rounded-2xl px-4 py-2 max-w-xs">
//               <Bot size={18} className="text-blue-600" />
//               <div className="flex space-x-1">
//                 <motion.div
//                   className="w-2 h-2 bg-gray-400 rounded-full"
//                   animate={{ y: [0, -4, 0] }}
//                   transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
//                 />
//                 <motion.div
//                   className="w-2 h-2 bg-gray-400 rounded-full"
//                   animate={{ y: [0, -4, 0] }}
//                   transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
//                 />
//                 <motion.div
//                   className="w-2 h-2 bg-gray-400 rounded-full"
//                   animate={{ y: [0, -4, 0] }}
//                   transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
//                 />
//               </div>
//             </div>
//           </motion.div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <form
//         onSubmit={handleSendMessage}
//         className="p-4 bg-white border-t shadow-md"
//       >
//         <div className="flex space-x-2">
//           <textarea
//             rows={1}
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSendMessage(e);
//               }
//             }}
//             placeholder="Ask about medical information..."
//             className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isLoading}
//           />
//           <button
//             type="submit"
//             disabled={isLoading || !inputMessage.trim()}
//             className="bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             <Send size={18} />
//           </button>
//         </div>
//       </form>

//       {/* Upload Modal */}
//       {showUploadModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg p-6 w-96">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Upload PDF Document</h3>
//               <button
//                 onClick={() => {
//                   setShowUploadModal(false);
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div
//                 className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleFileUpload}
//                   accept=".pdf"
//                   className="hidden"
//                 />
//                 <FileText size={32} className="mx-auto text-gray-400 mb-2" />
//                 <p className="text-sm text-gray-600">
//                   Click to select PDF file
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Supported: PDF documents
//                 </p>
//               </div>

//               {uploadStatus && (
//                 <div className={`text-sm p-3 rounded-lg ${
//                   uploadStatus.includes("✅") 
//                     ? "bg-green-100 text-green-800" 
//                     : uploadStatus.includes("❌")
//                     ? "bg-red-100 text-red-800"
//                     : "bg-blue-100 text-blue-800"
//                 }`}>
//                   {uploadStatus}
//                 </div>
//               )}

//               {processingQueue.length > 0 && (
//                 <div className="mt-4 p-3 bg-gray-100 rounded-lg">
//                   <h4 className="font-medium mb-2">Processing Queue</h4>
//                   {processingQueue.map((job) => (
//                     <div key={job.id} className="flex justify-between items-center text-sm mb-2">
//                       <span className="truncate">{job.filename}</span>
//                       <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
//                         Processing...
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Persistent processing indicator */}
//       {processingQueue.length > 0 && (
//         <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-50">
//           <div className="flex items-center">
//             <RefreshCw size={16} className="animate-spin mr-2" />
//             <span>{processingQueue.length} file(s) processing...</span>
//           </div>
//         </div>
//       )}
//     </div>


//   );
// };

// export default ChatBot;


// parallel processing but trying with suggestion boxes as well but removes pdf adder



// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   RefreshCw,
//   Send,
//   Bot,
//   User,
//   Trash2,
//   Upload,
//   X,
//   Database,
//   FileText,
//   Copy,
//   Volume2,
//   VolumeX,
// } from "lucide-react";

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [databaseInfo, setDatabaseInfo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [processingQueue, setProcessingQueue] = useState([]);
//   const fileInputRef = useRef(null);
//   const [selectedPdf, setSelectedPdf] = useState("");
//   const [availablePdfs, setAvailablePdfs] = useState([]);
//   const [speakingMessageId, setSpeakingMessageId] = useState(null);
//   const [conversationId, setConversationId] = useState("");

//   const suggestedPrompts = [
//     "What are the side effects of Ibuprofen?",
//     "Summarize this medical PDF",
//     "How does Paracetamol work?",
//     "Show me drug interactions with Aspirin",
//   ];

//   // Load from localStorage
//   useEffect(() => {
//     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     const savedConversationId = localStorage.getItem("conversationId") || "";

//     setMessages(savedMessages);
//     setConversationId(savedConversationId);
//     fetchDatabaseInfo();
//     fetchAvailablePdfs();
//   }, []);

//   // Save to localStorage
//   useEffect(() => {
//     localStorage.setItem("chatMessages", JSON.stringify(messages));
//     scrollToBottom();
//   }, [messages]);

//   const fetchDatabaseInfo = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       setDatabaseInfo(data);
//     } catch (error) {
//       console.error("Error fetching database info:", error);
//     }
//   };

//   const fetchAvailablePdfs = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       if (data.pdfs_in_database) {
//         setAvailablePdfs(data.pdfs_in_database);

//         // If we just processed a PDF, auto-select it
//         if (
//           processingQueue.length > 0 &&
//           data.pdfs_in_database.length > availablePdfs.length
//         ) {
//           const newPdf = data.pdfs_in_database.find(
//             (pdf) => !availablePdfs.includes(pdf)
//           );
//           if (newPdf) {
//             setSelectedPdf(newPdf);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching PDFs:", error);
//     }
//   };

//   const handleSendMessage = async (e, customMessage) => {
//     if (e) e.preventDefault();
//     const messageToSend = customMessage || inputMessage;
//     if (!messageToSend.trim() || isLoading) return;

//     const userMessage = {
//       id: Date.now(),
//       text: messageToSend,
//       sender: "user",
//       timestamp: new Date().toLocaleTimeString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setIsLoading(true);

//     try {
//       let currentConversationId = conversationId;
//       if (!currentConversationId) {
//         currentConversationId = Date.now().toString();
//         setConversationId(currentConversationId);
//         localStorage.setItem("conversationId", currentConversationId);
//       }

//       let response;
//       if (selectedPdf) {
//         response = await fetch("http://localhost:5001/api/query-pdf", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             query: messageToSend,
//             pdf_name: selectedPdf,
//             conversation_id: currentConversationId,
//           }),
//         });
//       } else {
//         response = await fetch("http://localhost:5001/api/query", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             query: messageToSend,
//             conversation_id: currentConversationId,
//           }),
//         });
//       }

//       const data = await response.json();

//       if (data.success) {
//         if (data.conversation_id) {
//           setConversationId(data.conversation_id);
//           localStorage.setItem("conversationId", data.conversation_id);
//         }

//         const botMessage = {
//           id: Date.now() + 1,
//           text: data.response,
//           sender: "bot",
//           timestamp: new Date().toLocaleTimeString(),
//         };
//         setMessages((prev) => [...prev, botMessage]);
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

//   const copyMessage = (text) => {
//     navigator.clipboard.writeText(text);
//   };

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const startNewConversation = () => {
//     localStorage.removeItem("conversationId");
//     localStorage.removeItem("chatMessages");
//     setMessages([]);
//     setConversationId("");
//     setSelectedPdf("");
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
//         <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
//         <button
//           onClick={startNewConversation}
//           className="bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//         >
//           <Trash2 size={14} className="inline-block mr-1" />
//           New Chat
//         </button>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
//         {messages.length === 0 && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
//             <p className="text-lg text-gray-700 mb-2">
//               👋 Welcome to Medical RAG ChatBot!
//             </p>
//             <p className="text-sm text-gray-500 mb-6">
//               Try one of these prompts to get started:
//             </p>
//             <div className="flex flex-wrap gap-2 justify-center">
//               {suggestedPrompts.map((prompt, i) => (
//                 <button
//                   key={i}
//                   onClick={() => handleSendMessage(null, prompt)}
//                   className="bg-white border border-gray-300 px-3 py-2 rounded-lg shadow hover:bg-blue-50 hover:border-blue-400 transition text-sm"
//                 >
//                   {prompt}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {messages.map((message) => (
//           <motion.div
//             key={message.id}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className={`flex ${
//               message.sender === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div className="flex items-end space-x-2 max-w-xl">
//               {message.sender !== "user" && (
//                 <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
//                   <Bot size={18} className="text-blue-600" />
//                 </div>
//               )}
//               <div
//                 className={`rounded-2xl px-4 py-2 shadow-md ${
//                   message.sender === "user"
//                     ? "bg-blue-600 text-white rounded-br-none"
//                     : "bg-white text-gray-800 rounded-bl-none"
//                 }`}
//               >
//                 <p className="text-sm whitespace-pre-wrap">{message.text}</p>
//                 <span className="text-xs opacity-70 block mt-1 text-right">
//                   {message.timestamp}
//                 </span>
//                 {message.sender === "bot" && (
//                   <div className="flex space-x-1 mt-2 justify-end">
//                     <button
//                       onClick={() => copyMessage(message.text)}
//                       className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                       title="Copy message"
//                     >
//                       <Copy size={14} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//               {message.sender === "user" && (
//                 <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
//                   <User size={18} className="text-gray-700" />
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <form
//         onSubmit={handleSendMessage}
//         className="p-4 bg-white border-t shadow-md"
//       >
//         <div className="flex space-x-2">
//           <textarea
//             rows={1}
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSendMessage(e);
//               }
//             }}
//             placeholder="Ask about medical information..."
//             className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isLoading}
//           />
//           <button
//             type="submit"
//             disabled={isLoading || !inputMessage.trim()}
//             className="bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             <Send size={18} />
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ChatBot;



// parallel processing with prompt and pdf AND SUGGESTIONS BUT HALF SCREEN AND BROUGHT TO LIGHT A MILD BACKEND UPLOAD PDF ISSUE

// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { RefreshCw, Send, Bot, User, Trash2, Mic, Upload, X, Database, FileText, Copy, Volume2, VolumeX, Lightbulb } from "lucide-react";

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [databaseInfo, setDatabaseInfo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [processingQueue, setProcessingQueue] = useState([]);
//   const fileInputRef = useRef(null);
//   const [selectedPdf, setSelectedPdf] = useState("");
//   const [availablePdfs, setAvailablePdfs] = useState([]);
//   const [speakingMessageId, setSpeakingMessageId] = useState(null);
//   const [conversationId, setConversationId] = useState("");
//   const [showSuggestions, setShowSuggestions] = useState(true);
  
//   // Suggestion data
//   const suggestions = {
//     emptyChat: [
//       "What is the recommended dosage for ibuprofen?",
//       "Tell me about side effects of amoxicillin",
//       "What are the contraindications for metformin?",
//       "How does lisinopril work?"
//     ],
//     afterDrugQuery: [
//       "What are the side effects?",
//       "What is the recommended dosage?",
//       "Are there any drug interactions?",
//       "What are the contraindications?"
//     ]
//   };

//   // Load from localStorage
//   useEffect(() => {
//     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     const savedConversationId = localStorage.getItem("conversationId") || "";
    
//     setMessages(savedMessages);
//     setConversationId(savedConversationId);
//     fetchDatabaseInfo();
//     fetchAvailablePdfs();
//   }, []);

//   // Save to localStorage
//   useEffect(() => {
//     localStorage.setItem("chatMessages", JSON.stringify(messages));
//     scrollToBottom();
//   }, [messages]);

//   // Monitor processing queue even when modal is closed
//   useEffect(() => {
//     processingQueue.forEach(job => {
//       if (!job.status || job.status !== 'monitoring') {
//         monitorProcessing(job);
//       }
//     });
//   }, [processingQueue.length]);

//   const fetchDatabaseInfo = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       setDatabaseInfo(data);
//     } catch (error) {
//       console.error("Error fetching database info:", error);
//     }
//   };

//   const fetchAvailablePdfs = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       if (data.pdfs_in_database) {
//         setAvailablePdfs(data.pdfs_in_database);
//       }
//     } catch (error) {
//       console.error("Error fetching PDFs:", error);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputMessage.trim() || isLoading) return;

//     // Hide suggestions when user sends a message
//     setShowSuggestions(false);

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
//       // Get or create a conversation ID
//       let currentConversationId = conversationId;
//       if (!currentConversationId) {
//         currentConversationId = Date.now().toString();
//         setConversationId(currentConversationId);
//         localStorage.setItem("conversationId", currentConversationId);
//       }

//       let response;
//       if (selectedPdf) {
//         response = await fetch("http://localhost:5001/api/query-pdf", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             query: inputMessage,
//             pdf_name: selectedPdf,
//             conversation_id: currentConversationId,
//           }),
//         });
//       } else {
//         response = await fetch("http://localhost:5001/api/query", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ 
//             query: inputMessage,
//             conversation_id: currentConversationId,
//           }),
//         });
//       }

//       const data = await response.json();

//       if (data.success) {
//         // Store the conversation_id if provided by the backend
//         if (data.conversation_id) {
//           setConversationId(data.conversation_id);
//           localStorage.setItem("conversationId", data.conversation_id);
//         }
        
//         const botMessage = {
//           id: Date.now() + 1,
//           text: data.response,
//           sender: "bot",
//           timestamp: new Date().toLocaleTimeString(),
//         };
//         setMessages((prev) => [...prev, botMessage]);
        
//         // Show suggestions after drug-related responses
//         if (data.response.toLowerCase().includes('drug') || 
//             data.response.toLowerCase().includes('medication') ||
//             data.response.toLowerCase().includes('treatment')) {
//           setShowSuggestions(true);
//         }
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

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setIsUploading(true);
//       setUploadStatus("Uploading file...");

//       const response = await fetch("http://localhost:5001/api/upload-pdf", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setUploadStatus(`✅ File uploaded successfully! Processing started for ${data.filename}`);
//         setSelectedFile(null);
        
//         // Add to processing queue
//         const processingJob = {
//           id: data.upload_id,
//           filename: data.filename,
//           status: "queued",
//           startTime: new Date().toISOString(),
//         };
        
//         setProcessingQueue(prev => [...prev, processingJob]);
//       } else {
//         setUploadStatus(`❌ Error: ${data.error}`);
//       }
//     } catch (error) {
//       setUploadStatus(`❌ Upload failed: ${error.message}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const monitorProcessing = async (job) => {
//     // Check if already monitoring this job
//     if (processingQueue.find(item => item.id === job.id)?.status === 'monitoring') {
//       return;
//     }
    
//     // Update queue to show we're monitoring this job
//     setProcessingQueue(prev => prev.map(item => 
//       item.id === job.id ? {...item, status: 'monitoring'} : item
//     ));
    
//     const checkStatus = async () => {
//       try {
//         const response = await fetch(`http://localhost:5001/api/upload-status/${job.id}`);
//         const status = await response.json();

//         if (status.status === "completed") {
//           // Remove from queue
//           setProcessingQueue(prev => prev.filter(item => item.id !== job.id));
          
//           // Update database info
//           fetchDatabaseInfo();
//           fetchAvailablePdfs();
          
//           // Show success message in chat
//           const successMessage = {
//             id: Date.now(),
//             text: `✅ PDF processing completed: ${job.filename} is now available for querying`,
//             sender: "system",
//             timestamp: new Date().toLocaleTimeString(),
//           };
//           setMessages((prev) => [...prev, successMessage]);
          
//         } else if (status.status === "failed") {
//           // Remove from queue
//           setProcessingQueue(prev => prev.filter(item => item.id !== job.id));
          
//           const errorMessage = {
//             id: Date.now(),
//             text: `❌ PDF processing failed: ${job.filename}`,
//             sender: "system",
//             timestamp: new Date().toLocaleTimeString(),
//           };
//           setMessages((prev) => [...prev, errorMessage]);
          
//         } else if (status.status === "processing") {
//           // Update status and continue monitoring
//           setTimeout(() => checkStatus(), 2000);
//         }
//       } catch (error) {
//         console.error("Error checking processing status:", error);
//         setTimeout(() => checkStatus(), 3000);
//       }
//     };

//     checkStatus();
//   };

//   const speakText = (text, messageId) => {
//     if ("speechSynthesis" in window) {
//       if (speakingMessageId) {
//         speechSynthesis.cancel();
//       }
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = "en-US";

//       utterance.onend = () => setSpeakingMessageId(null);
//       utterance.onerror = () => setSpeakingMessageId(null);

//       speechSynthesis.speak(utterance);
//       setSpeakingMessageId(messageId);
//     }
//   };

//   const stopSpeaking = () => {
//     if ("speechSynthesis" in window) {
//       speechSynthesis.cancel();
//       setSpeakingMessageId(null);
//     }
//   };

//   const copyMessage = (text) => {
//     navigator.clipboard.writeText(text);
//   };

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const startNewConversation = () => {
//     localStorage.removeItem("conversationId");
//     localStorage.removeItem("chatMessages");
//     setMessages([]);
//     setConversationId("");
//     setSelectedPdf("");
//     setShowSuggestions(true);
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
//         <div>
//           <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
//           {databaseInfo && (
//             <div className="text-sm opacity-90 mt-1">
//               {databaseInfo.document_count} docs loaded
//               {processingQueue.length > 0 && (
//                 <span className="ml-2">({processingQueue.length} processing...)</span>
//               )}
//             </div>
//           )}
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={() => setShowUploadModal(true)}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <Upload size={14} /> <span>Upload PDF</span>
//           </button>
//           <button
//             onClick={startNewConversation}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <Trash2 size={14} /> <span>New Chat</span>
//           </button>
//           <button
//             onClick={() => {
//               fetchDatabaseInfo();
//               fetchAvailablePdfs();
//             }}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <RefreshCw size={14} /> <span>Refresh</span>
//           </button>
//         </div>
//       </div>

//       {/* PDF Selection */}
//       <div className="bg-white p-3 border-b shadow-sm">
//         <select 
//           value={selectedPdf} 
//           onChange={(e) => setSelectedPdf(e.target.value)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         >
//           <option value="">All PDFs</option>
//           {availablePdfs.map(pdf => (
//             <option key={pdf} value={pdf}>{pdf}</option>
//           ))}
//         </select>
//       </div>

//       {/* Processing Queue Status */}
//       {processingQueue.length > 0 && (
//         <div className="bg-yellow-100 border-b border-yellow-300 p-2">
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-yellow-800">
//               ⚡ {processingQueue.length} PDF(s) processing...
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
//                 {message.sender !== "user" && message.sender !== "system" && (
//                   <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
//                     <Bot size={18} className="text-blue-600" />
//                   </div>
//                 )}
//                 {message.sender === "system" && (
//                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
//                     <Database size={18} className="text-gray-600" />
//                   </div>
//                 )}
//                 <div
//                   className={`rounded-2xl px-4 py-2 shadow-md ${
//                     message.sender === "user"
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : message.sender === "error"
//                       ? "bg-red-100 text-red-800 border border-red-300"
//                       : message.sender === "system"
//                       ? "bg-gray-200 text-gray-700 border border-gray-300"
//                       : "bg-white text-gray-800 rounded-bl-none"
//                   }`}
//                 >
//                   <p className="text-sm whitespace-pre-wrap">{message.text}</p>
//                   <span className="text-xs opacity-70 block mt-1 text-right">
//                     {message.timestamp}
//                   </span>
                  
//                   {message.sender === "bot" && (
//                     <div className="flex space-x-1 mt-2 justify-end">
//                       <button 
//                         onClick={() => copyMessage(message.text)} 
//                         className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                         title="Copy message"
//                       >
//                         <Copy size={14}/>
//                       </button>
//                       {speakingMessageId === message.id ? (
//                         <button 
//                           onClick={stopSpeaking} 
//                           className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-gray-100 transition"
//                           title="Stop speaking"
//                         >
//                           <VolumeX size={14}/>
//                         </button>
//                       ) : (
//                         <button 
//                           onClick={() => speakText(message.text, message.id)} 
//                           className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                           title="Read aloud"
//                         >
//                           <Volume2 size={14}/>
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//                 {message.sender === "user" && (
//                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
//                     <User size={18} className="text-gray-700" />
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           ))
//         )}

//         {isLoading && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="flex justify-start"
//           >
//             <div className="flex items-center space-x-2 bg-white shadow-md rounded-2xl px-4 py-2 max-w-xs">
//               <Bot size={18} className="text-blue-600" />
//               <div className="flex space-x-1">
//                 <motion.div
//                   className="w-2 h-2 bg-gray-400 rounded-full"
//                   animate={{ y: [0, -4, 0] }}
//                   transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
//                 />
//                 <motion.div
//                   className="w-2 h-2 bg-gray-400 rounded-full"
//                   animate={{ y: [0, -4, 0] }}
//                   transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
//                 />
//                 <motion.div
//                   className="w-2 h-2 bg-gray-400 rounded-full"
//                   animate={{ y: [0, -4, 0] }}
//                   transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
//                 />
//               </div>
//             </div>
//           </motion.div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Suggestions */}
//       <AnimatePresence>
//         {showSuggestions && messages.length === 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             transition={{ duration: 0.3 }}
//             className="px-4 pb-3"
//           >
//             <div className="flex items-center text-sm text-gray-500 mb-2">
//               <Lightbulb size={16} className="mr-1" />
//               <span>Try asking about</span>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {suggestions.emptyChat.map((suggestion, index) => (
//                 <motion.button
//                   key={index}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => {
//                     setInputMessage(suggestion);
//                     setShowSuggestions(false);
//                   }}
//                   className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm hover:bg-blue-100 transition-colors"
//                 >
//                   {suggestion}
//                 </motion.button>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Contextual suggestions after drug-related messages */}
//       <AnimatePresence>
//         {showSuggestions && messages.length > 0 && 
//         messages[messages.length - 1].sender === "bot" && 
//         (messages[messages.length - 1].text.toLowerCase().includes('drug') ||
//          messages[messages.length - 1].text.toLowerCase().includes('medication') ||
//          messages[messages.length - 1].text.toLowerCase().includes('treatment')) && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             transition={{ duration: 0.3 }}
//             className="px-4 pb-3"
//           >
//             <div className="flex items-center text-sm text-gray-500 mb-2">
//               <Lightbulb size={16} className="mr-1" />
//               <span>Learn more about this drug</span>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {suggestions.afterDrugQuery.map((suggestion, index) => (
//                 <motion.button
//                   key={index}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => {
//                     setInputMessage(suggestion);
//                     setShowSuggestions(false);
//                   }}
//                   className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm hover:bg-blue-100 transition-colors"
//                 >
//                   {suggestion}
//                 </motion.button>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Input */}
//       <form
//         onSubmit={handleSendMessage}
//         className="p-4 bg-white border-t shadow-md"
//       >
//         <div className="flex space-x-2">
//           <textarea
//             rows={1}
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSendMessage(e);
//               }
//             }}
//             placeholder="Ask about medical information..."
//             className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isLoading}
//           />
//           <button
//             type="submit"
//             disabled={isLoading || !inputMessage.trim()}
//             className="bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             <Send size={18} />
//           </button>
//         </div>
//       </form>

//       {/* Upload Modal */}
//       {showUploadModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg p-6 w-96">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Upload PDF Document</h3>
//               <button
//                 onClick={() => {
//                   setShowUploadModal(false);
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div
//                 className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleFileUpload}
//                   accept=".pdf"
//                   className="hidden"
//                 />
//                 <FileText size={32} className="mx-auto text-gray-400 mb-2" />
//                 <p className="text-sm text-gray-600">
//                   Click to select PDF file
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Supported: PDF documents
//                 </p>
//               </div>

//               {uploadStatus && (
//                 <div className={`text-sm p-3 rounded-lg ${
//                   uploadStatus.includes("✅") 
//                     ? "bg-green-100 text-green-800" 
//                     : uploadStatus.includes("❌")
//                     ? "bg-red-100 text-red-800"
//                     : "bg-blue-100 text-blue-800"
//                 }`}>
//                   {uploadStatus}
//                 </div>
//               )}

//               {processingQueue.length > 0 && (
//                 <div className="mt-4 p-3 bg-gray-100 rounded-lg">
//                   <h4 className="font-medium mb-2">Processing Queue</h4>
//                   {processingQueue.map((job) => (
//                     <div key={job.id} className="flex justify-between items-center text-sm mb-2">
//                       <span className="truncate">{job.filename}</span>
//                       <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
//                         Processing...
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Persistent processing indicator */}
//       {processingQueue.length > 0 && (
//         <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-50">
//           <div className="flex items-center">
//             <RefreshCw size={16} className="animate-spin mr-2" />
//             <span>{processingQueue.length} file(s) processing...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatBot;


// PDF, PARALLEL, EXPAND TO FULL SCREEN

// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { RefreshCw, Send, Bot, User, Trash2, Mic, Upload, X, Database, FileText, Copy, Volume2, VolumeX, Lightbulb } from "lucide-react";

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [databaseInfo, setDatabaseInfo] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [processingQueue, setProcessingQueue] = useState([]);
//   const fileInputRef = useRef(null);
//   const [selectedPdf, setSelectedPdf] = useState("");
//   const [availablePdfs, setAvailablePdfs] = useState([]);
//   const [speakingMessageId, setSpeakingMessageId] = useState(null);
//   const [conversationId, setConversationId] = useState("");
//   const [showSuggestions, setShowSuggestions] = useState(true);
  
//   // Suggestion data
//   const suggestions = {
//     emptyChat: [
//       "What is the recommended dosage for ibuprofen?",
//       "Tell me about side effects of simponi aria.",
//       "What are the contraindications for remicade?",
//       "How does orencia work?"
//     ],
//     afterDrugQuery: [
//       "What are the side effects?",
//       "What is the recommended dosage?",
//       "Are there any drug interactions?",
//       "What are the contraindications?"
//     ]
//   };

//   // Load from localStorage
//   useEffect(() => {
//     const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     const savedConversationId = localStorage.getItem("conversationId") || "";
    
//     setMessages(savedMessages);
//     setConversationId(savedConversationId);
//     fetchDatabaseInfo();
//     fetchAvailablePdfs();
//   }, []);

//   // Save to localStorage
//   useEffect(() => {
//     localStorage.setItem("chatMessages", JSON.stringify(messages));
//     scrollToBottom();
//   }, [messages]);

//   // Monitor processing queue even when modal is closed
//   useEffect(() => {
//     processingQueue.forEach(job => {
//       if (!job.status || job.status !== 'monitoring') {
//         monitorProcessing(job);
//       }
//     });
//   }, [processingQueue.length]);

//   const fetchDatabaseInfo = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       setDatabaseInfo(data);
//     } catch (error) {
//       console.error("Error fetching database info:", error);
//     }
//   };

//   const fetchAvailablePdfs = async () => {
//     try {
//       const response = await fetch("http://localhost:5001/api/database-info");
//       const data = await response.json();
//       if (data.pdfs_in_database) {
//         setAvailablePdfs(data.pdfs_in_database);
//       }
//     } catch (error) {
//       console.error("Error fetching PDFs:", error);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputMessage.trim() || isLoading) return;

//     // Hide suggestions when user sends a message
//     setShowSuggestions(false);

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
//       // Get or create a conversation ID
//       let currentConversationId = conversationId;
//       if (!currentConversationId) {
//         currentConversationId = Date.now().toString();
//         setConversationId(currentConversationId);
//         localStorage.setItem("conversationId", currentConversationId);
//       }

//       let response;
//       if (selectedPdf) {
//         response = await fetch("http://localhost:5001/api/query-pdf", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             query: inputMessage,
//             pdf_name: selectedPdf,
//             conversation_id: currentConversationId,
//           }),
//         });
//       } else {
//         response = await fetch("http://localhost:5001/api/query", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ 
//             query: inputMessage,
//             conversation_id: currentConversationId,
//           }),
//         });
//       }

//       const data = await response.json();

//       if (data.success) {
//         // Store the conversation_id if provided by the backend
//         if (data.conversation_id) {
//           setConversationId(data.conversation_id);
//           localStorage.setItem("conversationId", data.conversation_id);
//         }
        
//         const botMessage = {
//           id: Date.now() + 1,
//           text: data.response,
//           sender: "bot",
//           timestamp: new Date().toLocaleTimeString(),
//         };
//         setMessages((prev) => [...prev, botMessage]);
        
//         // Show suggestions after drug-related responses
//         if (data.response.toLowerCase().includes('drug') || 
//             data.response.toLowerCase().includes('medication') ||
//             data.response.toLowerCase().includes('treatment')) {
//           setShowSuggestions(true);
//         }
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

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       setIsUploading(true);
//       setUploadStatus("Uploading file...");

//       const response = await fetch("http://localhost:5001/api/upload-pdf", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         setUploadStatus(`✅ File uploaded successfully! Processing started for ${data.filename}`);
//         setSelectedFile(null);
        
//         // Add to processing queue
//         const processingJob = {
//           id: data.upload_id,
//           filename: data.filename,
//           status: "queued",
//           startTime: new Date().toISOString(),
//         };
        
//         setProcessingQueue(prev => [...prev, processingJob]);
//       } else {
//         setUploadStatus(`❌ Error: ${data.error}`);
//       }
//     } catch (error) {
//       setUploadStatus(`❌ Upload failed: ${error.message}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const monitorProcessing = async (job) => {
//     // Check if already monitoring this job
//     if (processingQueue.find(item => item.id === job.id)?.status === 'monitoring') {
//       return;
//     }
    
//     // Update queue to show we're monitoring this job
//     setProcessingQueue(prev => prev.map(item => 
//       item.id === job.id ? {...item, status: 'monitoring'} : item
//     ));
    
//     const checkStatus = async () => {
//       try {
//         const response = await fetch(`http://localhost:5001/api/upload-status/${job.id}`);
//         const status = await response.json();

//         if (status.status === "completed") {
//           // Remove from queue
//           setProcessingQueue(prev => prev.filter(item => item.id !== job.id));
          
//           // Update database info
//           fetchDatabaseInfo();
//           fetchAvailablePdfs();
          
//           // Show success message in chat
//           const successMessage = {
//             id: Date.now(),
//             text: `✅ PDF processing completed: ${job.filename} is now available for querying`,
//             sender: "system",
//             timestamp: new Date().toLocaleTimeString(),
//           };
//           setMessages((prev) => [...prev, successMessage]);
          
//         } else if (status.status === "failed") {
//           // Remove from queue
//           setProcessingQueue(prev => prev.filter(item => item.id !== job.id));
          
//           const errorMessage = {
//             id: Date.now(),
//             text: `❌ PDF processing failed: ${job.filename}`,
//             sender: "system",
//             timestamp: new Date().toLocaleTimeString(),
//           };
//           setMessages((prev) => [...prev, errorMessage]);
          
//         } else if (status.status === "processing") {
//           // Update status and continue monitoring
//           setTimeout(() => checkStatus(), 2000);
//         }
//       } catch (error) {
//         console.error("Error checking processing status:", error);
//         setTimeout(() => checkStatus(), 3000);
//       }
//     };

//     checkStatus();
//   };

//   const speakText = (text, messageId) => {
//     if ("speechSynthesis" in window) {
//       if (speakingMessageId) {
//         speechSynthesis.cancel();
//       }
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = "en-US";

//       utterance.onend = () => setSpeakingMessageId(null);
//       utterance.onerror = () => setSpeakingMessageId(null);

//       speechSynthesis.speak(utterance);
//       setSpeakingMessageId(messageId);
//     }
//   };

//   const stopSpeaking = () => {
//     if ("speechSynthesis" in window) {
//       speechSynthesis.cancel();
//       setSpeakingMessageId(null);
//     }
//   };

//   const copyMessage = (text) => {
//     navigator.clipboard.writeText(text);
//   };

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const startNewConversation = () => {
//     localStorage.removeItem("conversationId");
//     localStorage.removeItem("chatMessages");
//     setMessages([]);
//     setConversationId("");
//     setSelectedPdf("");
//     setShowSuggestions(true);
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full max-w-full overflow-hidden">
//       {/* Header */}
//       <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center w-full flex-shrink-0">
//         <div>
//           <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
//           {databaseInfo && (
//             <div className="text-sm opacity-90 mt-1">
//               {databaseInfo.document_count} docs loaded
//               {processingQueue.length > 0 && (
//                 <span className="ml-2">({processingQueue.length} processing...)</span>
//               )}
//             </div>
//           )}
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={() => setShowUploadModal(true)}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <Upload size={14} /> <span>Upload PDF</span>
//           </button>
//           <button
//             onClick={startNewConversation}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <Trash2 size={14} /> <span>New Chat</span>
//           </button>
//           <button
//             onClick={() => {
//               fetchDatabaseInfo();
//               fetchAvailablePdfs();
//             }}
//             className="flex items-center space-x-1 text-sm bg-white text-blue-600 px-3 py-1 rounded-md shadow hover:bg-gray-100 transition"
//           >
//             <RefreshCw size={14} /> <span>Refresh</span>
//           </button>
//         </div>
//       </div>

//       {/* PDF Selection */}
//       <div className="bg-white p-3 border-b shadow-sm w-full flex-shrink-0">
//         <select 
//           value={selectedPdf} 
//           onChange={(e) => setSelectedPdf(e.target.value)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         >
//           <option value="">All PDFs</option>
//           {availablePdfs.map(pdf => (
//             <option key={pdf} value={pdf}>{pdf}</option>
//           ))}
//         </select>
//       </div>

//       {/* Processing Queue Status */}
//       {processingQueue.length > 0 && (
//         <div className="bg-yellow-100 border-b border-yellow-300 p-2 w-full flex-shrink-0">
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-yellow-800">
//               ⚡ {processingQueue.length} PDF(s) processing...
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Main content area */}
//       <div className="flex-1 flex flex-col min-h-0 w-full">
//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full">
//           {messages.length === 0 ? (
//             <div className="text-center text-gray-500 mt-8">
//               <p className="text-lg">👋 Welcome to Medical RAG ChatBot!</p>
//               <p className="text-sm mt-2">
//                 Ask questions about drug information and medical documents.
//               </p>
//             </div>
//           ) : (
//             messages.map((message) => (
//               <motion.div
//                 key={message.id}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className={`flex ${
//                   message.sender === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div className="flex items-end space-x-2 max-w-xl">
//                   {message.sender !== "user" && message.sender !== "system" && (
//                     <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shadow">
//                       <Bot size={18} className="text-blue-600" />
//                     </div>
//                   )}
//                   {message.sender === "system" && (
//                     <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
//                       <Database size={18} className="text-gray-600" />
//                     </div>
//                   )}
//                   <div
//                     className={`rounded-2xl px-4 py-2 shadow-md ${
//                       message.sender === "user"
//                         ? "bg-blue-600 text-white rounded-br-none"
//                         : message.sender === "error"
//                         ? "bg-red-100 text-red-800 border border-red-300"
//                         : message.sender === "system"
//                         ? "bg-gray-200 text-gray-700 border border-gray-300"
//                         : "bg-white text-gray-800 rounded-bl-none"
//                     }`}
//                   >
//                     <p className="text-sm whitespace-pre-wrap">{message.text}</p>
//                     <span className="text-xs opacity-70 block mt-1 text-right">
//                       {message.timestamp}
//                     </span>
                    
//                     {message.sender === "bot" && (
//                       <div className="flex space-x-1 mt-2 justify-end">
//                         <button 
//                           onClick={() => copyMessage(message.text)} 
//                           className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                           title="Copy message"
//                         >
//                           <Copy size={14}/>
//                         </button>
//                         {speakingMessageId === message.id ? (
//                           <button 
//                             onClick={stopSpeaking} 
//                             className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-gray-100 transition"
//                             title="Stop speaking"
//                           >
//                             <VolumeX size={14}/>
//                           </button>
//                         ) : (
//                           <button 
//                             onClick={() => speakText(message.text, message.id)} 
//                             className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
//                             title="Read aloud"
//                           >
//                             <Volume2 size={14}/>
//                           </button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   {message.sender === "user" && (
//                     <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shadow">
//                       <User size={18} className="text-gray-700" />
//                     </div>
//                   )}
//                 </div>
//               </motion.div>
//             ))
//           )}

//           {isLoading && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="flex justify-start"
//             >
//               <div className="flex items-center space-x-2 bg-white shadow-md rounded-2xl px-4 py-2 max-w-xs">
//                 <Bot size={18} className="text-blue-600" />
//                 <div className="flex space-x-1">
//                   <motion.div
//                     className="w-2 h-2 bg-gray-400 rounded-full"
//                     animate={{ y: [0, -4, 0] }}
//                     transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
//                   />
//                   <motion.div
//                     className="w-2 h-2 bg-gray-400 rounded-full"
//                     animate={{ y: [0, -4, 0] }}
//                     transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
//                   />
//                   <motion.div
//                     className="w-2 h-2 bg-gray-400 rounded-full"
//                     animate={{ y: [0, -4, 0] }}
//                     transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
//                   />
//                 </div>
//                 <div className="text-sm text-gray-600">Thinking...</div>
//               </div>
//             </motion.div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>

//         {/* Suggestions */}
//         <AnimatePresence>
//           {showSuggestions && messages.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 20 }}
//               transition={{ duration: 0.3 }}
//               className="px-4 pb-3 flex-shrink-0"
//             >
//               <div className="flex items-center text-sm text-gray-500 mb-2">
//                 <Lightbulb size={16} className="mr-1" />
//                 <span>Try asking about</span>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {suggestions.emptyChat.map((suggestion, index) => (
//                   <motion.button
//                     key={index}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => {
//                       setInputMessage(suggestion);
//                       setShowSuggestions(false);
//                     }}
//                     className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm hover:bg-blue-100 transition-colors"
//                   >
//                     {suggestion}
//                   </motion.button>
//                 ))}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Contextual suggestions after drug-related messages */}
//         <AnimatePresence>
//           {showSuggestions && messages.length > 0 && 
//           messages[messages.length - 1].sender === "bot" && 
//           (messages[messages.length - 1].text.toLowerCase().includes('drug') ||
//           messages[messages.length - 1].text.toLowerCase().includes('medication') ||
//           messages[messages.length - 1].text.toLowerCase().includes('treatment')) && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 20 }}
//               transition={{ duration: 0.3 }}
//               className="px-4 pb-3 flex-shrink-0"
//             >
//               <div className="flex items-center text-sm text-gray-500 mb-2">
//                 <Lightbulb size={16} className="mr-1" />
//                 <span>Learn more about this drug</span>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {suggestions.afterDrugQuery.map((suggestion, index) => (
//                   <motion.button
//                     key={index}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => {
//                       setInputMessage(suggestion);
//                       setShowSuggestions(false);
//                     }}
//                     className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm hover:bg-blue-100 transition-colors"
//                   >
//                     {suggestion}
//                   </motion.button>
//                 ))}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Input */}
//         <form
//           onSubmit={handleSendMessage}
//           className="p-4 bg-white border-t shadow-md w-full flex-shrink-0"
//         >
//           <div className="flex space-x-2 w-full">
//             <textarea
//               rows={1}
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey) {
//                   e.preventDefault();
//                   handleSendMessage(e);
//                 }
//               }}
//               placeholder="Ask about medical information..."
//               className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
//               disabled={isLoading}
//             />
//             <button
//               type="submit"
//               disabled={isLoading || !inputMessage.trim()}
//               className="bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
//             >
//               <Send size={18} />
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Upload Modal */}
//       {showUploadModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 w-full h-full">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Upload PDF Document</h3>
//               <button
//                 onClick={() => {
//                   setShowUploadModal(false);
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div
//                 className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleFileUpload}
//                   accept=".pdf"
//                   className="hidden"
//                 />
//                 <FileText size={32} className="mx-auto text-gray-400 mb-2" />
//                 <p className="text-sm text-gray-600">
//                   Click to select PDF file
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Supported: PDF documents
//                 </p>
//               </div>

//               {uploadStatus && (
//                 <div className={`text-sm p-3 rounded-lg ${
//                   uploadStatus.includes("✅") 
//                     ? "bg-green-100 text-green-800" 
//                     : uploadStatus.includes("❌")
//                     ? "bg-red-100 text-red-800"
//                     : "bg-blue-100 text-blue-800"
//                 }`}>
//                   {uploadStatus}
//                 </div>
//               )}

//               {processingQueue.length > 0 && (
//                 <div className="mt-4 p-3 bg-gray-100 rounded-lg">
//                   <h4 className="font-medium mb-2">Processing Queue</h4>
//                   {processingQueue.map((job) => (
//                     <div key={job.id} className="flex justify-between items-center text-sm mb-2">
//                       <span className="truncate">{job.filename}</span>
//                       <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
//                         Processing...
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Persistent processing indicator */}
//       {processingQueue.length > 0 && (
//         <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg z-50">
//           <div className="flex items-center">
//             <RefreshCw size={16} className="animate-spin mr-2" />
//             <span>{processingQueue.length} file(s) processing...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatBot;


// chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Send, Bot, User, Trash2, Mic, Moon, Sun, Copy, Volume2, VolumeX, Upload, X, Lightbulb } from "lucide-react";

const ChatBot = ({ username, onSaveChat }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);
  const [conversationContext, setConversationContext] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const recognitionRef = useRef(null);

  // 🟢 PDF Upload & Selection States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState({}); // Changed to object to track multiple uploads
  const [selectedPdf, setSelectedPdf] = useState("");
  const [availablePdfs, setAvailablePdfs] = useState([]);
  
  // 🟢 New states for contextual suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🟢 Load available PDFs
  useEffect(() => {
    fetchAvailablePdfs();
  }, []);

  const fetchAvailablePdfs = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/database-info");
      const data = await response.json();
      if (data.pdfs_in_database) {
        setAvailablePdfs(data.pdfs_in_database);
      }
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };

  // 🟢 Upload handler - now supports multiple parallel uploads
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file in parallel
    Array.from(files).forEach(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5001/api/upload-pdf", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          // Track each upload separately
          setUploadStatuses(prev => ({
            ...prev,
            [data.upload_id]: {
              id: data.upload_id,
              filename: data.filename,
              status: "queued",
              progress: 0,
            }
          }));
          
          // Start polling for this specific upload
          pollUploadStatus(data.upload_id);
        } else {
          alert(`Upload failed for ${file.name}: ${data.error}`);
        }
      } catch (error) {
        alert(`Upload failed for ${file.name}`);
        console.error("Upload error:", error);
      }
    });
  };

  // 🟢 Poll upload status for individual uploads
  const pollUploadStatus = async (uploadId) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/upload-status/${uploadId}`);
        const status = await response.json();

        setUploadStatuses(prev => ({
          ...prev,
          [uploadId]: status
        }));

        if (status.status === "processing" || status.status === "queued") {
          setTimeout(checkStatus, 2000);
        } else if (status.status === "completed") {
          // Don't alert here - let the user continue working
          console.log(`File ${status.filename} processed successfully!`);
          fetchAvailablePdfs();
          
          // Remove completed upload from status after a delay
          setTimeout(() => {
            setUploadStatuses(prev => {
              const newStatuses = {...prev};
              delete newStatuses[uploadId];
              return newStatuses;
            });
          }, 3000);
        } else if (status.status === "failed") {
          console.error(`Processing failed: ${status.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    checkStatus();
  };

  // 🟢 Get contextual suggestions based on conversation
  const fetchSuggestions = async () => {
    if (messages.length === 0 || !conversationId) return;
    
    try {
      const response = await fetch("http://localhost:5001/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          conversation_id: conversationId,
          recent_messages: messages.slice(-3).map(m => ({
            sender: m.sender,
            text: m.text
          }))
        }),
      });
      
      const data = await response.json();
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // 🟢 Auto-fetch suggestions when conversation changes
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        fetchSuggestions();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // 🟢 Use a suggestion as input
  const useSuggestion = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  // 🟢 Speech Recognition Setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };

      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // 🟢 Text-to-Speech
  const speakText = (text, messageId) => {
    if ("speechSynthesis" in window) {
      if (speakingMessageId) {
        speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";

      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);

      speechSynthesis.speak(utterance);
      setSpeakingMessageId(messageId);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  // Conversation Setup
  useEffect(() => {
    const newConversationId = Date.now().toString();
    setConversationId(newConversationId);
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(savedMessages);
    fetchDatabaseInfo();
    loadConversationContext(newConversationId);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const saveChatToServer = async (message, sender) => {
    try {
      await fetch("http://localhost:5000/api/save-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          message,
          sender,
          timestamp: new Date().toISOString()
        })
      });
      if (onSaveChat) onSaveChat();
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const loadConversationContext = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/conversation/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversationContext(data);
      }
    } catch (error) {
      console.error("Error loading conversation context:", error);
    }
  };

  const clearConversation = async () => {
    try {
      await fetch(`http://localhost:5001/api/conversation/${conversationId}`, {
        method: "DELETE",
      });
      setMessages([]);
      setConversationContext(null);
      setSuggestions([]);
      setShowSuggestions(false);
      localStorage.removeItem("chatMessages");
      setConversationId(Date.now().toString());
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

  // 🟢 Modified sendMessage with PDF selection
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
    saveChatToServer(inputMessage, "user");
    setInputMessage("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      let response;
      if (selectedPdf) {
        response = await fetch("http://localhost:5001/api/query-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: inputMessage,
            pdf_name: selectedPdf,
            conversation_id: conversationId
          }),
        });
      } else {
        response = await fetch("http://localhost:5001/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: inputMessage, conversation_id: conversationId }),
        });
      }

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, botMessage]);
        saveChatToServer(data.response, "bot");
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `⚠️ ${error.message}`,
        sender: "error",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      saveChatToServer(`Error: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    // You could use a toast notification here instead of alert
  };

  const downloadChat = () => {
    const chatText = messages.map((m) => `[${m.sender}] ${m.text}`).join("\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chat_history.txt";
    link.click();
  };

  return (
    <div className={`flex flex-col h-full ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">💊 Medical RAG ChatBot</h1>
          {databaseInfo && <p className="text-sm text-gray-500">{databaseInfo.document_count} documents loaded</p>}
        </div>
        <div className="flex space-x-2">
          <button onClick={clearConversation} className="flex items-center space-x-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition">
            <Trash2 size={16}/>
            <span>Clear</span>
          </button>
          <button onClick={fetchDatabaseInfo} className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition">
            <RefreshCw size={16}/>
            <span>Refresh</span>
          </button>
          <button onClick={downloadChat} className="flex items-center space-x-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition">
            <span>Save Chat</span>
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition">
            {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
        </div>
      </div>

      {/* PDF Select + Upload */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select PDF</label>
          <select 
            value={selectedPdf} 
            onChange={(e) => setSelectedPdf(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
            <option value="">All PDFs</option>
            {availablePdfs.map(pdf => (
              <option key={pdf} value={pdf}>{pdf}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mt-6 transition"
        >
          <Upload size={16}/>
          <span>Upload PDF</span>
        </button>
      </div>

      {/* Upload Status Indicator */}
      {Object.keys(uploadStatuses).length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-2">
            <RefreshCw size={14} className="text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700">
              Processing {Object.keys(uploadStatuses).length} file(s) in background
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
              <Bot size={48} className="mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Welcome to Medical RAG ChatBot</h3>
              <p className="text-gray-500">Ask questions about drug information, or select a specific PDF to query.</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <motion.div 
            key={message.id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`p-4 rounded-2xl max-w-xl relative ${message.sender === "user" 
              ? "bg-blue-600 text-white" 
              : message.sender === "error" 
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-white text-gray-800 shadow-sm border border-gray-200"}`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
              
              {message.sender === "bot" && (
                <div className="absolute -bottom-4 right-2 flex space-x-1 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
                  <button 
                    onClick={() => copyMessage(message.text)} 
                    className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
                    title="Copy message"
                  >
                    <Copy size={14}/>
                  </button>
                  {speakingMessageId === message.id ? (
                    <button 
                      onClick={stopSpeaking} 
                      className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-gray-100 transition"
                      title="Stop speaking"
                    >
                      <VolumeX size={14}/>
                    </button>
                  ) : (
                    <button 
                      onClick={() => speakText(message.text, message.id)} 
                      className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition"
                      title="Read aloud"
                    >
                      <Volume2 size={14}/>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {/* Contextual Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4"
          >
            <div className="flex items-center mb-2">
              <Lightbulb size={16} className="text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Suggested questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => useSuggestion(suggestion)}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 max-w-xs">
              <div className="flex space-x-2 items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">Processing your question...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-3">
          <button 
            type="button" 
            onClick={startListening} 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${isListening 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            title={isListening ? "Listening..." : "Voice input"}
          >
            <Mic size={20} />
          </button>
          
          <input 
            value={inputMessage} 
            onChange={(e) => setInputMessage(e.target.value)} 
            placeholder="Ask about drug information..." 
            className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          
          <button 
            type="submit" 
            disabled={isLoading || !inputMessage.trim()}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send size={20}/>
          </button>
        </div>
      </form>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800">Upload PDF Documents</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF files (multiple supported)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF (max. 10MB each)</p>
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                </label>
              </div>
            </div>
            
            {Object.values(uploadStatuses).length > 0 && (
              <div className="mb-5 space-y-3 max-h-60 overflow-y-auto">
                {Object.values(uploadStatuses).map((status) => (
                  <div key={status.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-700 truncate max-w-xs">{status.filename}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        status.status === 'completed' ? 'bg-green-100 text-green-800' :
                        status.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                      </span>
                    </div>
                    
                    {status.progress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${status.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {status.status === 'processing' && status.progress > 0 && (
                      <p className="text-xs text-blue-600 mt-1">{status.progress}% complete</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
