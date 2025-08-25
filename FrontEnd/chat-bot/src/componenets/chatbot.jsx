import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Send, Bot, User, Trash2, Mic, Moon, Sun, Copy, Volume2, VolumeX } from "lucide-react";

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
    alert("Message copied!");
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
    <div className={`flex flex-col h-full ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-gray-50 to-gray-100"}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">💊 Medical RAG ChatBot</h1>
          {databaseInfo && <p className="text-sm">{databaseInfo.document_count} docs loaded</p>}
        </div>
        <div className="flex space-x-2">
          <button onClick={clearConversation} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 flex items-center space-x-1"><Trash2 size={14}/> Clear</button>
          <button onClick={fetchDatabaseInfo} className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 flex items-center space-x-1"><RefreshCw size={14}/> Refresh</button>
          <button onClick={downloadChat} className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 flex items-center space-x-1">Save</button>
          <button onClick={() => setDarkMode(!darkMode)} className="bg-gray-700 px-3 py-1 rounded">{darkMode ? <Sun size={16}/> : <Moon size={16}/>}</button>
        </div>
      </div>

      {/* PDF Select + Upload */}
      <div className="flex items-center space-x-2 p-2 border-b bg-white">
        <select 
          value={selectedPdf} 
          onChange={(e) => setSelectedPdf(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="">All PDFs</option>
          {availablePdfs.map(pdf => (
            <option key={pdf} value={pdf}>{pdf}</option>
          ))}
        </select>
        
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
        >
          Upload PDF
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-2xl shadow max-w-xl relative ${message.sender === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-900"}`}>
                <p>{message.text}</p>
                <p className="text-xs opacity-60 mt-1">{message.timestamp}</p>
                {message.sender === "bot" && (
                  <div className="absolute top-1 right-1 flex space-x-1">
                    <button onClick={() => copyMessage(message.text)} className="text-gray-400 hover:text-gray-600">
                      <Copy size={14}/>
                    </button>
                    {speakingMessageId === message.id ? (
                      <button onClick={stopSpeaking} className="text-red-500 hover:text-red-700">
                        <VolumeX size={14}/>
                      </button>
                    ) : (
                      <button onClick={() => speakText(message.text, message.id)} className="text-gray-400 hover:text-gray-600">
                        <Volume2 size={14}/>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl shadow max-w-xs">
              <div className="flex space-x-1 items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500 ml-2">Bot is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex space-x-2">
        <button type="button" onClick={startListening} className={`w-12 h-12 rounded-full flex items-center justify-center ${isListening ? "bg-red-500" : "bg-gray-300"}`}>
          <Mic size={20} className={isListening ? "text-white" : "text-gray-700"} />
        </button>
        <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Ask about drug information..." className="flex-1 px-4 py-2 border rounded-full"/>
        <button type="submit" className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center"><Send size={20}/></button>
      </form>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Upload PDF</h2>
            
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileUpload}
              className="mb-4"
            />
            
            {uploadStatus.id && (
              <div className="mb-2">
                <p>Processing: {uploadStatus.filename}</p>
                <p>Status: {uploadStatus.status}</p>
                {uploadStatus.progress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full">
                    <div 
                      className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" 
                      style={{ width: `${uploadStatus.progress}%` }}
                    >
                      {uploadStatus.progress}%
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={() => setShowUploadModal(false)}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
