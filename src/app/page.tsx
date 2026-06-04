"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function Home() {

  const [messages, setMessages] =
    useState<any[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const endRef = useRef<any>(null);//refernce to anything

  useEffect(() => {// Runs some code after updating messages
    endRef.current?.scrollIntoView({ // scroll to new dom element update
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(e: any) {

    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((m) => [
      ...m,
      userMessage,  // wont update immediately as state updates are async
    ]);

    setInput("");
    setLoading(true);

    try {

      const res = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            query: input,
            history: messages,
          }),
        }
      );

      const data =
        await res.json();

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.answer ||
            "No response",
        },
      ]);

    } catch {

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Something went wrong.",
        },
      ]);

    } finally {
      setLoading(false);
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6">

      <div className="w-full max-w-3xl bg-white dark:bg-[#0b0b0b] rounded-lg shadow p-6 flex flex-col">

        <h1 className="text-xl font-semibold mb-4">
          Local RAG Chat
        </h1>

        <div className="flex-1 overflow-auto space-y-4 mb-4 max-h-[60vh]">

          {messages.map((m, i) => ( // m and i are assumed to be array object and index

            <div
              key={i}

              className={`p-3 rounded-lg max-w-[90%] whitespace-pre-wrap ${
                m.role === "user"
                  ? "ml-auto bg-blue-500 text-white"
                  : "bg-zinc-100 dark:bg-[#111] dark:text-white"
              }`}
            >
              {m.content}
            </div>

          ))}

          <div ref={endRef} />

        </div>

        <form
          onSubmit={sendMessage}
          className="flex gap-2"
        >

          <input
            value={input}

            onChange={(e) =>
              setInput(e.target.value)
            }

            disabled={loading}

            placeholder={
              loading
                ? "Thinking..."
                : "Ask something..."
            }

            className="flex-1 border rounded px-3 py-2 bg-white dark:bg-black"
          />

          <button
            disabled={loading}

            className="px-4 rounded bg-black text-white"
          >
            Send
          </button>

        </form>

      </div>

    </div>
  );
}