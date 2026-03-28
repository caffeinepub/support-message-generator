import { ScenarioForm } from "@/components/ScenarioForm";
import { SubTabLayout } from "@/components/SubTabLayout";
import { useState } from "react";

const SUBTABS = [
  { id: "order-confirmation", label: "Order Confirmation Not Received" },
  { id: "abandoned-checkout", label: "Abandoned Checkout" },
];

export function ShopifyTab() {
  const [sub, setSub] = useState("order-confirmation");
  return (
    <SubTabLayout
      tabs={SUBTABS}
      active={sub}
      onChange={setSub}
      ocidScope="shopify"
    >
      <ScenarioForm scenario={sub as any} ocidScope={`shopify.${sub}`} />
    </SubTabLayout>
  );
}
