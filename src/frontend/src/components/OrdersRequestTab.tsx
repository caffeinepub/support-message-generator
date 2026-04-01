import { ScenarioForm } from "@/components/ScenarioForm";
import { SubTabLayout } from "@/components/SubTabLayout";
import { useState } from "react";

const SUBTABS = [
  { id: "order-cancellation", label: "Order Cancellation" },
  { id: "estimate-delivery", label: "Estimate Delivery" },
  { id: "unfulfilled", label: "Unfulfilled" },
  { id: "cancelled", label: "Cancelled" },
  { id: "urgent-delivery", label: "Urgent Delivery" },
  { id: "under-production", label: "Order Under Production" },
  { id: "delivery-failed", label: "Delivery Failed" },
  { id: "order-confirmation", label: "Confirmation Pending" },
  { id: "return-request", label: "Return Request" },
  { id: "refund-status", label: "Refund Status" },
  { id: "abandoned-checkout", label: "Abandoned" },
];

export function OrdersRequestTab() {
  const [sub, setSub] = useState("order-cancellation");
  return (
    <SubTabLayout
      tabs={SUBTABS}
      active={sub}
      onChange={setSub}
      ocidScope="orders"
    >
      <ScenarioForm scenario={sub as any} ocidScope={`orders.${sub}`} />
    </SubTabLayout>
  );
}
