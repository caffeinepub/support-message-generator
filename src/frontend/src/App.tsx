import { CSAgentTab } from "@/components/CSAgentTab";
import { EshopboxTab } from "@/components/EshopboxTab";
import { OrdersRequestTab } from "@/components/OrdersRequestTab";
import { ShopifyTab } from "@/components/ShopifyTab";
import { Toaster } from "@/components/ui/sonner";
import { Bot, ClipboardList, Package, ShoppingBag } from "lucide-react";
import { useState } from "react";

const MAIN_TABS = [
  { id: "shopify", label: "Shopify", icon: ShoppingBag },
  { id: "eshopbox", label: "Eshopbox", icon: Package },
  { id: "orders", label: "Orders Request", icon: ClipboardList },
  { id: "agent", label: "CS Agent", icon: Bot },
];

export default function App() {
  const [mainTab, setMainTab] = useState("shopify");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-none">
                CS Message Pro
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customer Support Generator
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-full border border-border">
            LamaStore
          </span>
        </div>
      </header>

      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 pt-2">
            {MAIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = mainTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  data-ocid={`nav.${tab.id}.tab`}
                  onClick={() => setMainTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
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
        {mainTab === "shopify" && <ShopifyTab />}
        {mainTab === "eshopbox" && <EshopboxTab />}
        {mainTab === "orders" && <OrdersRequestTab />}
        {mainTab === "agent" && <CSAgentTab />}
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

      <Toaster />
    </div>
  );
}
