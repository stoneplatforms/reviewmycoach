'use client';

import { useEffect, useMemo, useState } from 'react';
import { auth } from '../../../lib/firebase-client';

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt?: string;
  lastMessageSender?: string;
  unreadCount?: Record<string, number>;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  senderName?: string;
  message: string;
  createdAt?: string;
  read?: boolean;
}

export default function CoachMessagesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUserId(u.uid);
        await loadConversations(u.uid);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const unreadForMe = (c: Conversation) => (c.unreadCount?.[userId || ''] || 0);

  async function loadConversations(uid: string) {
    const res = await fetch(`/api/messages?userId=${encodeURIComponent(uid)}`);
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations || []);
    }
  }

  async function openConversation(c: Conversation) {
    setActive(c);
    const res = await fetch(`/api/messages?conversationId=${encodeURIComponent(c.id)}&limit=100`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
    if (userId) {
      // mark as read
      fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: c.id, userId, idToken: await auth.currentUser?.getIdToken() })
      });
    }
  }

  async function send() {
    if (!active || !text.trim() || !userId) return;
    setSending(true);
    try {
      // determine the other participant
      const recipientId = active.participants.find((p) => p !== userId)!;
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, message: text, conversationId: active.id, idToken })
      });
      if (res.ok) {
        const nowMsg: Message = {
          id: Math.random().toString(36).slice(2),
          senderId: userId,
          recipientId,
          message: text,
          createdAt: new Date().toISOString(),
          read: true
        };
        setMessages((m) => [...m, nowMsg]);
        setText('');
        await loadConversations(userId);
      }
    } finally {
      setSending(false);
    }
  }

  const rightPerson = useMemo(() => {
    if (!active || !userId) return '';
    return active.participants.find((p) => p !== userId) || '';
  }, [active, userId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-100">Messages</h1>
            <p className="text-sm text-neutral-400">Conversations with students and clients</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Channels */}
          <div className="md:col-span-1 border-r border-neutral-800">
            <div className="px-4 py-3 text-xs uppercase tracking-wide text-neutral-500">Conversations</div>
            <div className="divide-y divide-neutral-800 max-h-[70vh] overflow-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openConversation(c)}
                  className={`w-full text-left px-4 py-3 transition-colors ${active?.id === c.id ? 'bg-neutral-800' : 'hover:bg-neutral-800'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-neutral-100 text-sm truncate">{c.participants.filter((p) => p !== userId).join(', ') || 'Conversation'}</div>
                    {unreadForMe(c) > 0 && (
                      <span className="ml-2 text-xs bg-neutral-700 text-neutral-100 px-2 py-0.5 rounded-full">{unreadForMe(c)}</span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">{c.lastMessage}</div>
                </button>
              ))}
              {conversations.length === 0 && (
                <div className="p-6 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-dashed border-neutral-700 flex items-center justify-center text-neutral-400">💬</div>
                  <div className="text-sm text-neutral-500">No conversations yet</div>
                </div>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="md:col-span-2 flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-800 text-sm text-neutral-400">
              {active ? `Chat with ${rightPerson}` : 'Select a conversation'}
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2 bg-neutral-950/40">
              {active ? (
                messages.map((m) => (
                  <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded-2xl ${m.senderId === userId ? 'ml-auto bg-neutral-200 text-neutral-900' : 'bg-neutral-900/80 border border-neutral-800 text-neutral-200'}`}>
                    <div className="text-[10px] text-neutral-500 mb-1">{new Date(m.createdAt || '').toLocaleString()}</div>
                    <div className="text-sm leading-relaxed">{m.message}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-neutral-500">Choose a conversation to view messages.</div>
              )}
            </div>
            <div className="p-3 border-t border-neutral-800 flex items-center gap-2 bg-neutral-900/60">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-full text-neutral-100 placeholder-neutral-500"
              />
              <button onClick={send} disabled={!active || sending || !text.trim()} className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-full disabled:opacity-50">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


