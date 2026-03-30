import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import { AlertCircle, Loader2, Package, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SEED_ITEMS: [string, number][] = [
  ["SKU-001", 45],
  ["SKU-002", 12],
  ["SKU-003", 0],
  ["SKU-004", 88],
  ["SKU-005", 3],
  ["SKU-006", 0],
  ["SKU-007", 200],
  ["SKU-008", 27],
];

type SearchResult =
  | { status: "not-found" }
  | { status: "out-of-stock" }
  | { status: "available"; units: number };

const inputStyle = {
  background: "#1e2030",
  color: "#e8eaf0",
  WebkitTextFillColor: "#e8eaf0",
  border: "1px solid rgba(255,255,255,0.12)",
};

export function InventoryTab() {
  const { actor, isFetching } = useActor();
  const [sku, setSku] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchedSku, setSearchedSku] = useState("");
  const [seeded, setSeeded] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const seedingRef = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || seedingRef.current) return;
    seedingRef.current = true;
    setSeeding(true);
    actor
      .getAllInventory()
      .then(async (existing) => {
        if (existing.length === 0) {
          await Promise.all(
            SEED_ITEMS.map(([s, u]) => actor.addInventoryItem(s, BigInt(u))),
          );
        }
        setSeeded(true);
      })
      .catch(() => setSeeded(true))
      .finally(() => setSeeding(false));
  }, [actor, isFetching]);

  const handleSearch = async () => {
    const trimmed = sku.trim().toUpperCase();
    if (!trimmed || !actor) return;
    setSearching(true);
    setResult(null);
    setSearchedSku(trimmed);
    try {
      const res = await actor.checkInventory(trimmed);
      if (res === null) {
        setResult({ status: "not-found" });
      } else if (res === BigInt(0) || res === 0n) {
        setResult({ status: "out-of-stock" });
      } else {
        setResult({ status: "available", units: Number(res) });
      }
    } catch {
      setResult({ status: "not-found" });
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card
        className="border border-white/10"
        style={{ background: "#12131f" }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Package
              className="w-5 h-5"
              style={{ color: "oklch(0.57 0.19 256)" }}
            />
            Inventory Lookup
          </CardTitle>
          <p className="text-sm" style={{ color: "#8a8fa8" }}>
            Enter a SKU to check availability and stock units.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#8a8fa8" }}
              />
              <Input
                data-ocid="inventory.search_input"
                placeholder="Enter SKU (e.g. SKU-001)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                className="placeholder:text-[#4a4f68] border-0 focus-visible:ring-1 focus-visible:ring-[oklch(0.57_0.19_256)]"
              />
            </div>
            <Button
              data-ocid="inventory.primary_button"
              onClick={handleSearch}
              disabled={!sku.trim() || searching || !actor || seeding}
              style={{ background: "oklch(0.57 0.19 256)", color: "#fff" }}
              className="hover:opacity-90 transition-opacity"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {seeding && (
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "#8a8fa8" }}
              data-ocid="inventory.loading_state"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Initializing inventory data...
            </div>
          )}

          {seeded && !seeding && (
            <p className="text-xs" style={{ color: "#6b7280" }}>
              💡 Try: <span style={{ color: "#a5b4fc" }}>SKU-001</span>,{" "}
              <span style={{ color: "#a5b4fc" }}>SKU-002</span>,{" "}
              <span style={{ color: "#a5b4fc" }}>SKU-007</span> — or any SKU
              from SKU-001 to SKU-008
            </p>
          )}
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card
          data-ocid="inventory.panel"
          className="border"
          style={{
            background:
              result.status === "available"
                ? "rgba(16, 185, 129, 0.06)"
                : result.status === "out-of-stock"
                  ? "rgba(245, 158, 11, 0.06)"
                  : "rgba(239, 68, 68, 0.06)",
            borderColor:
              result.status === "available"
                ? "rgba(16, 185, 129, 0.3)"
                : result.status === "out-of-stock"
                  ? "rgba(245, 158, 11, 0.3)"
                  : "rgba(239, 68, 68, 0.3)",
          }}
        >
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: "#8a8fa8" }}
                >
                  Result for
                </p>
                <p className="text-white font-bold text-xl tracking-wide">
                  {searchedSku}
                </p>

                {result.status === "available" && (
                  <p className="text-sm mt-2" style={{ color: "#6ee7b7" }}>
                    {result.units} unit{result.units !== 1 ? "s" : ""} in stock
                  </p>
                )}
                {result.status === "out-of-stock" && (
                  <p className="text-sm mt-2" style={{ color: "#fcd34d" }}>
                    0 units available
                  </p>
                )}
                {result.status === "not-found" && (
                  <p className="text-sm mt-2" style={{ color: "#fca5a5" }}>
                    SKU not found in inventory
                  </p>
                )}
              </div>

              <div className="shrink-0">
                {result.status === "available" && (
                  <Badge
                    data-ocid="inventory.success_state"
                    className="text-xs font-semibold px-3 py-1.5 border-0"
                    style={{
                      background: "rgba(16,185,129,0.2)",
                      color: "#6ee7b7",
                    }}
                  >
                    ✓ Available
                  </Badge>
                )}
                {result.status === "out-of-stock" && (
                  <Badge
                    data-ocid="inventory.error_state"
                    className="text-xs font-semibold px-3 py-1.5 border-0"
                    style={{
                      background: "rgba(245,158,11,0.2)",
                      color: "#fcd34d",
                    }}
                  >
                    ⚠ Out of Stock
                  </Badge>
                )}
                {result.status === "not-found" && (
                  <Badge
                    data-ocid="inventory.error_state"
                    className="text-xs font-semibold px-3 py-1.5 border-0 flex items-center gap-1"
                    style={{
                      background: "rgba(239,68,68,0.2)",
                      color: "#fca5a5",
                    }}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Not Available
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
