import React, { useState, useEffect } from "react";
import ChatBot from "./componenets/chatbot";

const App = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      fetchChatHistory(userData.username);
    }
  }, []);

  const fetchChatHistory = async (username) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`http://localhost:5000/api/chat-history/${username}`);
      const data = await res.json();
      if (data.success) {
        setChatHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        fetchChatHistory(data.user.username);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setChatHistory([]);
  };

  const handleSaveChat = () => {
    // Refresh the chat history when a new message is saved
    if (user) {
      fetchChatHistory(user.username);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-lg rounded-xl p-6 w-80 space-y-4"
        >
          <h2 className="text-xl font-bold text-center text-blue-600">Login</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* History Sidebar */}
      {showHistory && (
        <div className="w-64 bg-gray-800 text-white p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Chat History</h2>
            <button 
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          {isLoadingHistory ? (
            <p className="text-gray-400">Loading history...</p>
          ) : chatHistory.length === 0 ? (
            <p className="text-gray-400">No chat history yet</p>
          ) : (
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <div key={chat.id} className="p-2 bg-gray-700 rounded">
                  <p className="text-sm font-semibold">
                    {chat.sender === "user" ? "You" : "Bot"}
                  </p>
                  <p className="text-xs">{chat.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(chat.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-blue-600 text-white p-4 flex justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-800"
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
            <span>Welcome, {user.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <ChatBot username={user.username} onSaveChat={handleSaveChat} />
      </div>
    </div>
  );
};

export default App;