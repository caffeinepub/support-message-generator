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
  COURIER_SCENARIO_LABELS,
  type CourierScenarioId,
  detectCourierScenario,
  generateCourierMessage,
} from "@/lib/courierTemplates";
import { Search, Truck } from "lucide-react";
import { useState } from "react";

const ALL_COURIER_SCENARIOS: CourierScenarioId[] = [
  "package-delayed",
  "package-lost",
  "out-for-delivery",
  "wrong-address",
  "delivery-rescheduled",
  "customs-hold",
  "rto-initiated",
  "rto-delivered",
  "ndr-customer-unreachable",
  "ndr-address-issue",
  "shipment-damaged-in-transit",
  "delivery-confirmation",
  "fake-delivery",
  "partial-delivery",
  "shipment-out-of-coverage",
];

export function CourierAgentTab() {
  const [input, setInput] = useState("");
  const [detectedScenario, setDetectedScenario] =
    useState<CourierScenarioId | null>(null);
  const [manualScenario, setManualScenario] = useState<CourierScenarioId | "">(
    "",
  );
  const [isManual, setIsManual] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const activeScenario: CourierScenarioId | null = isManual
    ? (manualScenario as CourierScenarioId) || null
    : detectedScenario;

  const setValue = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));
  const get = (k: string, def = "") => values[k] ?? def;

  const handleDetect = () => {
    const scenario = detectCourierScenario(input);
    setDetectedScenario(scenario);
    setIsManual(false);
    setMessage("");
    setValues({});
  };

  const handleManualChange = (v: string) => {
    setManualScenario(v as CourierScenarioId);
    setIsManual(true);
    setMessage("");
    setValues({});
  };

  const handleGenerate = () => {
    if (!activeScenario) return;
    const msg = generateCourierMessage(activeScenario, values);
    setMessage(msg);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Input & Form */}
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Courier Issue</h2>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="courierMsg"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Paste customer message or describe the courier issue
            </Label>
            <Textarea
              id="courierMsg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. My order is showing delivered but I never received it..."
              className="min-h-[120px] text-sm text-foreground bg-input/50 resize-none"
              data-ocid="courier.customer_msg.textarea"
            />
          </div>

          <Button
            onClick={handleDetect}
            variant="outline"
            className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10"
            data-ocid="courier.detect.primary_button"
          >
            <Search className="w-4 h-4" />
            Detect Courier Issue
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            {detectedScenario && !isManual && (
              <Badge className="bg-success/20 text-success border border-success/30 text-xs">
                ✓ {COURIER_SCENARIO_LABELS[detectedScenario]} detected
              </Badge>
            )}
            {isManual && manualScenario && (
              <Badge className="bg-warning/20 text-warning border border-warning/30 text-xs">
                ⚙ Manual:{" "}
                {COURIER_SCENARIO_LABELS[manualScenario as CourierScenarioId]}
              </Badge>
            )}
            {!detectedScenario && !isManual && (
              <span className="text-xs text-muted-foreground">
                No issue detected yet
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Manual Override
            </Label>
            <Select value={manualScenario} onValueChange={handleManualChange}>
              <SelectTrigger
                className="text-sm bg-input/50"
                data-ocid="courier.scenario.select"
              >
                <SelectValue placeholder="Select courier scenario manually..." />
              </SelectTrigger>
              <SelectContent>
                {ALL_COURIER_SCENARIOS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {COURIER_SCENARIO_LABELS[s]}
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
              {COURIER_SCENARIO_LABELS[activeScenario]} — Fill Details
            </h3>
            <CourierScenarioFields
              scenario={activeScenario}
              get={get}
              setValue={setValue}
            />
            <Button
              onClick={handleGenerate}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="courier.generate.primary_button"
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
          <MessageOutput message={message} ocidScope="courier" />
        ) : (
          <div
            className="flex flex-col items-center justify-center min-h-[300px] text-center"
            data-ocid="courier.msg.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Truck className="w-7 h-7 text-primary/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Courier expert responses
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Paste a customer courier issue, detect the scenario, fill details,
              and generate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CourierCommonFields({
  get,
  setValue,
}: {
  get: (k: string, def?: string) => string;
  setValue: (k: string, v: string) => void;
}) {
  return (
    <>
      <FormField
        label="Customer Name"
        id="c-name"
        value={get("name")}
        onChange={(v) => setValue("name", v)}
        placeholder="Customer name"
      />
      <FormField
        label="Order ID"
        id="c-orderId"
        value={get("orderId")}
        onChange={(v) => setValue("orderId", v)}
        placeholder="#12345"
      />
      <FormField
        label="AWB / Tracking Number"
        id="c-awb"
        value={get("awb")}
        onChange={(v) => setValue("awb", v)}
        placeholder="AWB number"
      />
      <FormField
        label="Courier Partner"
        id="c-courier"
        value={get("courier")}
        onChange={(v) => setValue("courier", v)}
        placeholder="e.g. Delhivery, BlueDart"
      />
    </>
  );
}

function CourierScenarioFields({
  scenario,
  get,
  setValue,
}: {
  scenario: CourierScenarioId;
  get: (k: string, def?: string) => string;
  setValue: (k: string, v: string) => void;
}) {
  switch (scenario) {
    case "package-delayed":
      return (
        <>
          <CourierCommonFields get={get} setValue={setValue} />
          <DatePickerField
            label="Expected Delivery Date"
            id="c-expectedDate"
            value={get("expectedDate")}
            onChange={(v) => setValue("expectedDate", v)}
          />
        </>
      );

    case "out-for-delivery":
      return (
        <>
          <FormField
            label="Customer Name"
            id="c-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="Customer name"
          />
          <FormField
            label="Order ID"
            id="c-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="#12345"
          />
          <FormField
            label="Item Name"
            id="c-itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
            placeholder="Item name"
          />
        </>
      );

    case "wrong-address":
      return (
        <>
          <CourierCommonFields get={get} setValue={setValue} />
          <FormField
            label="Correct / Recorded Address"
            id="c-correctAddress"
            value={get("correctAddress")}
            onChange={(v) => setValue("correctAddress", v)}
            placeholder="Address on record"
            multiline
          />
        </>
      );

    case "delivery-rescheduled":
      return (
        <>
          <CourierCommonFields get={get} setValue={setValue} />
          <DatePickerField
            label="Rescheduled Date"
            id="c-rescheduleDate"
            value={get("rescheduleDate")}
            onChange={(v) => setValue("rescheduleDate", v)}
          />
        </>
      );

    case "rto-initiated":
      return (
        <>
          <CourierCommonFields get={get} setValue={setValue} />
          <FormField
            label="RTO Reason"
            id="c-rtoReason"
            value={get("rtoReason")}
            onChange={(v) => setValue("rtoReason", v)}
            placeholder="e.g. Customer refused delivery"
          />
        </>
      );

    case "delivery-confirmation":
      return (
        <>
          <FormField
            label="Customer Name"
            id="c-name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="Customer name"
          />
          <FormField
            label="Order ID"
            id="c-orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="#12345"
          />
          <FormField
            label="Item Name"
            id="c-itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
            placeholder="Item name"
          />
        </>
      );

    case "partial-delivery":
      return (
        <>
          <CourierCommonFields get={get} setValue={setValue} />
          <FormField
            label="Missing Items (one per line)"
            id="c-missingItems"
            value={get("missingItems")}
            onChange={(v) => setValue("missingItems", v)}
            placeholder="Item 1\nItem 2"
            multiline
          />
        </>
      );

    default:
      return <CourierCommonFields get={get} setValue={setValue} />;
  }
}
