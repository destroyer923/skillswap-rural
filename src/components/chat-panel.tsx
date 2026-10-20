"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  Search,
  ArrowLeft,
  UserRound,
  ExternalLink,
  Sparkles,
  CheckCheck,
  Clock,
} from "lucide-react";
import type { PublicUser } from "@/lib/data";

interface ConversationItem {
  id: number;
  participant1Id: number;
  participant2Id: number;
  listingId: number | null;
  collaborationId: number | null;
  lastMessage: string | null;
  lastMessageAt: Date | string;
  partner: {
    id: number;
    name: string;
    business: string;
    location: string;
    avatarUrl: string | null;
  };
  unreadCount: number;
}

interface MessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export default function ChatPanel({
  currentUser,
  initialConversations,
  initialActiveId = null,
  targetPartnerId = null,
  targetListingId = null,
  targetCollabId = null,
}: {
  currentUser: PublicUser;
  initialConversations: ConversationItem[];
  initialActiveId?: number | null;
  targetPartnerId?: number | null;
  targetListingId?: number | null;
  targetCollabId?: number | null;
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<number | null>(initialActiveId);
  const [activeData, setActiveData] = useState<{
    partner: any;
    contextItem: any;
    messages: MessageItem[];
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingActive, setLoadingActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // If targetPartnerId is passed and no active conversation matches, create or select it
  useEffect(() => {
    if (targetPartnerId) {
      const existing = conversations.find((c) => c.partner.id === targetPartnerId);
      if (existing) {
        setActiveConvId(existing.id);
      }
    } else if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    }
  }, [targetPartnerId, conversations]);

  // Fetch active conversation details
  const fetchActiveConversation = async (convId: number) => {
    try {
      const res = await fetch(`/api/messages/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveData(data);
        // Clear unread count in local state
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingActive(false);
    }
  };

  useEffect(() => {
    if (activeConvId) {
      setLoadingActive(true);
      fetchActiveConversation(activeConvId);
    }
  }, [activeConvId]);

  // Periodic polling for real-time messages & updates
  useEffect(() => {
    const interval = setInterval(async () => {
      // Refresh active messages
      if (activeConvId) {
        try {
          const res = await fetch(`/api/messages/${activeConvId}`);
          if (res.ok) {
            const data = await res.json();
            setActiveData((prev) => {
              if (!prev || prev.messages.length !== data.messages.length) {
                return data;
              }
              return prev;
            });
          }
        } catch {}
      }

      // Refresh conversation list
      try {
        const listRes = await fetch("/api/messages");
        if (listRes.ok) {
          const listData = await listRes.json();
          setConversations(listData.conversations);
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [activeData?.messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          partnerId: targetPartnerId,
          listingId: targetListingId,
          collabId: targetCollabId,
          text: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversationId && data.conversationId !== activeConvId) {
          setActiveConvId(data.conversationId);
        }
        if (activeConvId) {
          fetchActiveConversation(activeConvId);
        }
      }
    } catch (err) {
      console.error("Send error:", err);
      setInputText(textToSend); // preserve input on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partner.business?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-9.5rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
      {/* LEFT PANEL: Conversation List */}
      <div
        className={`w-full flex-col border-r border-slate-200/80 bg-white md:flex md:w-80 lg:w-96 ${
          activeConvId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Search header */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Conversations</h2>
            <span className="text-xs text-slate-400">{conversations.length} total</span>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or business..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Conversations items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <MessageCircle className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 font-semibold text-slate-700">No conversations found</p>
              <p className="mt-1 text-slate-400">
                Start a chat by clicking &ldquo;Message&rdquo; on any listing or member profile.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`flex w-full items-start gap-3 p-3.5 text-left transition ${
                    isSelected
                      ? "bg-emerald-50/70"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="relative">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                      {conv.partner.avatarUrl ? (
                        <img
                          src={conv.partner.avatarUrl}
                          alt={conv.partner.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        conv.partner.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {conv.partner.name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.lastMessageAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-slate-500">
                      {conv.partner.business || conv.partner.location}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-600">
                      {conv.lastMessage || "Started conversation"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Active Chat Screen */}
      <div
        className={`flex-1 flex-col bg-slate-50/50 ${
          activeConvId ? "flex" : "hidden md:flex"
        }`}
      >
        {activeConvId && activeData ? (
          <>
            {/* Chat Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
                  aria-label="Back to conversations list"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  {activeData.partner.avatarUrl ? (
                    <img
                      src={activeData.partner.avatarUrl}
                      alt={activeData.partner.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    activeData.partner.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeData.partner.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeData.partner.business} · {activeData.partner.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${activeData.partner.username || activeData.partner.id}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-800"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">View Profile</span>
                </Link>
              </div>
            </div>

            {/* Context Card (if discussing a listing or collaboration) */}
            {activeData.contextItem && (
              <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/70 px-4 py-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    Context
                  </span>
                  <span className="truncate text-slate-700 font-medium">
                    Discussing: &ldquo;{activeData.contextItem.title}&rdquo;
                  </span>
                </div>
                <Link
                  href={
                    activeData.contextItem.type === "listing"
                      ? `/listings/${activeData.contextItem.id}`
                      : `/collaborations`
                  }
                  className="shrink-0 text-xs font-semibold text-emerald-800 hover:underline"
                >
                  View &rarr;
                </Link>
              </div>
            )}

            {/* Message History Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {loadingActive ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Loading messages...
                </div>
              ) : activeData.messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">No messages yet</p>
                  <p className="mt-1 text-slate-400">
                    Send a greeting to propose a skill exchange or discuss collaboration!
                  </p>
                </div>
              ) : (
                activeData.messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? "bg-emerald-700 text-white"
                            : "bg-white text-slate-800 border border-slate-200/80"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                            isMe ? "text-emerald-200" : "text-slate-400"
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-200/80 bg-white p-3.5">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <textarea
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
                  className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-800">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Your Private Messages</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              Select an existing conversation on the left, or connect with a community member from Explore Skills to coordinate an exchange.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
