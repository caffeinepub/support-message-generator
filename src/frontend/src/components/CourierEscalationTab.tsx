import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ISSUE_LABELS, type IssueType, STEPS } from "@/lib/escalationTemplates";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

const INPUT_STYLE = { backgroundColor: "#2a3142", color: "#e8eaf0" };

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-white/10 transition-colors text-white/60 hover:text-white"
      title="Copy message"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

export function CourierEscalationTab() {
  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [issue, setIssue] = useState<IssueType>("damaged-unit");
  const [messages, setMessages] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const step of STEPS) init[step.id] = "";
    return init;
  });

  function generateAll() {
    const next: Record<string, string> = {};
    for (const step of STEPS) {
      next[step.id] = step.defaultText(customerName, orderId, issue);
    }
    setMessages(next);
  }

  function generateStep(stepId: string) {
    const step = STEPS.find((s) => s.id === stepId);
    if (!step) return;
    setMessages((prev) => ({
      ...prev,
      [stepId]: step.defaultText(customerName, orderId, issue),
    }));
  }

  return (
    <div className="space-y-6" data-ocid="escalation.panel">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Courier Escalation System
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track the full conversation thread — from customer complaint to final
          resolution.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">
              Customer Name
            </Label>
            <Input
              placeholder="e.g. Rahul"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={INPUT_STYLE}
              data-ocid="escalation.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Order ID</Label>
            <Input
              placeholder="e.g. LS-123456"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={INPUT_STYLE}
              data-ocid="escalation.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Issue Type</Label>
            <Select
              value={issue}
              onValueChange={(v) => setIssue(v as IssueType)}
            >
              <SelectTrigger style={INPUT_STYLE} data-ocid="escalation.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ISSUE_LABELS) as [IssueType, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={generateAll}
          className="w-full sm:w-auto"
          data-ocid="escalation.primary_button"
        >
          Generate All Steps
        </Button>
      </div>

      {/* Thread */}
      <div className="relative">
        {/* Vertical connector */}
        <div className="absolute left-[26px] top-10 bottom-10 w-0.5 bg-border" />

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className="flex gap-4"
              data-ocid={`escalation.item.${i + 1}`}
            >
              {/* Step badge */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-[52px] h-[52px] rounded-full ${step.color} flex items-center justify-center z-10 shadow-md`}
                >
                  <span className="text-white font-bold text-sm">{i + 1}</span>
                </div>
                <span
                  className={`mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${step.color} text-white text-center leading-tight max-w-[56px]`}
                  style={{ fontSize: "9px" }}
                >
                  {step.sender.replace(" → ", "→")}
                </span>
              </div>

              {/* Card */}
              <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${step.color}`} />
                    <span className="text-sm font-semibold text-foreground">
                      {step.label}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      · {step.sender}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => generateStep(step.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                      title="Regenerate this step"
                      data-ocid={`escalation.secondary_button.${i + 1}`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Generate
                    </button>
                    <CopyButton text={messages[step.id]} />
                  </div>
                </div>
                <div className="p-3">
                  <Textarea
                    value={messages[step.id]}
                    onChange={(e) =>
                      setMessages((prev) => ({
                        ...prev,
                        [step.id]: e.target.value,
                      }))
                    }
                    placeholder={
                      step.id === "customer-message"
                        ? "Paste or type the customer's message here…"
                        : step.id === "customer-response"
                          ? "Paste or type the customer's follow-up here…"
                          : step.id === "courier-to-brand"
                            ? "Paste the courier team's reply here…"
                            : "Click Generate to fill this message…"
                    }
                    rows={5}
                    style={INPUT_STYLE}
                    className="text-sm resize-none"
                    data-ocid="escalation.textarea"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
