import { DatePickerField } from "@/components/DatePickerField";
import { FormField } from "@/components/FormField";
import { MessageOutput } from "@/components/MessageOutput";
import { Button } from "@/components/ui/button";
import { type ScenarioId, generateMessage } from "@/lib/messageTemplates";
import { useState } from "react";

interface ScenarioFormProps {
  scenario: ScenarioId;
  ocidScope: string;
}

type FieldValues = Record<string, string>;

export function ScenarioForm({ scenario, ocidScope }: ScenarioFormProps) {
  const [values, setValues] = useState<FieldValues>({});
  const [message, setMessage] = useState("");

  const setValue = (key: string, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));
  const get = (key: string, def = "") => values[key] ?? def;

  const handleGenerate = () => {
    const msg = generateMessage(scenario, values);
    setMessage(msg);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <ScenarioFields
          scenario={scenario}
          get={get}
          setValue={setValue}
          ocidScope={ocidScope}
        />
        <Button
          onClick={handleGenerate}
          data-ocid={`${ocidScope}.generate.primary_button`}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Generate Message
        </Button>
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        {message ? (
          <MessageOutput message={message} ocidScope={ocidScope} />
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full min-h-[200px] text-center"
            data-ocid={`${ocidScope}.msg.empty_state`}
          >
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
              <span className="text-2xl">✉️</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Fill the form and click Generate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MediaTypeSelect({
  value,
  onChange,
  ocid,
}: {
  value: string;
  onChange: (v: string) => void;
  ocid: string;
}) {
  return (
    <div className="space-y-1">
      <label
        className="text-sm font-medium text-foreground"
        htmlFor="mediaType"
      >
        Media Type
      </label>
      <select
        id="mediaType"
        data-ocid={ocid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-[#1e2235] text-[#e8eaf0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select Media Type</option>
        <option value="Whatsapp">Whatsapp</option>
        <option value="Instagram">Instagram</option>
        <option value="Email">Email</option>
      </select>
    </div>
  );
}

function ScenarioFields({
  scenario,
  get,
  setValue,
  ocidScope,
}: {
  scenario: ScenarioId;
  get: (k: string, def?: string) => string;
  setValue: (k: string, v: string) => void;
  ocidScope: string;
}) {
  switch (scenario) {
    case "order-confirmation":
      return (
        <>
          <MediaTypeSelect
            value={get("mediaType")}
            onChange={(v) => setValue("mediaType", v)}
            ocid={`${ocidScope}.mediaType.select`}
          />
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Rahul Sharma"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <FormField
            label="Item Name"
            id="itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
            placeholder="e.g. Blue Oversized Tee"
            ocid={`${ocidScope}.itemName.input`}
          />
          <DatePickerField
            label="Order Date"
            id="orderDate"
            value={get("orderDate")}
            onChange={(v) => setValue("orderDate", v)}
            ocid={`${ocidScope}.orderDate.input`}
          />
        </>
      );
    case "abandoned-checkout":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Priya Mehta"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Item"
            id="item"
            value={get("item", "ABC")}
            onChange={(v) => setValue("item", v)}
            placeholder="e.g. ABC"
            ocid={`${ocidScope}.item.input`}
          />
          <FormField
            label="Discount"
            id="discount"
            value={get("discount", "15%")}
            onChange={(v) => setValue("discount", v)}
            placeholder="e.g. 15%"
            ocid={`${ocidScope}.discount.input`}
          />
          <FormField
            label="Promo Code"
            id="promoCode"
            value={get("promoCode", "WINTER15")}
            onChange={(v) => setValue("promoCode", v)}
            placeholder="e.g. WINTER15"
            ocid={`${ocidScope}.promoCode.input`}
          />
          <FormField
            label="Category"
            id="category"
            value={get("category", "oversized T-shirt")}
            onChange={(v) => setValue("category", v)}
            placeholder="e.g. oversized T-shirt"
            ocid={`${ocidScope}.category.input`}
          />
        </>
      );
    case "delivery-failed":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Amit Gupta"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #29509"
            ocid={`${ocidScope}.orderId.input`}
          />
          <DatePickerField
            label="Order Date"
            id="orderDate"
            value={get("orderDate")}
            onChange={(v) => setValue("orderDate", v)}
            ocid={`${ocidScope}.orderDate.input`}
          />
          <FormField
            label="Item Name"
            id="itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
            placeholder="e.g. Blue Oversized Tee"
            ocid={`${ocidScope}.itemName.input`}
          />
          <div className="grid grid-cols-2 gap-2">
            <DatePickerField
              label="1st Attempt Date"
              id="attempt1Date"
              value={get("attempt1Date")}
              onChange={(v) => setValue("attempt1Date", v)}
              disabled={!!(get("attempt2Date") || get("attempt3Date"))}
              ocid={`${ocidScope}.attempt1Date.input`}
            />
            <FormField
              label="Remarks"
              id="attempt1Remarks"
              value={get("attempt1Remarks")}
              onChange={(v) => setValue("attempt1Remarks", v)}
              placeholder="Remarks"
              disabled={!!(get("attempt2Date") || get("attempt3Date"))}
              ocid={`${ocidScope}.attempt1Remarks.input`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DatePickerField
              label="2nd Attempt Date"
              id="attempt2Date"
              value={get("attempt2Date")}
              onChange={(v) => setValue("attempt2Date", v)}
              disabled={!!(get("attempt1Date") || get("attempt3Date"))}
              ocid={`${ocidScope}.attempt2Date.input`}
            />
            <FormField
              label="Remarks"
              id="attempt2Remarks"
              value={get("attempt2Remarks")}
              onChange={(v) => setValue("attempt2Remarks", v)}
              placeholder="Remarks"
              disabled={!!(get("attempt1Date") || get("attempt3Date"))}
              ocid={`${ocidScope}.attempt2Remarks.input`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DatePickerField
              label="3rd Attempt Date"
              id="attempt3Date"
              value={get("attempt3Date")}
              onChange={(v) => setValue("attempt3Date", v)}
              disabled={!!(get("attempt1Date") || get("attempt2Date"))}
              ocid={`${ocidScope}.attempt3Date.input`}
            />
            <FormField
              label="Remarks"
              id="attempt3Remarks"
              value={get("attempt3Remarks")}
              onChange={(v) => setValue("attempt3Remarks", v)}
              placeholder="Remarks"
              disabled={!!(get("attempt1Date") || get("attempt2Date"))}
              ocid={`${ocidScope}.attempt3Remarks.input`}
            />
          </div>
        </>
      );
    case "damaged-unit":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Neha Singh"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <FormField
            label="Item Name"
            id="itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
            placeholder="e.g. White Polo Tee"
            ocid={`${ocidScope}.itemName.input`}
          />
        </>
      );
    case "wrong-unit":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Raj Kumar"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <FormField
            label="Received Item"
            id="receivedItem"
            value={get("receivedItem")}
            onChange={(v) => setValue("receivedItem", v)}
            placeholder="e.g. Red Tee"
            ocid={`${ocidScope}.receivedItem.input`}
          />
          <FormField
            label="Ordered Item"
            id="orderedItem"
            value={get("orderedItem")}
            onChange={(v) => setValue("orderedItem", v)}
            placeholder="e.g. Blue Tee"
            ocid={`${ocidScope}.orderedItem.input`}
          />
        </>
      );
    case "return-cod":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Kishan Vachhani"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #29509"
            ocid={`${ocidScope}.orderId.input`}
          />
          <DatePickerField
            label="Pickup Date"
            id="pickupDate"
            value={get("pickupDate")}
            onChange={(v) => setValue("pickupDate", v)}
            ocid={`${ocidScope}.pickupDate.input`}
          />
          <FormField
            label="Refund Amount (Rs.)"
            id="refundAmount"
            value={get("refundAmount")}
            onChange={(v) => setValue("refundAmount", v)}
            placeholder="e.g. 3897"
            ocid={`${ocidScope}.refundAmount.input`}
          />
          <FormField
            label="Items to Pickup (one per line)"
            id="itemsToPickup"
            value={get("itemsToPickup")}
            onChange={(v) => setValue("itemsToPickup", v)}
            placeholder="Blue Tee\nYellow Tee"
            multiline
            ocid={`${ocidScope}.itemsToPickup.textarea`}
          />
          <div className="border-t border-border pt-3 mt-1">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Bank Details
            </p>
            <div className="space-y-3">
              <FormField
                label="Account Holder Name"
                id="accountHolder"
                value={get("accountHolder")}
                onChange={(v) => setValue("accountHolder", v)}
                placeholder="Full name"
                ocid={`${ocidScope}.accountHolder.input`}
              />
              <FormField
                label="Bank Name"
                id="bankName"
                value={get("bankName")}
                onChange={(v) => setValue("bankName", v)}
                placeholder="e.g. HDFC Bank"
                ocid={`${ocidScope}.bankName.input`}
              />
              <FormField
                label="Account Number"
                id="accountNumber"
                value={get("accountNumber")}
                onChange={(v) => setValue("accountNumber", v)}
                placeholder="e.g. 123456789"
                ocid={`${ocidScope}.accountNumber.input`}
              />
              <FormField
                label="IFSC Code"
                id="ifscCode"
                value={get("ifscCode")}
                onChange={(v) => setValue("ifscCode", v)}
                placeholder="e.g. HDFC0001234"
                ocid={`${ocidScope}.ifscCode.input`}
              />
            </div>
          </div>
        </>
      );
    case "return-prepaid":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Vikas Tolani"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #29162"
            ocid={`${ocidScope}.orderId.input`}
          />
          <DatePickerField
            label="Pickup Date"
            id="pickupDate"
            value={get("pickupDate")}
            onChange={(v) => setValue("pickupDate", v)}
            ocid={`${ocidScope}.pickupDate.input`}
          />
          <FormField
            label="Items to Pickup (one per line)"
            id="itemsToPickup"
            value={get("itemsToPickup")}
            onChange={(v) => setValue("itemsToPickup", v)}
            placeholder="Blue Tee\nYellow Tee"
            multiline
            ocid={`${ocidScope}.itemsToPickup.textarea`}
          />
        </>
      );
    case "order-cancellation":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Yash Patel"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <FormField
            label="Item Name"
            id="itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
            placeholder="e.g. Black Hoodie"
            ocid={`${ocidScope}.itemName.input`}
          />
          <MediaTypeSelect
            value={get("mediaType")}
            onChange={(v) => setValue("mediaType", v)}
            ocid={`${ocidScope}.mediaType.select`}
          />
        </>
      );
    case "estimate-delivery":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Sneha Rao"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <DatePickerField
            label="Estimated Delivery Date"
            id="deliveryDate"
            value={get("deliveryDate")}
            onChange={(v) => setValue("deliveryDate", v)}
            ocid={`${ocidScope}.deliveryDate.input`}
          />
        </>
      );
    case "unfulfilled":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Ankit Joshi"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <FormField
            label="Item Name"
            id="itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
            placeholder="e.g. Grey Joggers"
            ocid={`${ocidScope}.itemName.input`}
          />
        </>
      );
    case "cancelled":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Deepa Nair"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <FormField
            label="Item Name"
            id="itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
            placeholder="e.g. White Sneakers"
            ocid={`${ocidScope}.itemName.input`}
          />
          <FormField
            label="Reason"
            id="reason"
            value={get("reason")}
            onChange={(v) => setValue("reason", v)}
            placeholder="e.g. item out of stock"
            ocid={`${ocidScope}.reason.input`}
          />
        </>
      );
    case "urgent-delivery":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Ramesh Verma"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <DatePickerField
            label="Requested Delivery Date"
            id="requestedDate"
            value={get("requestedDate")}
            onChange={(v) => setValue("requestedDate", v)}
            ocid={`${ocidScope}.requestedDate.input`}
          />
        </>
      );
    case "under-production":
      return (
        <>
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Kavya Reddy"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <FormField
            label="Item Name"
            id="itemName"
            value={get("itemName")}
            onChange={(v) => setValue("itemName", v)}
            placeholder="e.g. Custom Print Tee"
            ocid={`${ocidScope}.itemName.input`}
          />
          <DatePickerField
            label="Expected Completion Date"
            id="completionDate"
            value={get("completionDate")}
            onChange={(v) => setValue("completionDate", v)}
            ocid={`${ocidScope}.completionDate.input`}
          />
        </>
      );
    case "return-request":
      return (
        <>
          <MediaTypeSelect
            value={get("mediaType")}
            onChange={(v) => setValue("mediaType", v)}
            ocid={`${ocidScope}.mediaType.select`}
          />
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Yash Patel"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <FormField
            label="Reason for Return"
            id="returnReason"
            value={get("returnReason")}
            onChange={(v) => setValue("returnReason", v)}
            placeholder="e.g. Wrong size received"
            ocid={`${ocidScope}.returnReason.input`}
          />
          <DatePickerField
            label="Pickup Date"
            id="pickupDate"
            value={get("pickupDate")}
            onChange={(v) => setValue("pickupDate", v)}
            ocid={`${ocidScope}.pickupDate.input`}
          />
          <FormField
            label="Items to Return (one per line)"
            id="itemsToReturn"
            value={get("itemsToReturn")}
            onChange={(v) => setValue("itemsToReturn", v)}
            placeholder="Blue Tee&#10;White Polo"
            multiline
            ocid={`${ocidScope}.itemsToReturn.textarea`}
          />
        </>
      );
    case "refund-status":
      return (
        <>
          <MediaTypeSelect
            value={get("mediaType")}
            onChange={(v) => setValue("mediaType", v)}
            ocid={`${ocidScope}.mediaType.select`}
          />
          <FormField
            label="Customer Name"
            id="name"
            value={get("name")}
            onChange={(v) => setValue("name", v)}
            placeholder="e.g. Rahul Sharma"
            ocid={`${ocidScope}.name.input`}
          />
          <FormField
            label="Order ID"
            id="orderId"
            value={get("orderId")}
            onChange={(v) => setValue("orderId", v)}
            placeholder="e.g. #12345"
            ocid={`${ocidScope}.orderId.input`}
          />
          <FormField
            label="Refund Amount (Rs.)"
            id="refundAmount"
            value={get("refundAmount")}
            onChange={(v) => setValue("refundAmount", v)}
            placeholder="e.g. 1499"
            ocid={`${ocidScope}.refundAmount.input`}
          />
          <FormField
            label="Refund Status"
            id="refundStatus"
            value={get("refundStatus")}
            onChange={(v) => setValue("refundStatus", v)}
            placeholder="e.g. initiated / processed / credited"
            ocid={`${ocidScope}.refundStatus.input`}
          />
          <FormField
            label="Payment Mode"
            id="paymentMode"
            value={get("paymentMode")}
            onChange={(v) => setValue("paymentMode", v)}
            placeholder="e.g. source account / bank account / UPI"
            ocid={`${ocidScope}.paymentMode.input`}
          />
          <FormField
            label="Expected Days"
            id="expectedDays"
            value={get("expectedDays")}
            onChange={(v) => setValue("expectedDays", v)}
            placeholder="e.g. 5-7 working days"
            ocid={`${ocidScope}.expectedDays.input`}
          />
        </>
      );
    default:
      return null;
  }
}
