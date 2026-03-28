export type IssueType =
  | "damaged-unit"
  | "wrong-unit"
  | "lost-package"
  | "delayed-delivery"
  | "refund-request";

export const ISSUE_LABELS: Record<IssueType, string> = {
  "damaged-unit": "Damaged Unit Received",
  "wrong-unit": "Wrong Unit Received",
  "lost-package": "Lost / Missing Package",
  "delayed-delivery": "Delayed Delivery",
  "refund-request": "Refund Request",
};

export type StepId =
  | "customer-message"
  | "brand-to-customer"
  | "brand-to-courier"
  | "courier-to-brand"
  | "customer-response"
  | "brand-final";

export interface Step {
  id: StepId;
  label: string;
  sender: string;
  color: string;
  editable: boolean;
  defaultText: (name: string, orderId: string, issue: IssueType) => string;
}

const templates: Record<IssueType, Record<StepId, string>> = {
  "damaged-unit": {
    "customer-message": "",
    "brand-to-customer":
      "Dear {name},\n\nWe have escalated the case with our courier team. Kindly allow us 24-48 hours to investigate and revert back to you.\n\nThank you!\nTeam LamaStore",
    "brand-to-courier":
      "Hi Team,\n\nWe are writing to escalate a case for Order ID: {orderId}. The customer has received a damaged unit. Request you to investigate and share your findings.\n\nPlease provide:\n1. Delivery photos\n2. Proof of dispatch\n\nRegards,\nTeam LamaStore",
    "courier-to-brand":
      "Kindly provide wrong unit photos, shipping label and order ID for further investigation.",
    "customer-response": "I don't want the unit anymore. I want a refund.",
    "brand-final":
      "Dear {name},\n\nWe completely understand your concern and sincerely apologize for the inconvenience. We are processing a full refund for Order ID: {orderId} to your source account. The refund will reflect within 5-7 working days.\n\nThank you!\nTeam LamaStore",
  },
  "wrong-unit": {
    "customer-message": "",
    "brand-to-customer":
      "Dear {name},\n\nWe have escalated the case with our courier team regarding the wrong unit delivered for Order ID: {orderId}. Kindly allow us 24-48 hours to investigate and revert back to you.\n\nThank you!\nTeam LamaStore",
    "brand-to-courier":
      "Hi Team,\n\nCustomer has received a wrong unit for Order ID: {orderId}. Request you to investigate and arrange a reverse pickup at the earliest.\n\nPlease provide:\n1. Delivery photos\n2. Shipping label details\n\nRegards,\nTeam LamaStore",
    "courier-to-brand":
      "Kindly provide photos of the wrong unit received, shipping label and order ID for further investigation.",
    "customer-response":
      "I don't want this item. Please arrange a pickup and refund me.",
    "brand-final":
      "Dear {name},\n\nWe sincerely apologize for sending the wrong unit for Order ID: {orderId}. We are arranging a reverse pickup and will process a full refund to your source account within 5-7 working days once the item is received.\n\nThank you!\nTeam LamaStore",
  },
  "lost-package": {
    "customer-message": "",
    "brand-to-customer":
      "Dear {name},\n\nWe have escalated your case with our courier team regarding Order ID: {orderId}. Kindly allow us 24-48 hours to trace the shipment and update you.\n\nThank you!\nTeam LamaStore",
    "brand-to-courier":
      "Hi Team,\n\nOrder ID: {orderId} is reported as lost/missing by the customer. Request immediate investigation and tracing of the shipment.\n\nRegards,\nTeam LamaStore",
    "courier-to-brand":
      "The shipment for Order ID: {orderId} is currently under investigation. We will provide an update within 48 hours.",
    "customer-response": "It's been too long. I want a refund please.",
    "brand-final":
      "Dear {name},\n\nWe sincerely apologize for the inconvenience. As the shipment for Order ID: {orderId} could not be located, we are processing a full refund to your source account. The refund will reflect within 5-7 working days.\n\nThank you!\nTeam LamaStore",
  },
  "delayed-delivery": {
    "customer-message": "",
    "brand-to-customer":
      "Dear {name},\n\nWe apologize for the delay in delivery of Order ID: {orderId}. We have escalated this with our courier team and expect your order to be delivered within the next 24-48 hours.\n\nThank you!\nTeam LamaStore",
    "brand-to-courier":
      "Hi Team,\n\nOrder ID: {orderId} is significantly delayed. Request immediate update on current status and expected delivery date.\n\nRegards,\nTeam LamaStore",
    "courier-to-brand":
      "The shipment is in transit. Expected delivery within 1-2 business days due to [reason]. We apologize for the inconvenience.",
    "customer-response":
      "This is taking too long. I want to cancel and get a refund.",
    "brand-final":
      "Dear {name},\n\nWe understand your frustration and sincerely apologize for the delay. We have initiated a cancellation for Order ID: {orderId} and your refund will be processed to your source account within 5-7 working days.\n\nThank you!\nTeam LamaStore",
  },
  "refund-request": {
    "customer-message": "",
    "brand-to-customer":
      "Dear {name},\n\nThank you for reaching out. We have received your refund request for Order ID: {orderId} and are processing it on priority. Kindly allow us 24-48 hours.\n\nThank you!\nTeam LamaStore",
    "brand-to-courier":
      "Hi Team,\n\nCustomer has requested a refund for Order ID: {orderId}. Please confirm the delivery status and share proof of delivery.\n\nRegards,\nTeam LamaStore",
    "courier-to-brand":
      "Delivery was confirmed on [date]. Kindly provide the order details and customer complaint for further review.",
    "customer-response": "Please process my refund as soon as possible.",
    "brand-final":
      "Dear {name},\n\nWe are pleased to confirm that your refund for Order ID: {orderId} has been initiated to your source account. The amount will reflect within 5-7 working days.\n\nThank you!\nTeam LamaStore",
  },
};

function fill(text: string, name: string, orderId: string): string {
  return text
    .replace(/{name}/g, name || "[Customer Name]")
    .replace(/{orderId}/g, orderId || "[Order ID]");
}

export const STEPS: Step[] = [
  {
    id: "customer-message",
    label: "Customer Message",
    sender: "Customer → Brand",
    color: "bg-blue-500",
    editable: true,
    defaultText: (name, orderId, issue) =>
      fill(templates[issue]["customer-message"], name, orderId),
  },
  {
    id: "brand-to-customer",
    label: "Brand Reply to Customer",
    sender: "Brand → Customer",
    color: "bg-emerald-500",
    editable: true,
    defaultText: (name, orderId, issue) =>
      fill(templates[issue]["brand-to-customer"], name, orderId),
  },
  {
    id: "brand-to-courier",
    label: "Brand Email to Courier",
    sender: "Brand → Courier",
    color: "bg-emerald-500",
    editable: true,
    defaultText: (name, orderId, issue) =>
      fill(templates[issue]["brand-to-courier"], name, orderId),
  },
  {
    id: "courier-to-brand",
    label: "Courier Reply to Brand",
    sender: "Courier → Brand",
    color: "bg-amber-500",
    editable: true,
    defaultText: (name, orderId, issue) =>
      fill(templates[issue]["courier-to-brand"], name, orderId),
  },
  {
    id: "customer-response",
    label: "Customer Follow-up",
    sender: "Customer → Brand",
    color: "bg-blue-500",
    editable: true,
    defaultText: (name, orderId, issue) =>
      fill(templates[issue]["customer-response"], name, orderId),
  },
  {
    id: "brand-final",
    label: "Brand Final Resolution",
    sender: "Brand → Customer",
    color: "bg-emerald-500",
    editable: true,
    defaultText: (name, orderId, issue) =>
      fill(templates[issue]["brand-final"], name, orderId),
  },
];
