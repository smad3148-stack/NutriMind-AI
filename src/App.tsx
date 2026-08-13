import { useEffect, useState } from 'react';
import type { ChatMessage } from './types';

/**
 * Minimal but functional NutriMind AI frontend.
 *
 * Talks to the Express API exposed by `server.ts` (`/api/coach/chat`,
 * `/api/meals`). The full design language lives in `code.html`; this is the
 * React entry point that Vite bundles and that was previously missing from
 * the repository.
 */
export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [meals, setMeals] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/meals')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setMeals(data))
      .catch(() => {});
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).slice(2, 11),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setSending(true);
    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const reply = await res.json();
      setMessages((m) => [
        ...m,
        {
          id: 'msg_' + Math.random().toString(36).slice(2, 11),
          sender: 'assistant',
          text: reply.text || 'I am analyzing your core metabolic trends and biometrics.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: 'msg_' + Math.random().toString(36).slice(2, 11),
          sender: 'assistant',
          text: 'Coach is offline. Please try again shortly.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 gap-6">
      <header className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">NutriMind AI</h1>
        <p className="opacity-70 mt-1">Simple Outside. Infinite Intelligence Inside.</p>
      </header>

      <section className="glass-card p-5 w-full max-w-2xl">
        <h2 className="font-semibold mb-3">AI Health Coach</h2>
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="opacity-60 text-sm">Ask about meals, biometrics, or your nutrition goals.</p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`px-4 py-2 rounded-lg text-sm w-fit max-w-[85%] ${
                m.sender === 'user' ? 'self-end bg-emerald-500/20' : 'self-start bg-white/5'
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-emerald-400/50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Message your coach…"
          />
          <button
            className="rounded-lg bg-emerald-500 text-emerald-950 font-semibold px-4 py-2 disabled:opacity-50"
            onClick={send}
            disabled={sending}
          >
            {sending ? '…' : 'Send'}
          </button>
        </div>
      </section>

      <section className="glass-card p-5 w-full max-w-2xl">
        <h2 className="font-semibold mb-3">Recent Meals</h2>
        {meals.length === 0 ? (
          <p className="opacity-60 text-sm">No meals logged yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {meals.map((meal) => (
              <li key={meal.id} className="flex justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                <span>{meal.name}</span>
                <span className="opacity-70">{meal.calories} kcal</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
