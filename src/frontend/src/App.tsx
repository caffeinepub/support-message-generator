import { ChatWidget } from "@/components/ChatWidget";
import { Toaster } from "@/components/ui/sonner";
import {
  Bot,
  Clock,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const NAV_LINKS = ["Home", "Features", "Solutions", "Pricing"];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant AI Responses",
    desc: "Get answers to customer queries in milliseconds, not minutes. Our AI processes natural language to deliver accurate, helpful responses immediately.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    desc: "Never miss a customer query again. Our AI agent works around the clock, every day of the year, with zero downtime.",
  },
  {
    icon: Sparkles,
    title: "Smart Intent Detection",
    desc: "Automatically understands what customers are asking — from tracking orders to processing returns — with high accuracy.",
  },
  {
    icon: MessageCircle,
    title: "Multi-scenario Support",
    desc: "Handles 15+ customer scenarios including order tracking, refunds, complaints, shipping delays, and product queries out of the box.",
  },
];

const INTEGRATIONS = [
  { name: "Shopify", color: "#96bf48" },
  { name: "WooCommerce", color: "#7f54b3" },
  { name: "Eshopbox", color: "#1E88E5" },
  { name: "Razorpay", color: "#072654" },
];

export default function App() {
  const [activeNav, setActiveNav] = useState("Home");
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <DashboardView onBack={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster />

      {/* Announcement strip */}
      <div
        className="text-center py-2 text-xs font-medium text-white/90"
        style={{ background: "oklch(0.44 0.17 258)" }}
        data-ocid="landing.section"
      >
        🚀 AI Customer Support Agent — Instant AI-Powered Support
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 nav-bg" data-ocid="nav.panel">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.57 0.19 256)" }}
            >
              <Bot className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Support AI
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => setActiveNav(link)}
                data-ocid={`nav.${link.toLowerCase()}.link`}
                className={`text-sm font-medium transition-colors ${
                  activeNav === link
                    ? "text-white"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                {link}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="nav.login.button"
              className="text-sm text-white/80 hover:text-white font-medium transition-colors"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setShowDashboard(true)}
              data-ocid="nav.dashboard.button"
              className="text-sm font-medium px-4 py-1.5 rounded-full text-white transition-all hover:opacity-90"
              style={{ background: "oklch(0.57 0.19 256)" }}
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="hero-gradient py-20 lg:py-28"
        data-ocid="landing.hero.section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-6"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Customer Support
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                Elevate Your Support{" "}
                <span className="text-blue-200">with AI</span>
              </h1>

              <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-lg">
                Resolve customer queries instantly with intelligent AI — 24/7
                support, smart intent detection, and human-like responses for
                your store.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowDashboard(true)}
                  data-ocid="hero.primary_button"
                  className="px-6 py-3 rounded-lg font-semibold text-sm bg-white transition-all hover:bg-blue-50"
                  style={{ color: "oklch(0.44 0.17 258)" }}
                >
                  Get Started Free
                </button>
                <button
                  type="button"
                  data-ocid="hero.secondary_button"
                  className="px-6 py-3 rounded-lg font-semibold text-sm text-white border border-white/30 hover:bg-white/10 transition-all"
                >
                  Watch Demo
                </button>
              </div>

              <div className="mt-8 flex items-center gap-6">
                {[
                  { value: "15+", label: "Scenarios" },
                  { value: "<1s", label: "Response time" },
                  { value: "99.9%", label: "Uptime" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-white font-bold text-xl">{stat.value}</p>
                    <p className="text-blue-200 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Chat widget */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
              data-ocid="hero.card"
            >
              <ChatWidget />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white" data-ocid="features.section">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.57 0.19 256)" }}
            >
              Key Features
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for exceptional support
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Our AI agent handles the full customer support lifecycle so your
              team can focus on what matters most.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                  data-ocid={`features.item.${i + 1}`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "oklch(0.94 0.04 256)" }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: "oklch(0.57 0.19 256)" }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration & Trust */}
      <section
        className="py-20"
        style={{ background: "oklch(0.97 0.008 232)" }}
        data-ocid="integration.section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: integrations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
                Works with your stack
              </p>
              <div className="grid grid-cols-2 gap-4">
                {INTEGRATIONS.map((integration) => (
                  <div
                    key={integration.name}
                    className="bg-white rounded-xl p-5 flex items-center gap-3 shadow-sm border border-gray-100"
                    data-ocid="integration.card"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: integration.color }}
                    >
                      {integration.name[0]}
                    </div>
                    <span className="font-medium text-gray-800 text-sm">
                      {integration.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Globe
                    className="w-5 h-5"
                    style={{ color: "oklch(0.57 0.19 256)" }}
                  />
                  <span className="font-semibold text-gray-800">
                    REST API & Webhooks
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  Integrate with any platform using our simple REST API.
                  Real-time webhooks keep your systems in sync.
                </p>
              </div>
            </motion.div>

            {/* Right: trust blocks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "oklch(0.94 0.04 256)" }}
                  >
                    <LayoutDashboard
                      className="w-5 h-5"
                      style={{ color: "oklch(0.57 0.19 256)" }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Seamless Integration
                  </h3>
                </div>
                <p className="text-gray-500 leading-relaxed">
                  Connect to your existing eCommerce stack in minutes. No
                  complex setup — our AI learns your product catalog and support
                  policies automatically, delivering consistent answers every
                  time.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "oklch(0.94 0.04 256)" }}
                  >
                    <Shield
                      className="w-5 h-5"
                      style={{ color: "oklch(0.57 0.19 256)" }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Trustworthy & Reliable AI
                  </h3>
                </div>
                <p className="text-gray-500 leading-relaxed">
                  Built on the Internet Computer with decentralized
                  infrastructure. Your customer data is secure, private, and
                  never sold. 99.9% uptime SLA with automatic failover.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "50K+", label: "Queries handled" },
                  { value: "98%", label: "Satisfaction rate" },
                  { value: "3 min", label: "Avg setup time" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm"
                  >
                    <p
                      className="font-bold text-lg"
                      style={{ color: "oklch(0.57 0.19 256)" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="nav-bg py-12" data-ocid="footer.section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Logo col */}
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "oklch(0.57 0.19 256)" }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">Support AI</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                AI-powered customer support for modern eCommerce businesses.
              </p>
            </div>

            {/* Link columns */}
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Integrations", "Changelog"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                title: "Support",
                links: ["Documentation", "API Reference", "Status", "Contact"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-white font-semibold text-sm mb-4">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="/"
                        data-ocid="footer.link"
                        className="text-white/50 text-sm hover:text-white/80 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} Support AI. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/60 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
            <div className="flex items-center gap-3">
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="/"
                  data-ocid="footer.link"
                  className="text-white/40 text-xs hover:text-white/70 transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Dashboard View ─────────────────────────────────────────────────────────
import { CSAgentTab } from "@/components/CSAgentTab";
import { CourierAgentTab } from "@/components/CourierAgentTab";
import { EshopboxTab } from "@/components/EshopboxTab";
import { OrdersRequestTab } from "@/components/OrdersRequestTab";
import { ShopifyTab } from "@/components/ShopifyTab";
import {
  ArrowLeft,
  ClipboardList,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

const DASH_TABS = [
  { id: "shopify", label: "Shopify", icon: ShoppingBag },
  { id: "eshopbox", label: "Eshopbox", icon: Package },
  { id: "orders", label: "Orders Request", icon: ClipboardList },
  { id: "agent", label: "CS Agent", icon: Bot },
  { id: "courier", label: "Courier Expert", icon: Truck },
];

function DashboardView({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("agent");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />
      {/* Dashboard header */}
      <header
        className="nav-bg sticky top-0 z-10 border-b border-white/10"
        data-ocid="dashboard.panel"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            data-ocid="dashboard.back.button"
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.57 0.19 256)" }}
            >
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold">CS Message Pro</span>
          </div>
          <span className="ml-auto text-xs text-white/40 px-2 py-1 rounded-full border border-white/20">
            LamaStore
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 pt-2 overflow-x-auto">
            {DASH_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  data-ocid={`nav.${tab.id}.tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                    active
                      ? "border-primary text-primary bg-primary/10"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === "shopify" && <ShopifyTab />}
        {activeTab === "eshopbox" && <EshopboxTab />}
        {activeTab === "orders" && <OrdersRequestTab />}
        {activeTab === "agent" && <CSAgentTab />}
        {activeTab === "courier" && <CourierAgentTab />}
      </main>

      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
