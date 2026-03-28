export type CourierScenarioId =
  | "package-delayed"
  | "package-lost"
  | "out-for-delivery"
  | "wrong-address"
  | "delivery-rescheduled"
  | "customs-hold"
  | "rto-initiated"
  | "rto-delivered"
  | "ndr-customer-unreachable"
  | "ndr-address-issue"
  | "shipment-damaged-in-transit"
  | "delivery-confirmation"
  | "fake-delivery"
  | "partial-delivery"
  | "shipment-out-of-coverage";

export const COURIER_SCENARIO_LABELS: Record<CourierScenarioId, string> = {
  "package-delayed": "Package Delayed",
  "package-lost": "Package Lost",
  "out-for-delivery": "Out for Delivery",
  "wrong-address": "Wrong Address",
  "delivery-rescheduled": "Delivery Rescheduled",
  "customs-hold": "Customs Hold",
  "rto-initiated": "RTO Initiated",
  "rto-delivered": "RTO Delivered",
  "ndr-customer-unreachable": "NDR – Customer Unreachable",
  "ndr-address-issue": "NDR – Address Issue",
  "shipment-damaged-in-transit": "Shipment Damaged in Transit",
  "delivery-confirmation": "Delivery Confirmation",
  "fake-delivery": "Fake Delivery",
  "partial-delivery": "Partial Delivery",
  "shipment-out-of-coverage": "Shipment Out of Coverage",
};

export function detectCourierScenario(text: string): CourierScenarioId | null {
  const t = text.toLowerCase();

  if (
    /fake delivery|not delivered|marked delivered|shows delivered but|never received/.test(
      t,
    )
  )
    return "fake-delivery";
  if (/lost|missing|cannot locate|untraceable|no scan|no movement/.test(t))
    return "package-lost";
  if (
    /out for delivery|\bofd\b|arriving today|on the way|dispatched today/.test(
      t,
    )
  )
    return "out-for-delivery";
  if (/customs|held at customs|regulatory|clearance|duty|seized/.test(t))
    return "customs-hold";
  if (/rto delivered|returned to origin.*delivered|returned.*warehouse/.test(t))
    return "rto-delivered";
  if (/\brto\b|return to origin|returning to seller|sent back|reverse/.test(t))
    return "rto-initiated";
  if (/wrong address|incorrect address|wrong pincode|wrong city/.test(t))
    return "wrong-address";
  if (/reschedule|preferred date|change delivery|postpone/.test(t))
    return "delivery-rescheduled";
  if (/unreachable|not picking|phone off|not answering/.test(t))
    return "ndr-customer-unreachable";
  if (
    /address incomplete|landmark|floor|flat number|house number|address issue/.test(
      t,
    )
  )
    return "ndr-address-issue";
  if (
    /partial|only received|missing item|incomplete order|one item missing/.test(
      t,
    )
  )
    return "partial-delivery";
  if (
    /damaged in transit|broken received|package broken|damaged shipment/.test(t)
  )
    return "shipment-damaged-in-transit";
  if (/\bdelivered\b|delivery done|package received|got my order/.test(t))
    return "delivery-confirmation";
  if (
    /delay|late|not yet delivered|when deliver|where is my|stuck|no update|not moving/.test(
      t,
    )
  )
    return "package-delayed";
  if (/not serviceable|out of coverage|pincode not|not deliver area/.test(t))
    return "shipment-out-of-coverage";

  return null;
}

function g(values: Record<string, string>, key: string, def: string): string {
  return values[key]?.trim() || def;
}

export function generateCourierMessage(
  scenario: CourierScenarioId,
  values: Record<string, string>,
): string {
  const name = g(values, "name", "Customer");
  const orderId = g(values, "orderId", "[Order ID]");
  const awb = g(values, "awb", "[AWB Number]");
  const courier = g(values, "courier", "our courier partner");
  const itemName = g(values, "itemName", "[Item]");
  const sign = "Thank you!\nTeam LamaStore";

  switch (scenario) {
    case "package-delayed": {
      const expectedDate = g(values, "expectedDate", "[Expected Date]");
      return `Dear ${name},

We sincerely apologise for the delay in delivering your order ${orderId} (AWB: ${awb}).

Your shipment is currently in transit with ${courier} and is expected to be delivered by ${expectedDate}.

We understand how inconvenient this delay is and we are closely monitoring the shipment. If your order does not arrive by the expected date, we will escalate the matter with ${courier} on priority.

Please feel free to reach out to us for any further assistance.

${sign}`;
    }

    case "package-lost": {
      return `Dear ${name},

We regret to inform you that your shipment for order ${orderId} (AWB: ${awb}) appears to have been lost in transit with ${courier}.

We have immediately raised a formal investigation with the courier. As soon as the investigation is complete, we will arrange a replacement or a full refund within 5–7 working days.

We sincerely apologise for the inconvenience caused and assure you that we are treating this as a top priority.

${sign}`;
    }

    case "out-for-delivery": {
      return `Dear ${name},

Great news! 🎉 Your order ${orderId} for "${itemName}" is out for delivery today!

Our delivery partner is on the way to you. Please ensure someone is available at the delivery address and keep your phone reachable so the delivery executive can contact you if needed.

We hope you love your purchase!

${sign}`;
    }

    case "wrong-address": {
      const correctAddress = g(values, "correctAddress", "[Address on Record]");
      return `Dear ${name},

We noticed an address issue with your order ${orderId} (AWB: ${awb}).

The address currently on record is:
${correctAddress}

Could you please confirm if this is correct, or provide us with the updated complete address including flat/house number, landmark, city, and pincode? Address corrections typically take 24–48 hours to be updated with ${courier}.

Please reply at the earliest so we can ensure prompt delivery.

${sign}`;
    }

    case "delivery-rescheduled": {
      const rescheduleDate = g(values, "rescheduleDate", "[Rescheduled Date]");
      return `Dear ${name},

We would like to inform you that the delivery for your order ${orderId} (AWB: ${awb}) has been rescheduled.

Our courier partner ${courier} will now attempt delivery on ${rescheduleDate}. Please ensure someone is available at the delivery address on this date.

We apologise for any inconvenience this may have caused.

${sign}`;
    }

    case "customs-hold": {
      return `Dear ${name},

We are writing to inform you that your shipment for order ${orderId} (AWB: ${awb}) is currently being held by customs authorities for regulatory clearance.

We are actively coordinating with ${courier} and the customs department to resolve this at the earliest. We will keep you updated as soon as there is any movement on the shipment.

We sincerely apologise for the inconvenience and thank you for your patience.

${sign}`;
    }

    case "rto-initiated": {
      const rtoReason = g(values, "rtoReason", "[RTO Reason]");
      return `Dear ${name},

We regret to inform you that your shipment for order ${orderId} (AWB: ${awb}) is being returned to us due to: ${rtoReason}.

We apologise for the inconvenience. Once we receive the returned shipment, we would be happy to:
• Re-dispatch the order to a confirmed address, OR
• Process a full refund to your original payment method.

Kindly let us know your preference and we will arrange accordingly.

${sign}`;
    }

    case "rto-delivered": {
      return `Dear ${name},

We would like to inform you that your returned shipment for order ${orderId} (AWB: ${awb}) has been received back at our warehouse.

We are ready to process your preferred resolution. Please let us know how you would like to proceed:
• Re-ship the order to a confirmed delivery address, OR
• Process a full refund to your original payment method.

Kindly reply at your earliest convenience and we will take care of it immediately.

${sign}`;
    }

    case "ndr-customer-unreachable": {
      return `Dear ${name},

Our delivery executive attempted to deliver your order ${orderId} (AWB: ${awb}) but was unable to reach you at the time of delivery.

A re-delivery attempt will be made on the next working day. We request you to please keep your phone reachable between 10 AM – 7 PM on the day of delivery so our executive can contact you.

We apologise for the inconvenience.

${sign}`;
    }

    case "ndr-address-issue": {
      return `Dear ${name},

Our delivery executive attempted to deliver your order ${orderId} (AWB: ${awb}) but could not complete the delivery due to an address issue.

To ensure successful delivery, could you please provide us with the complete address details including:
• Flat / House / Shop Number
• Nearest Landmark
• Correct Pincode

Kindly share the updated address so we can arrange re-delivery at the earliest.

${sign}`;
    }

    case "shipment-damaged-in-transit": {
      return `Dear ${name},

We are truly sorry to hear that your order ${orderId} arrived in a damaged condition. This is absolutely not the experience we aim to provide.

We request you to please share the following with us so we can take immediate action:
• Clear photos of the damaged package
• Unboxing video (if available)

Once we receive the visuals, we will process a replacement or full refund on top priority. We sincerely apologise for the inconvenience caused.

${sign}`;
    }

    case "delivery-confirmation": {
      return `Dear ${name},

We are happy to confirm that your order ${orderId} for "${itemName}" has been successfully delivered! 🎉

We hope you are absolutely loving your purchase. If you have any feedback, questions, or need any assistance, please feel free to reach out to us anytime.

Thank you for shopping with us!

${sign}`;
    }

    case "fake-delivery": {
      return `Dear ${name},

We sincerely apologise for the trouble you are facing. We understand that your order ${orderId} (AWB: ${awb}) has been marked as delivered, but you have not received the package.

We are raising an urgent investigation with ${courier} immediately. The investigation typically takes 3–5 working days.

In the meantime, we request you to:
• Check with your neighbours or building reception
• Verify if the package was left at a secure location

Please be assured that if the package is confirmed as undelivered, we will arrange an immediate replacement or full refund.

We apologise deeply for this experience.

${sign}`;
    }

    case "partial-delivery": {
      const missingItems = g(values, "missingItems", "[Missing Items]");
      const missingList = missingItems
        .split("\n")
        .map((item, i) => `${i + 1}. ${item.trim()}`)
        .filter(
          (line) =>
            line.trim() !==
            `${missingItems.split("\n").indexOf(missingItems.split("\n")[0]) + 1}. `,
        )
        .join("\n");
      return `Dear ${name},

We sincerely apologise for the incomplete delivery of your order ${orderId}. We understand how frustrating this is.

The following item(s) appear to be missing from your delivery:
${missingList}

We will either ship the missing items immediately or process a refund for the missing items within 3–5 working days. We will keep you updated on the action taken.

We apologise for the inconvenience caused.

${sign}`;
    }

    case "shipment-out-of-coverage": {
      return `Dear ${name},

We regret to inform you that your delivery address pincode for order ${orderId} is currently not serviceable by our courier network.

We apologise for the inconvenience. You may consider the following options:
• Provide an alternate delivery address in a serviceable area
• Wait for our courier network to expand to your pincode (we are working on it!)
• We can process a full refund if you prefer

Please let us know how you would like to proceed.

${sign}`;
    }
  }
}
