
"use client";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: "⚡",
    title: "Instant Replies",
    desc: "Generate context-aware responses in under a second.",
  },
  {
    icon: "🧠",
    title: "Smart Context",
    desc: "Understands tone, intent, and conversation history.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    desc: "Your conversations never leave your device.",
  },
];

const steps = [
  { step: "01", label: "Paste your message" },
  { step: "02", label: "Pick a tone" },
  { step: "03", label: "Get your reply" },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-16 font-sans">

      {/* Hero */}
      <section className="flex flex-col items-center text-center max-w-xl mx-auto">
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
          AI-Powered Messaging
        </span>

        <h1 className="text-5xl font-semibold text-gray-800 leading-tight mb-4">
          Reply smarter,<br />
          <span className="text-black">not harder.</span>
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-sm">
          SmartReply crafts the perfect response to any message — professional,
          casual, or anything in between — in seconds.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-2.5 rounded-lg bg-black text-white text-sm font-medium
            hover:bg-gray-900 active:scale-[0.98] transition-all duration-200"
          >
            Get Started →
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white/70 backdrop-blur-lg
            text-gray-700 text-sm font-medium hover:border-gray-400 active:scale-[0.98] transition-all duration-200"
          >
            Log In
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="mt-20 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg shadow-md border border-gray-200
            hover:shadow-lg transition-shadow duration-200"
          >
            <span className="text-2xl mb-3 block">{icon}</span>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} SmartReply. All rights reserved.
      </footer>
    </main>
  );
}