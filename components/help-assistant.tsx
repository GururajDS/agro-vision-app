"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MessageCircle, X, Send } from "lucide-react"

type TopicLink = { label: string; href: string }
type Topic = { id: string; keywords: string[]; answer: string; links?: TopicLink[]; chips?: string[] }
type Message = { from: "user" | "bot"; text: string; links?: TopicLink[]; chips?: string[] }

const START_CHIPS = [
  "Which crop should I grow?",
  "Where do I add expenses?",
  "How do I get weather alerts?",
  "What are N, P and K?",
]

const FALLBACK_CHIPS = [
  "Crop suggestion",
  "Fertilizer suggestion",
  "Weather alerts",
  "Add expenses",
  "Harvest estimate",
  "Market prices",
]

const ALL_PAGES: TopicLink[] = [
  { label: "Crop Suggestion", href: "/#crop" },
  { label: "Fertilizer Suggestion", href: "/#fertilizer" },
  { label: "Weather", href: "/#weather" },
  { label: "Commodity Prices", href: "/#prices" },
  { label: "My Field", href: "/my-field" },
  { label: "Expenditure Diary", href: "/expenditure" },
  { label: "Harvest Estimate", href: "/estimate" },
  { label: "Price Trends", href: "/price-trends" },
  { label: "Organic Fertilizers", href: "/organic-fertilizers" },
  { label: "Profile", href: "/profile" },
]

// Longer matching keywords count for more, so specific questions win over general ones.
const TOPICS: Topic[] = [
  {
    id: "greeting",
    keywords: [" hi ", " hello ", " hey ", " namaste ", "good morning", "good evening", "good afternoon"],
    answer: "Hello! Ask me where to find something or how a feature works.",
    chips: START_CHIPS,
  },
  {
    id: "thanks",
    keywords: [" thanks ", "thank you", " thankyou ", " thx "],
    answer: "You're welcome! Is there anything else I can help you find?",
  },
  {
    id: "help",
    keywords: ["help", "what can you do", "what is this", "features", "how to use", "guide", "menu", "pages"],
    answer:
      "I can point you to any page and explain how it works. Tap a page below, or ask something like “where do I add expenses?”",
    links: ALL_PAGES,
  },
  {
    id: "crop",
    keywords: [
      "crop suggestion",
      "which crop",
      "what crop",
      "what to grow",
      "suggest crop",
      "recommend crop",
      "best crop",
      "grow",
      "sow",
      "crop",
    ],
    answer:
      "Open Crop Suggestion, enter your soil values (N, P, K), temperature, humidity, pH and rainfall, then tap the button. When you see a crop you like, tap “Continue with this crop?” to save it. Your saved crop is then used in Fertilizer Suggestion and Harvest Estimate.",
    links: [{ label: "Crop Suggestion", href: "/#crop" }],
  },
  {
    id: "fertilizer",
    keywords: ["fertilizer", "fertiliser", " urea ", " dap ", "which fertilizer"],
    answer:
      "Open Fertilizer Suggestion, enter temperature, humidity, moisture, nitrogen, potassium, phosphorous, your soil type and crop, then tap Get Suggestion. If you saved a crop, it fills in for you. Under the result you will also see organic alternatives.",
    links: [
      { label: "Fertilizer Suggestion", href: "/#fertilizer" },
      { label: "Organic Fertilizers", href: "/organic-fertilizers" },
    ],
  },
  {
    id: "organic",
    keywords: [
      "organic",
      "natural fertilizer",
      "compost",
      "vermicompost",
      "jeevamrut",
      "panchagavya",
      "beejamrut",
      "manure",
      "neem",
      "bone meal",
      "wood ash",
      "biofertilizer",
      "chemical free",
      "chemical-free",
    ],
    answer:
      "The Organic Fertilizers page explains 12 natural options, such as compost, vermicompost, jeevamrut and panchagavya. Each one lists what you need, how to prepare it step by step, how much to use and a caution. You can filter by nutrient. Please confirm exact amounts with your local KVK.",
    links: [{ label: "Organic Fertilizers", href: "/organic-fertilizers" }],
  },
  {
    id: "weather",
    keywords: ["weather", "forecast", "will it rain", "rain today", "temperature today"],
    answer:
      "Open Weather and search for any place name to see the temperature, humidity and conditions there. For a daily weather message on your phone, ask me about weather alerts.",
    links: [{ label: "Weather", href: "/#weather" }],
  },
  {
    id: "notifications",
    keywords: ["weather alert", "weather notification", "notification", "alert", "notify", "remind", "push"],
    answer:
      "Go to My Field, make sure your location is saved, then tap “Enable weather notifications” and allow the permission when Chrome asks. You will then get a short weather message every morning at about 6 AM, with temperature, rain chance, wind and one simple tip. If nothing arrives, check that notifications are allowed for this site in Chrome's settings.",
    links: [{ label: "My Field", href: "/my-field" }],
  },
  {
    id: "prices",
    keywords: [
      "commodity",
      "market price",
      "market rate",
      "mandi",
      "price today",
      "rate today",
      "selling price",
      "prices",
      "price",
      "sell",
    ],
    answer:
      "Commodity Prices shows today's mandi (market) prices from government data, per quintal. To see how a price has moved over time, use Price Trends.",
    links: [
      { label: "Commodity Prices", href: "/#prices" },
      { label: "Price Trends", href: "/price-trends" },
    ],
  },
  {
    id: "trends",
    keywords: ["price trend", "trend", "price history", "price chart", "graph", "chart", "going up", "going down"],
    answer:
      "Price Trends draws a line chart for one commodity. Pick the commodity and a range of 7, 30 or 90 days. It opens on the commodity that matches your saved crop when possible. Each point is the average price across markets that day, so some day-to-day jumps are normal.",
    links: [{ label: "Price Trends", href: "/price-trends" }],
  },
  {
    id: "field",
    keywords: [
      "my field",
      "land area",
      "acre",
      "soil type",
      "field details",
      "detect location",
      "my location",
      "location",
      "gps",
      "edit field",
    ],
    answer:
      "My Field is where you save your land area (in acres), soil type and location. Tap “Detect my location” to fill in your place name from GPS. You can edit these any time. They are used for harvest estimates and weather alerts.",
    links: [{ label: "My Field", href: "/my-field" }],
  },
  {
    id: "estimate",
    keywords: [
      "harvest estimate",
      "estimate",
      "profit",
      "revenue",
      "yield",
      "income",
      "how much will i earn",
      "earn",
      "loss",
    ],
    answer:
      "Harvest Estimate shows the expected yield, market price, revenue, your total expenses and the profit for your saved crop and land area. It needs two things: a saved crop (from Crop Suggestion, “Continue with this crop?”) and your land area in My Field. If a card shows “—”, that information is not available yet, for example when your crop is not in today's price list.",
    links: [
      { label: "Harvest Estimate", href: "/estimate" },
      { label: "Crop Suggestion", href: "/#crop" },
      { label: "My Field", href: "/my-field" },
    ],
  },
  {
    id: "expenditure",
    keywords: [
      "expenditure",
      "expense",
      "expenses",
      "spend",
      "spent",
      "diary",
      "cost",
      "money",
      "labor",
      "labour",
    ],
    answer:
      "Use the Expenditure Diary to record what you spend. Pick a category (Seeds, Fertilizer, Labor, Irrigation, Equipment or Other), enter the amount and an optional note, then add it. The total feeds into your Harvest Estimate. You can delete an entry with the bin icon if you added it by mistake.",
    links: [{ label: "Expenditure Diary", href: "/expenditure" }],
  },
  {
    id: "npk",
    keywords: ["what is n p k", "n p k", "npk", "nitrogen", "phosphorus", "phosphorous", "potassium", "soil test", "soil health card", " ph ", "soil ph"],
    answer:
      "N, P and K are the three main plant nutrients. Nitrogen (N) helps leaves and green growth. Phosphorus (P) helps roots and flowering. Potassium (K) helps overall strength and disease resistance. To find your field's values, do a soil test at your nearest Krishi Vigyan Kendra (KVK) or a soil testing lab, or check your Soil Health Card if you have one. Enter the numbers in the same units the form shows.",
  },
  {
    id: "slow",
    keywords: ["not working", "error", "slow", "taking long", "couldn't get", "couldnt get", "loading", "stuck", "server", "failed", "wait"],
    answer:
      "The suggestion service runs on a free server that goes to sleep when nobody has used it for a while. The first request can take 30–60 seconds and may fail once while it wakes up. Wait a minute and tap the button again. If it keeps failing, check your internet connection and the values you entered.",
  },
  {
    id: "profile",
    keywords: ["profile", "my account", "account", "log out", "logout", "sign out", "signout"],
    answer:
      "Your Profile page shows your account, a summary of your field, crop and expenses. You can log out from there.",
    links: [{ label: "Profile", href: "/profile" }],
  },
  {
    id: "login",
    keywords: ["login", "log in", "sign in", "signin", "sign up", "signup", "password", "google", "gmail", "register", "create account"],
    answer:
      "You can log in with your Gmail account (Google) or with an email and password. If you are new, choose Sign up on the login page. A password reset is not available in the app yet.",
  },
  {
    id: "language",
    keywords: ["language", "kannada", "hindi", "translate", "english"],
    answer: "Kannada and Hindi are planned but not available yet. The app is in English for now.",
  },
]

function normalize(s: string) {
  return " " + s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim() + " "
}

function buildReply(question: string): Message {
  const q = normalize(question)
  let best: Topic | undefined
  let bestScore = 0
  for (const topic of TOPICS) {
    let score = 0
    for (const k of topic.keywords) {
      if (q.includes(k)) score += k.trim().length
    }
    if (score > bestScore) {
      best = topic
      bestScore = score
    }
  }
  if (!best) {
    return {
      from: "bot",
      text: "Sorry, I didn't understand that. I understand English questions about using Agro Vision. Try one of these:",
      chips: FALLBACK_CHIPS,
    }
  }
  return { from: "bot", text: best.answer, links: best.links, chips: best.chips }
}

export function HelpAssistant() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Hi! I'm the Agro Vision helper. Ask me where to find something or how a feature works.",
      chips: START_CHIPS,
    },
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  // Not shown on the login / sign-in pages.
  if (pathname.startsWith("/login") || pathname.startsWith("/auth")) return null

  function ask(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { from: "user", text: trimmed }, buildReply(trimmed)])
    setInput("")
  }

  function go(href: string) {
    setOpen(false)
    if (href.startsWith("/#")) {
      const tab = href.slice(2)
      if (pathname === "/") {
        window.dispatchEvent(new CustomEvent("agro-open-tab", { detail: tab }))
      } else {
        router.push(href)
      }
    } else {
      router.push(href)
    }
  }

  return (
    <>
      {open ? (
        <div className="fixed bottom-20 right-4 z-50 flex h-[70vh] max-h-[34rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <p className="font-heading text-base font-semibold">Agro Vision Helper</p>
            <button onClick={() => setOpen(false)} aria-label="Close helper" className="rounded-full p-1 hover:bg-white/15">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[85%]">
                  <div
                    className={
                      m.from === "user"
                        ? "rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                        : "rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-foreground"
                    }
                  >
                    {m.text}
                  </div>
                  {m.links && m.links.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <button
                          key={l.href + l.label}
                          onClick={() => go(l.href)}
                          className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                        >
                          {l.label} →
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {m.chips && m.chips.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.chips.map((c) => (
                        <button
                          key={c}
                          onClick={() => ask(c)}
                          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                ask(input)
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                className="min-w-0 flex-1 rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="submit"
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              I answer questions about using this app. For important farming decisions, please check with your local KVK.
            </p>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close helper" : "Open helper"}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  )
}
