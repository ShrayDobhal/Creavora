"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Phone, Video, Search, Volume2, Mic, Paperclip, Loader2 } from "lucide-react";
import { Card } from "@/ui/Bits.jsx";
import { Avatar } from "@/ui/Media.jsx";

const mockContacts = [
  { id: "1", name: "Arjun Singh", handle: "arjun", lastMessage: "Awesome update, thanks!", unread: 1 },
  { id: "2", name: "Pooja Singh", handle: "poojasingh", lastMessage: "Collab proposal sent.", unread: 0 },
  { id: "3", name: "Dev Kumar", handle: "devkumar", lastMessage: "When is the next stream?", unread: 0 }
];

export default function StudioMessagesPage() {
  const [contacts, setContacts] = useState(mockContacts);
  const [activeContact, setActiveContact] = useState(mockContacts[0]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);

  useEffect(() => {
    if (!activeContact) return;
    setLoadingMsg(true);
    fetch(`/api/messages?active=${activeContact.name}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setLoadingMsg(false);
      })
      .catch((err) => {
        console.error("Error loading chat messages:", err);
        setLoadingMsg(false);
      });
  }, [activeContact]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const payload = {
      receiverName: activeContact.name,
      content: inputText
    };

    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((msg) => {
        setMessages((prev) => [...prev, msg]);
        setInputText("");
      })
      .catch((err) => console.error("Send message error:", err));
  };

  return (
    <div className="flex h-[calc(100vh-76px)] overflow-hidden">
      {/* Contact List */}
      <aside className="w-[300px] border-r border-line bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-line">
          <h2 className="text-[17px] font-bold">Chat Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                activeContact.id === contact.id ? "bg-brand-50" : "hover:bg-canvas"
              }`}
            >
              <Avatar name={contact.name} size={40} />
              <div className="min-w-0 flex-1 leading-snug">
                <h4 className="text-[13.5px] font-bold truncate">{contact.name}</h4>
                <p className="text-[11.5px] text-muted truncate mt-0.5">{contact.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col bg-canvas justify-between">
        {/* Header */}
        <header className="h-[64px] border-b border-line bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={activeContact.name} size={38} />
            <div>
              <h3 className="text-[14.5px] font-bold">{activeContact.name}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold">Online</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingMsg ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-brand-600" size={24} />
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                    msg.mine
                      ? "bg-brand-600 text-white rounded-tr-none"
                      : "bg-white text-ink rounded-tl-none border border-line"
                  }`}
                >
                  {msg.lines?.[0] || msg.content}
                  <span
                    className={`block text-[10px] text-right mt-1 ${
                      msg.mine ? "text-white/60" : "text-muted"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-line bg-white flex items-center gap-3 shrink-0">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeContact.name}...`}
            className="flex-1 h-11 border border-line rounded-full px-5 text-[13.5px] outline-none focus:border-brand-400 bg-canvas focus:bg-white"
          />
          <button
            type="submit"
            className="h-11 w-11 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-sm"
          >
            <Send size={16} />
          </button>
        </form>
      </main>
    </div>
  );
}
