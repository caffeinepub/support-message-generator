import { ScenarioForm } from "@/components/ScenarioForm";
import { SubTabLayout } from "@/components/SubTabLayout";
import { useState } from "react";

const SUBTABS = [
  { id: "delivery-failed", label: "Delivery Failed" },
  { id: "damaged-unit", label: "Damaged Unit Received" },
  { id: "wrong-unit", label: "Wrong Unit Received" },
  { id: "return-cod", label: "Return-COD" },
  { id: "return-prepaid", label: "Return-Prepaid" },
];

export function EshopboxTab() {
  const [sub, setSub] = useState("delivery-failed");
  return (
    <SubTabLayout
      tabs={SUBTABS}
      active={sub}
      onChange={setSub}
      ocidScope="eshopbox"
    >
      <ScenarioForm scenario={sub as any} ocidScope={`eshopbox.${sub}`} />
    </SubTabLayout>
  );
}
