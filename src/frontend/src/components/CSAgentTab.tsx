import { DatePickerField } from "@/components/DatePickerField";
import { FormField } from "@/components/FormField";
import { MessageOutput } from "@/components/MessageOutput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  SCENARIO_LABELS,
  type ScenarioId,
  detectScenario,
  generateMessage,
} from "@/lib/messageTemplates";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";

const ALL_SCENARIOS: ScenarioId[] = [
  "order-confirmation",
  "abandoned-checkout",
  "delivery-failed",
  "damaged-unit",
  "wrong-unit",
  "return-cod",
  "return-prepaid",
  "order-cancellation",
  "estimate-delivery",
  "unfulfilled",
  "cancelled",
  "urgent-delivery",
  "under-production",
  "bad-quality",
  "price-too-high",
  "what-material",
  "tee-length",
  "size-variants",
  "discount-available",
  "refund-policy",
  "return-process",
  "cod-refund-process",
  "prepaid-refund-process",
];

export function CSAgentTab() {
  const [input, setInput] = useState("");
  const [detectedScenario, setDetectedScenario] = useState<ScenarioId | null>(
    null,
  );
  const [manualScenario, setManualScenario] = useState<ScenarioId | "">(
    "" as ScenarioId | "",
  );
  const [isManual, setIsManual] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const activeScenario: ScenarioId | null = isManual
    ? (manualScenario as ScenarioId) || null
    : detectedScenario;

  const setValue = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));
  const get = (k: string, def = "") => values[k] ?? def;

  const handleDetect = () => {
    const scenario = detectScenario(input);
    setDetectedScenario(scenario);
    setIsManual(false);
    setMessage("");
    setValues({});
  };

  const handleManualChange = (v: string) => {
    setManualScenario(v as ScenarioId);
    setIsManual(true);
    setMessage("");
    setValues({});
  };

  const handleGenerate = () => {
    if (!activeScenario) return;
    const msg = generateMessage(activeScenario, values);
    setMessage(msg);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Input & Form */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Customer Message</h2>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="customerMsg"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Paste customer message or describe the issue
            </Label>
            <Textarea
              id="customerMsg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Hi, I want to return my order, I paid online..."
              className="min-h-[120px] text-sm text-foreground bg-input/50 resize-none"
              data-ocid="agent.customer_msg.textarea"
            />
          </div>

          <Button
            onClick={handleDetect}
            variant="outline"
            className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10"
            data-ocid="agent.detect.primary_button"
          >
            <Search className="w-4 h-4" />
            Detect Scenario
          </Button>

          {/* Detection Result */}
          <div className="flex items-center gap-2 flex-wrap">
            {detectedScenario && !isManual && (
              <Badge className="bg-success/20 text-success border border-success/30 text-xs">
                ✓ {SCENARIO_LABELS[detectedScenario]} detected
              </Badge>
            )}
            {isManual && manualScenario && (
              <Badge className="bg-warning/20 text-warning border border-warning/30 text-xs">
                ⚙ Manual: {SCENARIO_LABELS[manualScenario as ScenarioId]}
              </Badge>
            )}
            {!detectedScenario && !isManual && (
              <span className="text-xs text-muted-foreground">
                No scenario detected yet
              </span>
            )}
          </div>

          {/* Manual Override */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Manual Override
            </Label>
            <Select value={manualScenario} onValueChange={handleManualChange}>
              <SelectTrigger
                className="text-sm bg-input/50"
                data-ocid="agent.scenario.select"
              >
                <SelectValue placeholder="Select scenario manually..." />
              </SelectTrigger>
              <SelectContent>
                {ALL_SCENARIOS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SCENARIO_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dynamic Form */}
        {activeScenario && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {SCENARIO_LABELS[activeScenario]} — Fill Details
            </h3>
            <AgentScenarioFields
              scenario={activeScenario}
              get={get}
              setValue={setValue}
            />
            <Button
              onClick={handleGenerate}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="agent.generate.primary_button"
            >
              Generate Message
            </Button>
          </div>
        )}
      </div>

      {/* Right: Output */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-sm font-semibold">Generated Response</h2>
        </div>
        {message ? (
          <MessageOutput message={message} ocidScope="agent" />
        ) : (
          <div
            className="flex flex-col items-center justify-center min-h-[300px] text-center"
            data-ocid="agent.msg.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-primary/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Smart message generation
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Paste a customer message, detect the scenario, fill details, and
              generate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentScenarioFields({
  scenario,
  get,
  setValue,
}: {
  scenario: ScenarioId;
  get: (k: string, def?: string) => string;
  setValue: (k: string, v: string) => void;
}) {
  switch (scenario) {
    case "order-confirmation":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="Customer name"
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="#12345"
          />
          <DatePickerField
            label="Order Date"
            id="a-orderDate"
            value={get("orderDate")}
            onChange={(v) => setValue("orderDate", v)}
          />
        </>
      );
    case "abandoned-checkout":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="Customer name"
          />
          <FormField
            label="Item"
            id="a-item"
            value={get("item", "ABC")}
            onChange={(v) => setValue("item", v)}
          />
          <FormField
            label="Discount"
            id="a-discount"
            value={get("discount", "15%")}
            onChange={(v) => setValue("discount", v)}
          />
          <FormField
            label="Promo Code"
            id="a-promo"
            value={get("promoCode", "WINTER15")}
            onChange={(v) => setValue("promoCode", v)}
          />
          <FormField
            label="Category"
            id="a-category"
            value={get("category", "oversized T-shirt")}
            onChange={(v) => setValue("category", v)}
          />
        </>
      );
    case "delivery-failed":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="Customer name"
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <DatePickerField
            label="Order Date"
            id="a-orderDate"
            value={get("orderDate")}
            onChange={(v) => setValue("orderDate", v)}
          />
          <FormField
            label="Item Name"
            id="a-itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
          />
          <DatePickerField
            label="Attempt 1 Date"
            id="a-a1d"
            value={get("attempt1Date")}
            onChange={(v) => setValue("attempt1Date", v)}
          />
          <FormField
            label="Attempt 1 Remarks"
            id="a-a1r"
            value={get("attempt1Remarks")}
            onChange={(v) => setValue("attempt1Remarks", v)}
          />
        </>
      );
    case "damaged-unit":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <FormField
            label="Item Name"
            id="a-itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
          />
        </>
      );
    case "wrong-unit":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <FormField
            label="Received Item"
            id="a-recvItem"
            value={get("receivedItem")}
            onChange={(v) => setValue("receivedItem", v)}
          />
          <FormField
            label="Ordered Item"
            id="a-ordItem"
            value={get("orderedItem")}
            onChange={(v) => setValue("orderedItem", v)}
          />
        </>
      );
    case "return-cod":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <DatePickerField
            label="Pickup Date"
            id="a-pickup"
            value={get("pickupDate")}
            onChange={(v) => setValue("pickupDate", v)}
          />
          <FormField
            label="Refund Amount"
            id="a-refund"
            value={get("refundAmount")}
            onChange={(v) => setValue("refundAmount", v)}
          />
          <FormField
            label="Items to Pickup"
            id="a-items"
            value={get("itemsToPickup")}
            onChange={(v) => setValue("itemsToPickup", v)}
            multiline
          />
        </>
      );
    case "return-prepaid":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <DatePickerField
            label="Pickup Date"
            id="a-pickup"
            value={get("pickupDate")}
            onChange={(v) => setValue("pickupDate", v)}
          />
          <FormField
            label="Items to Pickup"
            id="a-items"
            value={get("itemsToPickup")}
            onChange={(v) => setValue("itemsToPickup", v)}
            multiline
          />
        </>
      );
    case "order-cancellation":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <FormField
            label="Item Name"
            id="a-itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
          />
        </>
      );
    case "estimate-delivery":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <DatePickerField
            label="Estimated Delivery Date"
            id="a-delDate"
            value={get("deliveryDate")}
            onChange={(v) => setValue("deliveryDate", v)}
          />
        </>
      );
    case "unfulfilled":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <FormField
            label="Item Name"
            id="a-itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
          />
        </>
      );
    case "cancelled":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <FormField
            label="Item Name"
            id="a-itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
          />
          <FormField
            label="Reason"
            id="a-reason"
            value={get("reason")}
            onChange={(v) => setValue("reason", v)}
          />
        </>
      );
    case "urgent-delivery":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <DatePickerField
            label="Requested Delivery Date"
            id="a-reqDate"
            value={get("requestedDate")}
            onChange={(v) => setValue("requestedDate", v)}
          />
        </>
      );
    case "under-production":
      return (
        <>
          <FormField
            label="Customer Name"
            id="a-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
          />
          <FormField
            label="Order ID"
            id="a-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
          />
          <FormField
            label="Item Name"
            id="a-itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
          />
          <DatePickerField
            label="Expected Completion Date"
            id="a-compDate"
            value={get("completionDate")}
            onChange={(v) => setValue("completionDate", v)}
          />
        </>
      );
    case "bad-quality":
    case "price-too-high":
    case "what-material":
    case "tee-length":
    case "size-variants":
    case "discount-available":
    case "refund-policy":
    case "return-process":
    case "cod-refund-process":
    case "prepaid-refund-process":
      return (
        <FormField
          label="Customer Name"
          id="a-name"
          value={get("name")}
          onChange={(v) => setValue("name", v)}
          placeholder="Customer name"
        />
      );
    default:
      return null;
  }
}
