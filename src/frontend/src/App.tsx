import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowLeftRight,
  Clipboard,
  ClipboardCheck,
  CreditCard,
  Factory,
  FileX,
  MessageSquare,
  PackageCheck,
  RefreshCw,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useState } from "react";

type TabId =
  | "order-confirm"
  | "delivery-failed"
  | "damaged-unit"
  | "wrong-unit"
  | "under-production"
  | "return-cod"
  | "return-prepaid"
  | "abandoned-checkout"
  | "cancel-request";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "order-confirm",
    label: "Order Confirmation Not Received",
    icon: <PackageCheck size={18} />,
  },
  {
    id: "delivery-failed",
    label: "Delivery Failed",
    icon: <Truck size={18} />,
  },
  {
    id: "damaged-unit",
    label: "Damaged Unit Received",
    icon: <AlertTriangle size={18} />,
  },
  {
    id: "wrong-unit",
    label: "Wrong Unit Received",
    icon: <ArrowLeftRight size={18} />,
  },
  {
    id: "under-production",
    label: "Order Under Production",
    icon: <Factory size={18} />,
  },
  {
    id: "return-cod",
    label: "Return \u2013 COD",
    icon: <CreditCard size={18} />,
  },
  {
    id: "return-prepaid",
    label: "Return \u2013 Prepaid",
    icon: <RefreshCw size={18} />,
  },
  {
    id: "abandoned-checkout",
    label: "Abandoned Checkout",
    icon: <ShoppingCart size={18} />,
  },
  {
    id: "cancel-request",
    label: "Cancel Msg Request",
    icon: <FileX size={18} />,
  },
];

const SIGN_OFF = "Thank you!\nLamaStore Team";
const formatDate = (d: string) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${Number.parseInt(day)} ${months[Number.parseInt(m) - 1]},${y}`;
};

function FormField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={id}
        className={`text-xs font-medium uppercase tracking-wide ${
          disabled ? "text-muted-foreground/40" : "text-muted-foreground"
        }`}
      >
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        disabled={disabled}
        className={`rounded-lg border-border bg-card text-sm h-9 ${
          disabled ? "opacity-40 cursor-not-allowed" : ""
        }`}
        data-ocid={`${id}.input`}
      />
    </div>
  );
}

function TextareaField({
  label,
  id,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="rounded-lg border-border bg-card text-sm resize-none"
        rows={2}
        data-ocid={`${id}.textarea`}
      />
    </div>
  );
}

// ---- Tab Forms ----

function OrderConfirmTab() {
  const [fields, setFields] = useState({
    name: "",
    mobile: "",
    orderDate: "",
    orderId: "",
    itemName: "",
    storeName: "Lamastore Team",
  });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((p) => ({ ...p, [k]: v }));

  const generate = () => {
    const { name, mobile, orderDate, orderId, itemName } = fields;
    setMessage(
      `Dear ${name || "[Name]"},\n\nWe tried to reach you at ${mobile || "[Mobile]"} regarding your order.\n\nOrder Details:\n- Order ID: #${orderId || "[Order ID]"}\n- Order Date: ${orderDate || "[Order Date]"}\n- Item: ${itemName || "[Item Name]"}\n\nPlease call us back or reply to this message to confirm your delivery.\n\n${SIGN_OFF}`,
    );
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TabLayout
      fields={
        <>
          <FormField
            label="Customer Name"
            id="oc-name"
            value={fields.name}
            onChange={set("name")}
          />
          <FormField
            label="Mobile Number"
            id="oc-mobile"
            value={fields.mobile}
            onChange={set("mobile")}
          />
          <FormField
            label="Order Date"
            id="oc-date"
            type="date"
            value={fields.orderDate}
            onChange={set("orderDate")}
          />
          <FormField
            label="Order ID"
            id="oc-orderid"
            value={fields.orderId}
            onChange={set("orderId")}
          />
          <FormField
            label="Item Name"
            id="oc-item"
            value={fields.itemName}
            onChange={set("itemName")}
          />
          <FormField
            label="Store Name"
            id="oc-store"
            value={fields.storeName}
            onChange={set("storeName")}
            placeholder="e.g. Lamastore Team"
          />
        </>
      }
      message={message}
      onGenerate={generate}
      onCopy={copy}
      copied={copied}
    />
  );
}

function DeliveryFailedTab() {
  const [fields, setFields] = useState({
    name: "",
    mobile: "",
    orderDate: "",
    orderId: "",
    itemName: "",
    reminder1: "",
    reminder2: "",
    reminder3: "",
    remarks: "Consignment not available",
  });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((p) => ({ ...p, [k]: v }));

  const reminder1Filled = fields.reminder1.trim() !== "";

  const generate = () => {
    const {
      name,
      orderId,
      orderDate,
      itemName,
      reminder1,
      reminder2,
      reminder3,
      remarks,
    } = fields;
    if (reminder1Filled) {
      setMessage(
        `Dear ${name || "[Name]"},\n\nWe attempted to deliver your order (Order ID: #${orderId || "[Order ID]"}) placed on ${orderDate || "[Order Date]"}, for the "${itemName || "[Item Name]"}" to your address.\n\nOur delivery team made an attempt to reach you on ${formatDate(reminder1) || reminder1}; however, we were unable to complete the delivery.\nRemarks: ${remarks}.\n\nKindly contact us to reschedule your delivery at the earliest.\n\n${SIGN_OFF}`,
      );
    } else {
      setMessage(
        `Dear ${name || "[Name]"},\n\nWe attempted to deliver your order (Order ID: #${orderId || "[Order ID]"}) placed on ${orderDate || "[Order Date]"}, for the "${itemName || "[Item Name]"}" to your address.\n\nOur delivery team made three attempts to reach you on ${reminder1 || "[Reminder 1]"}, ${reminder2 || "[Reminder 2]"}, and ${reminder3 || "[Reminder 3]"}; however, we were unable to complete the delivery.\nRemarks: ${remarks}.\n\nKindly contact us to reschedule your delivery at the earliest.\n\n${SIGN_OFF}`,
      );
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TabLayout
      fields={
        <>
          <FormField
            label="Customer Name"
            id="df-name"
            value={fields.name}
            onChange={set("name")}
          />
          <FormField
            label="Mobile Number"
            id="df-mobile"
            value={fields.mobile}
            onChange={set("mobile")}
          />
          <FormField
            label="Order Date"
            id="df-date"
            type="date"
            value={fields.orderDate}
            onChange={set("orderDate")}
          />
          <FormField
            label="Order ID"
            id="df-orderid"
            value={fields.orderId}
            onChange={set("orderId")}
          />
          <FormField
            label="Item Name"
            id="df-item"
            value={fields.itemName}
            onChange={set("itemName")}
          />
          <FormField
            label="Reminder 1 (Date)"
            id="df-r1"
            type="date"
            value={fields.reminder1}
            onChange={set("reminder1")}
          />
          <FormField
            label="Reminder 2 (Date)"
            id="df-r2"
            type="date"
            value={fields.reminder2}
            onChange={(v) => !reminder1Filled && set("reminder2")(v)}
            disabled={reminder1Filled}
          />
          <FormField
            label="Reminder 3 (Date)"
            id="df-r3"
            type="date"
            value={fields.reminder3}
            onChange={(v) => !reminder1Filled && set("reminder3")(v)}
            disabled={reminder1Filled}
          />
          <TextareaField
            label="Remarks"
            id="df-remarks"
            value={fields.remarks}
            onChange={set("remarks")}
          />
        </>
      }
      message={message}
      onGenerate={generate}
      onCopy={copy}
      copied={copied}
    />
  );
}

function DamagedUnitTab() {
  const [fields, setFields] = useState({ name: "", orderId: "", itemName: "" });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((p) => ({ ...p, [k]: v }));

  const generate = () => {
    const { name, orderId, itemName } = fields;
    setMessage(
      `Dear ${name || "[Name]"},

We sincerely apologize for the inconvenience caused. We understand that you have received a damaged unit for Order ID: ${orderId || "[Order ID]"} (${itemName || "[Item Name]"}).

We take full responsibility for this issue and would like to resolve it as quickly as possible. Kindly share clear photos of the damaged product along with your order details so we can process a replacement or refund at the earliest.

We assure you this will be handled with top priority.

Thank you!
Team LamaStore`,
    );
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TabLayout
      fields={
        <>
          <FormField
            label="Customer Name"
            id="du-name"
            value={fields.name}
            onChange={set("name")}
          />
          <FormField
            label="Order ID"
            id="du-orderid"
            value={fields.orderId}
            onChange={set("orderId")}
          />
          <FormField
            label="Item Name"
            id="du-item"
            value={fields.itemName}
            onChange={set("itemName")}
          />
        </>
      }
      message={message}
      onGenerate={generate}
      onCopy={copy}
      copied={copied}
    />
  );
}

function WrongUnitTab() {
  const [fields, setFields] = useState({
    name: "",
    orderId: "",
    itemReceived: "",
    itemOrdered: "",
  });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((p) => ({ ...p, [k]: v }));

  const generate = () => {
    const { name, orderId, itemReceived, itemOrdered } = fields;
    setMessage(
      `Dear ${name || "[Name]"},\n\nWe sincerely apologize for the inconvenience caused. We understand that you have received an incorrect item for Order ID: #${orderId || "[Order ID]"}. You received ${itemReceived || "[Item Received]"} instead of ${itemOrdered || "[Item Ordered]"} you ordered.\n\nWe take full responsibility for this error and have initiated the return and replacement process for you. Our team will arrange a reverse pickup of the wrong item at the earliest convenience.\n\nThank you for your patience and understanding.\n\nBest regards,\nTeam LamaStore`,
    );
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TabLayout
      fields={
        <>
          <FormField
            label="Customer Name"
            id="wu-name"
            value={fields.name}
            onChange={set("name")}
          />
          <FormField
            label="Order ID"
            id="wu-orderid"
            value={fields.orderId}
            onChange={set("orderId")}
          />
          <FormField
            label="Item Name Received"
            id="wu-received"
            value={fields.itemReceived}
            onChange={set("itemReceived")}
          />
          <FormField
            label="Item Name Ordered"
            id="wu-ordered"
            value={fields.itemOrdered}
            onChange={set("itemOrdered")}
          />
        </>
      }
      message={message}
      onGenerate={generate}
      onCopy={copy}
      copied={copied}
    />
  );
}

function UnderProductionTab() {
  const [fields, setFields] = useState({ name: "", orderId: "", itemName: "" });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((p) => ({ ...p, [k]: v }));

  const generate = () => {
    const { name, orderId, itemName } = fields;
    setMessage(
      `Dear ${name || "[Name]"},\n\nThank you for your patience! We wanted to provide an update regarding your Order ID: #${orderId || "[Order ID]"} for the "${itemName || "[Item Name]"}" item.\n\nYour order is currently under production, and our team is working diligently to ensure it meets our quality standards. It will be dispatched soon, and you will receive a tracking update once it is shipped.\n\nWe appreciate your continued support and patience.\n\n${SIGN_OFF}`,
    );
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TabLayout
      fields={
        <>
          <FormField
            label="Customer Name"
            id="up-name"
            value={fields.name}
            onChange={set("name")}
          />
          <FormField
            label="Order ID"
            id="up-orderid"
            value={fields.orderId}
            onChange={set("orderId")}
          />
          <FormField
            label="Item Name"
            id="up-item"
            value={fields.itemName}
            onChange={set("itemName")}
          />
        </>
      }
      message={message}
      onGenerate={generate}
      onCopy={copy}
      copied={copied}
    />
  );
}

function ReturnCODTab() {
  const [fields, setFields] = useState({
    name: "",
    orderId: "",
    pickupDate: "",
    refundAmount: "",
    itemsToPickup: "",
  });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((p) => ({ ...p, [k]: v }));

  const generate = () => {
    const { name, orderId, pickupDate, refundAmount, itemsToPickup } = fields;
    const itemLines = itemsToPickup
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const noteSection =
      itemLines.length > 0
        ? `\n\nNote:\n\nItem to pickup:\n${itemLines.map((item, i) => `${i + 1}.${item}`).join("\n")}`
        : "";
    setMessage(
      `Dear ${name || "[Name]"},\n\nWe have booked a reverse pickup for Order ID: #${orderId || "[Order ID]"}, scheduled to be picked up on ${formatDate(pickupDate) || "[Pickup Date]"}.\n\nOnce the return pickup is delivered to our warehouse, we will initiate your refund amount to your bank account within 5-7 working days from the date of dispatch.\n\nKindly confirm your bank details for the refund:\n\nAccount Holder Name:\nBank Name:\nAccount Number:\nIFSC Code:\nNote: The refunded amount for the order will be Rs. ${refundAmount || "[Refund Amount]"}.${noteSection}\n\n${SIGN_OFF}`,
    );
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TabLayout
      fields={
        <>
          <FormField
            label="Customer Name"
            id="rc-name"
            value={fields.name}
            onChange={set("name")}
          />
          <FormField
            label="Order ID"
            id="rc-orderid"
            value={fields.orderId}
            onChange={set("orderId")}
          />
          <FormField
            label="Pickup Date"
            id="rc-pickup"
            type="date"
            value={fields.pickupDate}
            onChange={set("pickupDate")}
          />
          <FormField
            label="Refund Amount (Rs.)"
            id="rc-refund"
            value={fields.refundAmount}
            onChange={set("refundAmount")}
            placeholder="e.g. 3897"
          />
          <TextareaField
            label="Items to Pickup (one per line)"
            id="rc-items"
            value={fields.itemsToPickup}
            onChange={set("itemsToPickup")}
            placeholder={"e.g. Blue Tee\nYellow Tee"}
          />
        </>
      }
      message={message}
      onGenerate={generate}
      onCopy={copy}
      copied={copied}
    />
  );
}

function ReturnPrepaidTab() {
  const [fields, setFields] = useState({
    name: "",
    orderId: "",
    pickupDate: "",
    itemsToPickup: "",
  });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((p) => ({ ...p, [k]: v }));

  const generate = () => {
    const { name, orderId, pickupDate, itemsToPickup } = fields;
    const itemLines = itemsToPickup
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const noteSection =
      itemLines.length > 0
        ? `\n\nNote:\n\nItem to pickup:\n${itemLines.map((item, i) => `${i + 1}.${item}`).join("\n")}`
        : "";
    setMessage(
      `Dear ${name || "[Name]"},\n\nWe have booked a reverse pickup for Order ID: #${orderId || "[Order ID]"}, scheduled to be picked up on ${formatDate(pickupDate) || "[Pickup Date]"}\n\nOnce the return pickup is delivered to our warehouse, we will initiate your refund amount to your source account within 5-7 working days from the date of dispatch.${noteSection}\n\n${SIGN_OFF}`,
    );
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TabLayout
      fields={
        <>
          <FormField
            label="Customer Name"
            id="rp-name"
            value={fields.name}
            onChange={set("name")}
          />
          <FormField
            label="Order ID"
            id="rp-orderid"
            value={fields.orderId}
            onChange={set("orderId")}
          />
          <FormField
            label="Pickup Date"
            id="rp-pickup"
            type="date"
            value={fields.pickupDate}
            onChange={set("pickupDate")}
          />
          <TextareaField
            label="Items to Pickup (one per line)"
            id="rp-items"
            value={fields.itemsToPickup}
            onChange={set("itemsToPickup")}
            placeholder={"e.g. Blue Tee\nYellow Tee"}
          />
        </>
      }
      message={message}
      onGenerate={generate}
      onCopy={copy}
      copied={copied}
    />
  );
}

function AbandonedCheckoutTab() {
  const [fields, setFields] = useState({
    name: "",
    itemName: "ABC",
    discountPercent: "15",
    promoCode: "WINTER15",
    productCategory: "oversized T-shirt",
  });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((p) => ({ ...p, [k]: v }));

  const generate = () => {
    const { name, itemName, discountPercent, promoCode, productCategory } =
      fields;
    setMessage(
      `Hi ${name || "[Name]"},\n\nWe noticed that you were trying to place an order for ${itemName || "[Item Name]"}. We wanted to let you know that we are currently offering a ${discountPercent || "[Discount]"}% discount on ${productCategory || "[Product Category]"}!\n\nSimply apply code ${promoCode || "[Promo Code]"} at the time of checkout to avail of this offer.\n\nIf you need any assistance or would like us to place the order on your behalf, feel free to reach out to us \u2014 we would be happy to help! Don't miss out on this great deal.\n\nThank you!\nTeam LamaStore`,
    );
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TabLayout
      fields={
        <>
          <FormField
            label="Customer Name"
            id="ac-name"
            value={fields.name}
            onChange={set("name")}
            placeholder="e.g. Rahul"
          />
          <FormField
            label="Item Name"
            id="ac-item"
            value={fields.itemName}
            onChange={set("itemName")}
            placeholder="e.g. ABC"
          />
          <FormField
            label="Product Category"
            id="ac-category"
            value={fields.productCategory}
            onChange={set("productCategory")}
            placeholder="e.g. oversized T-shirt"
          />
          <FormField
            label="Discount %"
            id="ac-discount"
            value={fields.discountPercent}
            onChange={set("discountPercent")}
            placeholder="e.g. 15"
          />
          <FormField
            label="Promo Code"
            id="ac-promo"
            value={fields.promoCode}
            onChange={set("promoCode")}
            placeholder="e.g. WINTER15"
          />
        </>
      }
      message={message}
      onGenerate={generate}
      onCopy={copy}
      copied={copied}
    />
  );
}

function TypeToggle({
  value,
  onChange,
  prefix,
}: {
  value: "cod" | "prepaid";
  onChange: (v: "cod" | "prepaid") => void;
  prefix: string;
}) {
  return (
    <div className="flex gap-2 mb-2">
      <button
        type="button"
        onClick={() => onChange("cod")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
          value === "cod"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-muted-foreground border-border hover:bg-muted/50"
        }`}
        data-ocid={`${prefix}-cod.toggle`}
      >
        COD
      </button>
      <button
        type="button"
        onClick={() => onChange("prepaid")}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
          value === "prepaid"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-muted-foreground border-border hover:bg-muted/50"
        }`}
        data-ocid={`${prefix}-prepaid.toggle`}
      >
        Prepaid
      </button>
    </div>
  );
}

function CancelRequestTab() {
  const [cancelType, setCancelType] = useState<"cod" | "prepaid">("cod");
  const [codFields, setCodFields] = useState({
    name: "",
    orderId: "",
    itemName: "",
  });
  const [prepaidFields, setPrepaidFields] = useState({
    name: "",
    orderId: "",
    itemName: "",
    refundAmount: "",
  });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const setCod = (k: keyof typeof codFields) => (v: string) =>
    setCodFields((p) => ({ ...p, [k]: v }));
  const setPrepaid = (k: keyof typeof prepaidFields) => (v: string) =>
    setPrepaidFields((p) => ({ ...p, [k]: v }));

  const generate = () => {
    if (cancelType === "cod") {
      const { name, orderId, itemName } = codFields;
      setMessage(
        `Dear ${name || "[Name]"},\n\nWe have received your cancellation request for Order ID: #${orderId || "[Order ID]"} for the "${itemName || "[Item Name]"}" item.\n\nWe are currently processing your request. Since this is a Cash on Delivery order, no refund will be initiated. You will receive a confirmation message on your registered mobile number once the cancellation is successfully completed.\n\nThank you!\nTeam LamaStore`,
      );
    } else {
      const { name, orderId, itemName, refundAmount } = prepaidFields;
      setMessage(
        `Dear ${name || "[Name]"},\n\nWe have received your cancellation request for Order ID: #${orderId || "[Order ID]"} for "${itemName || "[Item Name]"}".\n\nWe are currently processing your request and will confirm the cancellation shortly. Once confirmed, your refund of Rs. ${refundAmount || "[Refund Amount]"} will be credited to your source account within 5-7 working days.\n\nWe will notify you once the cancellation is confirmed.\n\n${SIGN_OFF}`,
      );
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TabLayout
      fields={
        <>
          <TypeToggle
            value={cancelType}
            onChange={(v) => {
              setCancelType(v);
              setMessage("");
            }}
            prefix="cr"
          />
          {cancelType === "cod" ? (
            <>
              <FormField
                label="Customer Name"
                id="cr-cod-name"
                value={codFields.name}
                onChange={setCod("name")}
              />
              <FormField
                label="Order ID"
                id="cr-cod-orderid"
                value={codFields.orderId}
                onChange={setCod("orderId")}
              />
              <FormField
                label="Item Name"
                id="cr-cod-item"
                value={codFields.itemName}
                onChange={setCod("itemName")}
              />
            </>
          ) : (
            <>
              <FormField
                label="Customer Name"
                id="cr-pre-name"
                value={prepaidFields.name}
                onChange={setPrepaid("name")}
              />
              <FormField
                label="Order ID"
                id="cr-pre-orderid"
                value={prepaidFields.orderId}
                onChange={setPrepaid("orderId")}
              />
              <FormField
                label="Item Name"
                id="cr-pre-item"
                value={prepaidFields.itemName}
                onChange={setPrepaid("itemName")}
              />
              <FormField
                label="Refund Amount (Rs.)"
                id="cr-pre-refund"
                value={prepaidFields.refundAmount}
                onChange={setPrepaid("refundAmount")}
                placeholder="e.g. 1299"
              />
            </>
          )}
        </>
      }
      message={message}
      onGenerate={generate}
      onCopy={copy}
      copied={copied}
    />
  );
}

// ---- Shared Layout ----

function TabLayout({
  fields,
  message,
  onGenerate,
  onCopy,
  copied,
}: {
  fields: React.ReactNode;
  message: string;
  onGenerate: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg shadow-card flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            1. Input Customer Details
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in the fields below to generate the message.
          </p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4 flex-1">{fields}</div>
        <div className="px-5 pb-5">
          <Button
            onClick={onGenerate}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg"
            data-ocid="generate.primary_button"
          >
            Generate Message
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-card flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            2. Message Preview
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your generated message will appear here.
          </p>
        </div>
        <div className="px-5 py-4 flex-1" data-ocid="preview.panel">
          {message ? (
            <div className="bg-preview-bubble rounded-lg p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {message}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center h-40 text-center gap-3"
              data-ocid="preview.empty_state"
            >
              <MessageSquare size={32} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Fill in the form and click &ldquo;Generate Message&rdquo; to
                preview the message here.
              </p>
            </div>
          )}
        </div>
        <div className="px-5 pb-5">
          <Button
            variant="outline"
            onClick={onCopy}
            disabled={!message}
            className="w-full border-primary text-primary hover:bg-accent font-medium rounded-lg"
            data-ocid="copy.secondary_button"
          >
            {copied ? (
              <>
                <ClipboardCheck size={15} className="mr-2" /> Copied!
              </>
            ) : (
              <>
                <Clipboard size={15} className="mr-2" /> Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Tab Content Map ----

const TAB_COMPONENTS: Record<TabId, React.ReactNode> = {
  "order-confirm": <OrderConfirmTab />,
  "delivery-failed": <DeliveryFailedTab />,
  "damaged-unit": <DamagedUnitTab />,
  "wrong-unit": <WrongUnitTab />,
  "under-production": <UnderProductionTab />,
  "return-cod": <ReturnCODTab />,
  "return-prepaid": <ReturnPrepaidTab />,
  "abandoned-checkout": <AbandonedCheckoutTab />,
  "cancel-request": <CancelRequestTab />,
};

// ---- App ----

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("order-confirm");
  const activeTabInfo = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header
        className="bg-card border-b border-border shadow-xs sticky top-0 z-50"
        data-ocid="header.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-tight select-none">
            CS
          </div>
          <span className="font-semibold text-foreground text-sm tracking-tight">
            CS Message Pro
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-foreground">
            {activeTabInfo.label}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customer Support Message Generator
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-xs mb-6 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "flex flex-col items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors relative whitespace-nowrap",
                    isActive
                      ? "text-primary border-b-2 border-primary bg-accent/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-b-2 border-transparent",
                  ].join(" ")}
                  data-ocid={`${tab.id}.tab`}
                >
                  <span
                    className={
                      isActive ? "text-primary" : "text-muted-foreground"
                    }
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div key={activeTab}>{TAB_COMPONENTS[activeTab]}</div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        \u00a9 {new Date().getFullYear()}. Built with \u2764\ufe0f using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
