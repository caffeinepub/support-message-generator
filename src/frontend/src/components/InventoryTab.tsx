import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type SearchResult =
  | { status: "not-found" }
  | { status: "out-of-stock" }
  | { status: "available"; units: number };

type UploadRow = { sku: string; units: number; error?: string };

const inputStyle = {
  background: "#1e2030",
  color: "#e8eaf0",
  WebkitTextFillColor: "#e8eaf0",
  border: "1px solid rgba(255,255,255,0.12)",
};

function parseCSV(text: string): UploadRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const rows: UploadRow[] = [];
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    if (i === 0) {
      // skip header row if first cell looks like a label
      const lower = parts[0].toLowerCase();
      if (lower === "sku" || lower === "sku code" || lower === "item") continue;
    }
    const sku = parts[0]?.toUpperCase();
    const unitsRaw = parts[1];
    if (!sku) continue;
    const units = Number.parseInt(unitsRaw ?? "", 10);
    if (!sku) {
      rows.push({ sku: "", units: 0, error: "Missing SKU" });
    } else if (Number.isNaN(units) || units < 0) {
      rows.push({ sku, units: 0, error: "Invalid units" });
    } else {
      rows.push({ sku, units });
    }
  }
  return rows;
}

export function InventoryTab() {
  const { actor, isFetching } = useActor();
  const [sku, setSku] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchedSku, setSearchedSku] = useState("");

  // Upload state
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inventory list
  const [inventoryList, setInventoryList] = useState<[string, number][]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchInventoryList = useCallback(async () => {
    if (!actor) return;
    setLoadingList(true);
    try {
      const all = await actor.getAllInventory();
      setInventoryList(
        all
          .map(([s, u]: [string, bigint]) => [s, Number(u)] as [string, number])
          .sort((a: [string, number], b: [string, number]) =>
            a[0].localeCompare(b[0]),
          ),
      );
    } finally {
      setLoadingList(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor && !isFetching) return;
    fetchInventoryList();
  }, [actor, isFetching, fetchInventoryList]);

  const handleSearch = async () => {
    const trimmed = sku.trim().toUpperCase();
    if (!trimmed || !actor) return;
    setSearching(true);
    setResult(null);
    setSearchedSku(trimmed);
    try {
      const res = await actor.checkInventory(trimmed);
      if (res === null || res === undefined) {
        setResult({ status: "not-found" });
      } else if (BigInt(res) === 0n) {
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

  const processFile = (file: File) => {
    setUploadError("");
    setUploadDone(false);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "txt") {
      setUploadError("Please upload a .csv or .txt file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setUploadError("No valid rows found. Check your file format.");
      } else {
        setUploadRows(rows);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleUpload = async () => {
    if (!actor || uploadRows.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const valid = uploadRows.filter((r) => !r.error);
      await Promise.all(
        valid.map((r) => actor.addInventoryItem(r.sku, BigInt(r.units))),
      );
      setUploadDone(true);
      setUploadRows([]);
      await fetchInventoryList();
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeRow = (idx: number) => {
    setUploadRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const validRows = uploadRows.filter((r) => !r.error);
  const errorRows = uploadRows.filter((r) => r.error);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search Card */}
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
                placeholder="Enter SKU (e.g. SKU-001)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                className="placeholder:text-[#4a4f68] border-0 focus-visible:ring-1 focus-visible:ring-[oklch(0.57_0.19_256)]"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!sku.trim() || searching || !actor}
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

          {result && (
            <Card
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
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className="text-xs uppercase tracking-widest"
                      style={{ color: "#8a8fa8" }}
                    >
                      Result for
                    </p>
                    <p className="text-white font-bold text-xl tracking-wide">
                      {searchedSku}
                    </p>
                    {result.status === "available" && (
                      <p className="text-sm mt-1" style={{ color: "#6ee7b7" }}>
                        {result.units} unit{result.units !== 1 ? "s" : ""} in
                        stock
                      </p>
                    )}
                    {result.status === "out-of-stock" && (
                      <p className="text-sm mt-1" style={{ color: "#fcd34d" }}>
                        0 units available
                      </p>
                    )}
                    {result.status === "not-found" && (
                      <p className="text-sm mt-1" style={{ color: "#fca5a5" }}>
                        SKU not found in inventory
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {result.status === "available" && (
                      <Badge
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
                        className="text-xs font-semibold px-3 py-1.5 border-0 flex items-center gap-1"
                        style={{
                          background: "rgba(239,68,68,0.2)",
                          color: "#fca5a5",
                        }}
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Not Found
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card
        className="border border-white/10"
        style={{ background: "#12131f" }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Upload
              className="w-5 h-5"
              style={{ color: "oklch(0.57 0.19 256)" }}
            />
            Upload SKU Inventory
          </CardTitle>
          <p className="text-sm" style={{ color: "#8a8fa8" }}>
            Upload a CSV file with two columns:{" "}
            <span style={{ color: "#a5b4fc" }}>SKU</span> and{" "}
            <span style={{ color: "#a5b4fc" }}>Units</span>. Example:{" "}
            <span style={{ color: "#6b7280" }}>SKU-010,50</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                fileInputRef.current?.click();
            }}
            className="cursor-pointer rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8 transition-colors"
            style={{
              borderColor: dragOver
                ? "oklch(0.57 0.19 256)"
                : "rgba(255,255,255,0.15)",
              background: dragOver
                ? "rgba(99,102,241,0.06)"
                : "rgba(255,255,255,0.02)",
            }}
          >
            <Upload
              className="w-7 h-7"
              style={{ color: dragOver ? "oklch(0.57 0.19 256)" : "#4a4f68" }}
            />
            <p className="text-sm" style={{ color: "#8a8fa8" }}>
              Drag & drop your CSV here, or{" "}
              <span style={{ color: "oklch(0.57 0.19 256)" }}>
                click to browse
              </span>
            </p>
            <p className="text-xs" style={{ color: "#4a4f68" }}>
              Supported: .csv, .txt
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Error */}
          {uploadError && (
            <div
              className="flex items-center gap-2 text-sm rounded-md px-3 py-2"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#fca5a5",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError}
            </div>
          )}

          {/* Success */}
          {uploadDone && (
            <div
              className="flex items-center gap-2 text-sm rounded-md px-3 py-2"
              style={{
                background: "rgba(16,185,129,0.1)",
                color: "#6ee7b7",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Inventory uploaded successfully!
            </div>
          )}

          {/* Preview table */}
          {uploadRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">
                  Preview — {validRows.length} valid row
                  {validRows.length !== 1 ? "s" : ""}
                  {errorRows.length > 0 && (
                    <span style={{ color: "#fca5a5" }}>
                      {" "}
                      · {errorRows.length} error
                      {errorRows.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadRows([]);
                    setUploadError("");
                  }}
                  className="text-xs h-7 px-2"
                  style={{ color: "#8a8fa8" }}
                >
                  Clear
                </Button>
              </div>
              <div
                className="rounded-md overflow-hidden border"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#1a1b2e" }}>
                      <th
                        className="text-left px-3 py-2 font-medium"
                        style={{ color: "#8a8fa8" }}
                      >
                        SKU
                      </th>
                      <th
                        className="text-left px-3 py-2 font-medium"
                        style={{ color: "#8a8fa8" }}
                      >
                        Units
                      </th>
                      <th
                        className="text-left px-3 py-2 font-medium"
                        style={{ color: "#8a8fa8" }}
                      >
                        Status
                      </th>
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {uploadRows.map((row, idx) => (
                      <tr
                        key={`${row.sku}-${idx}`}
                        style={{
                          background:
                            idx % 2 === 0
                              ? "rgba(255,255,255,0.01)"
                              : "transparent",
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <td
                          className="px-3 py-2 font-mono"
                          style={{ color: row.error ? "#fca5a5" : "#e8eaf0" }}
                        >
                          {row.sku || "—"}
                        </td>
                        <td
                          className="px-3 py-2"
                          style={{ color: row.error ? "#fca5a5" : "#a5b4fc" }}
                        >
                          {row.error ? "—" : row.units}
                        </td>
                        <td className="px-3 py-2">
                          {row.error ? (
                            <span
                              className="text-xs"
                              style={{ color: "#fca5a5" }}
                            >
                              ⚠ {row.error}
                            </span>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: "#6ee7b7" }}
                            >
                              ✓ OK
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="opacity-40 hover:opacity-80 transition-opacity"
                          >
                            <X
                              className="w-3.5 h-3.5"
                              style={{ color: "#fca5a5" }}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                onClick={handleUpload}
                disabled={validRows.length === 0 || uploading || !actor}
                className="w-full hover:opacity-90 transition-opacity"
                style={{ background: "oklch(0.57 0.19 256)", color: "#fff" }}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Upload{" "}
                    {validRows.length} SKU{validRows.length !== 1 ? "s" : ""} to
                    Inventory
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Inventory Table */}
      <Card
        className="border border-white/10"
        style={{ background: "#12131f" }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Package
                className="w-5 h-5"
                style={{ color: "oklch(0.57 0.19 256)" }}
              />
              Current Inventory
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchInventoryList}
              disabled={loadingList}
              className="text-xs h-7 px-2"
              style={{ color: "#8a8fa8" }}
            >
              {loadingList ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingList ? (
            <div
              className="flex items-center gap-2 text-sm py-4"
              style={{ color: "#8a8fa8" }}
            >
              <Loader2 className="w-4 h-4 animate-spin" /> Loading inventory...
            </div>
          ) : inventoryList.length === 0 ? (
            <p className="text-sm py-4" style={{ color: "#4a4f68" }}>
              No inventory data yet. Upload a CSV to get started.
            </p>
          ) : (
            <div
              className="rounded-md overflow-hidden border"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#1a1b2e" }}>
                    <th
                      className="text-left px-3 py-2 font-medium"
                      style={{ color: "#8a8fa8" }}
                    >
                      SKU
                    </th>
                    <th
                      className="text-left px-3 py-2 font-medium"
                      style={{ color: "#8a8fa8" }}
                    >
                      Units
                    </th>
                    <th
                      className="text-left px-3 py-2 font-medium"
                      style={{ color: "#8a8fa8" }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.map(([s, u], idx) => (
                    <tr
                      key={s}
                      style={{
                        background:
                          idx % 2 === 0
                            ? "rgba(255,255,255,0.01)"
                            : "transparent",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <td
                        className="px-3 py-2 font-mono"
                        style={{ color: "#e8eaf0" }}
                      >
                        {s}
                      </td>
                      <td className="px-3 py-2" style={{ color: "#a5b4fc" }}>
                        {u}
                      </td>
                      <td className="px-3 py-2">
                        {u === 0 ? (
                          <Badge
                            className="text-xs px-2 py-0.5 border-0"
                            style={{
                              background: "rgba(245,158,11,0.15)",
                              color: "#fcd34d",
                            }}
                          >
                            Out of Stock
                          </Badge>
                        ) : (
                          <Badge
                            className="text-xs px-2 py-0.5 border-0"
                            style={{
                              background: "rgba(16,185,129,0.15)",
                              color: "#6ee7b7",
                            }}
                          >
                            Available
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
