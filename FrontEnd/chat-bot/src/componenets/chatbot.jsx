// chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Send, Bot, User, Trash2, Mic, Moon, Sun, Copy, Volume2, VolumeX, Upload, X } from "lucide-react";

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
  const [uploadStatus, setUploadStatus] = useState({});
  const [selectedPdf, setSelectedPdf] = useState("");
  const [availablePdfs, setAvailablePdfs] = useState([]);

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

  // 🟢 Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5001/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadStatus({
          id: data.upload_id,
          filename: data.filename,
          status: "queued",
          progress: 0,
        });
        // Start polling
        pollUploadStatus(data.upload_id);
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      alert("Upload failed");
      console.error("Upload error:", error);
    }
  };

  // 🟢 Poll upload status
  const pollUploadStatus = async (uploadId) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/upload-status/${uploadId}`);
        const status = await response.json();

        setUploadStatus(status);

        if (status.status === "processing" || status.status === "queued") {
          setTimeout(checkStatus, 2000);
        } else if (status.status === "completed") {
          alert(`File ${status.filename} processed successfully!`);
          fetchAvailablePdfs();
        } else if (status.status === "failed") {
          alert(`Processing failed: ${status.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    checkStatus();
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
              <h2 className="text-xl font-semibold text-gray-800">Upload PDF Document</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF file</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF (max. 10MB)</p>
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            {uploadStatus.id && (
              <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-700">Processing: {uploadStatus.filename}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    uploadStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                    uploadStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {uploadStatus.status.charAt(0).toUpperCase() + uploadStatus.status.slice(1)}
                  </span>
                </div>
                
                {uploadStatus.progress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadStatus.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {uploadStatus.status === 'processing' && uploadStatus.progress > 0 && (
                  <p className="text-xs text-blue-600 mt-2">{uploadStatus.progress}% complete</p>
                )}
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