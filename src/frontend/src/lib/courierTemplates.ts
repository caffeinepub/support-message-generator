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

export type CourierIntent = "tracking" | "delay" | "complaint" | "cancellation";

export const COURIER_SCENARIO_LABELS: Record<CourierScenarioId, string> = {
  "package-delayed": "Package Delayed",
  "package-lost": "Package Lost",
  "out-for-delivery": "Out for Delivery",
  "wrong-address": "Wrong Address",
  "delivery-rescheduled": "Delivery Rescheduled",
  "customs-hold": "Customs Hold",
  "rto-initiated": "RTO Initiated",
  "rto-delivered": "RTO Delivered",
  "ndr-customer-unreachable": "NDR - Customer Unreachable",
  "ndr-address-issue": "NDR - Address Issue",
  "shipment-damaged-in-transit": "Shipment Damaged in Transit",
  "delivery-confirmation": "Delivery Confirmation",
  "fake-delivery": "Fake Delivery",
  "partial-delivery": "Partial Delivery",
  "shipment-out-of-coverage": "Shipment Out of Coverage",
};

export const SCENARIO_INTENT: Record<CourierScenarioId, CourierIntent> = {
  "package-delayed": "delay",
  "package-lost": "complaint",
  "out-for-delivery": "tracking",
  "wrong-address": "complaint",
  "delivery-rescheduled": "delay",
  "customs-hold": "delay",
  "rto-initiated": "cancellation",
  "rto-delivered": "cancellation",
  "ndr-customer-unreachable": "tracking",
  "ndr-address-issue": "complaint",
  "shipment-damaged-in-transit": "complaint",
  "delivery-confirmation": "tracking",
  "fake-delivery": "complaint",
  "partial-delivery": "complaint",
  "shipment-out-of-coverage": "cancellation",
};

export function detectCourierScenario(text: string): CourierScenarioId | null {
  const t = text.toLowerCase();
  if (
    /fake delivery|not delivered|marked delivered|shows delivered but|never received|show delivered|status delivered but/.test(
      t,
    )
  )
    return "fake-delivery";
  if (
    /lost|missing|cannot locate|untraceable|no scan|no movement|where is my parcel|no tracking update/.test(
      t,
    )
  )
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
  if (
    /\brto\b|return to origin|returning to seller|sent back|want to cancel|cancel my order/.test(
      t,
    )
  )
    return "rto-initiated";
  if (/wrong address|incorrect address|wrong pincode|wrong city/.test(t))
    return "wrong-address";
  if (/reschedule|preferred date|change delivery date|postpone/.test(t))
    return "delivery-rescheduled";
  if (/unreachable|not picking|phone off|not answering|couldn't reach/.test(t))
    return "ndr-customer-unreachable";
  if (
    /address incomplete|landmark|floor|flat number|house number|address issue|can't find/.test(
      t,
    )
  )
    return "ndr-address-issue";
  if (
    /partial|only received|missing item|incomplete order|one item missing|items are missing/.test(
      t,
    )
  )
    return "partial-delivery";
  if (/damaged|broken|torn|crushed|smashed|open box|tampered/.test(t))
    return "shipment-damaged-in-transit";
  if (
    /\bdelivered\b|delivery done|package received|got my order|received the order/.test(
      t,
    )
  )
    return "delivery-confirmation";
  if (
    /delay|late|not yet delivered|when will|where is my|stuck|no update|not moving|expected date|how long/.test(
      t,
    )
  )
    return "package-delayed";
  if (
    /not serviceable|out of coverage|pincode not|not deliver area|can't deliver/.test(
      t,
    )
  )
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
  const name = g(values, "name", "there");
  const orderId = g(values, "orderId", "[Order ID]");
  const awb = g(values, "awb", "[AWB Number]");
  const courier = g(values, "courier", "our courier partner");
  const itemName = g(values, "itemName", "[Item]");
  const sign = "Thank you!\nTeam LamaStore";

  switch (scenario) {
    case "package-delayed": {
      const expectedDate = g(values, "expectedDate", "[Expected Date]");
      return `Hi ${name},\n\nThank you for reaching out. I completely understand how frustrating it can be when your order doesn't arrive on time, and I'm really sorry for the delay.\n\nYour order ${orderId} (AWB: ${awb}) is currently in transit with ${courier}. Based on the latest tracking update, we're expecting it to be delivered by ${expectedDate}.\n\nWe're keeping a close eye on it, and if it doesn't arrive by that date, we'll immediately escalate this with ${courier} and make sure it gets sorted out for you.\n\nIf you have any other questions in the meantime, please don't hesitate to reach out.\n\n${sign}`;
    }

    case "package-lost": {
      return `Hi ${name},\n\nI'm so sorry to hear this — I can only imagine how upsetting it must be to not receive your order. Please know we take this extremely seriously.\n\nIt looks like your shipment for order ${orderId} (AWB: ${awb}) may have been lost in transit with ${courier}. We've already raised an urgent investigation with them.\n\nHere's what happens next: once the investigation is complete (usually within 5–7 working days), we'll arrange either a full replacement or a complete refund — whichever you prefer.\n\nWe'll keep you posted at every step. Thank you for your patience, ${name}, and again, I'm truly sorry for this experience.\n\n${sign}`;
    }

    case "out-for-delivery": {
      return `Hi ${name},\n\nExciting news — your order ${orderId} for "${itemName}" is out for delivery today! 🎉\n\nOur delivery executive is on the way to you right now. Just make sure someone is available at the address and keep your phone nearby — they might give you a quick call before arriving.\n\nWe hope you love what you've ordered!\n\n${sign}`;
    }

    case "wrong-address": {
      const correctAddress = g(values, "correctAddress", "[Address on Record]");
      return `Hi ${name},\n\nThanks for getting in touch. It looks like there might be an issue with the delivery address for your order ${orderId} (AWB: ${awb}).\n\nThe address we currently have on record is:\n${correctAddress}\n\nCould you let us know if this is correct, or share the updated address with the flat/house number, a nearby landmark, city, and pincode? Once we have the right details, we'll coordinate with ${courier} to get it updated — this usually takes around 24–48 hours.\n\nPlease respond as soon as you can so we can get your delivery back on track.\n\n${sign}`;
    }

    case "delivery-rescheduled": {
      const rescheduleDate = g(values, "rescheduleDate", "[Rescheduled Date]");
      return `Hi ${name},\n\nI wanted to let you know that the delivery of your order ${orderId} (AWB: ${awb}) has been rescheduled.\n\n${courier} will now be attempting delivery on ${rescheduleDate}. Please make sure someone is available at the address on that day to receive the package.\n\nWe're sorry for any inconvenience this may have caused, and we appreciate your patience.\n\n${sign}`;
    }

    case "customs-hold": {
      return `Hi ${name},\n\nThank you for your patience. I wanted to personally update you that your shipment for order ${orderId} (AWB: ${awb}) is currently held up at customs for regulatory clearance.\n\nThis is unfortunately outside our direct control, but we're actively coordinating with ${courier} and the customs department to get it cleared as quickly as possible. As soon as there's any movement, you'll be the first to know.\n\nWe sincerely apologise for the delay and truly appreciate your understanding.\n\n${sign}`;
    }

    case "rto-initiated": {
      const rtoReason = g(values, "rtoReason", "[RTO Reason]");
      return `Hi ${name},\n\nI'm sorry to let you know that your shipment for order ${orderId} (AWB: ${awb}) is being returned to us. The reason given is: ${rtoReason}.\n\nI know this is disappointing, and I want to make sure we sort this out for you as smoothly as possible. Once the package is back with us, here's what we can do:\n\n• Re-send the order to a confirmed delivery address, or\n• Process a full refund to your original payment method\n\nJust let us know what you'd prefer, ${name}, and we'll get it done right away.\n\n${sign}`;
    }

    case "rto-delivered": {
      return `Hi ${name},\n\nYour returned shipment for order ${orderId} (AWB: ${awb}) has made it back to our warehouse safely.\n\nWe're ready to take action the moment you let us know what you'd like to do next:\n\n• We can re-ship the order to a confirmed address, or\n• We can process a full refund to your original payment method\n\nJust reply with your preference and we'll handle everything from there. We're sorry for the trouble this caused.\n\n${sign}`;
    }

    case "ndr-customer-unreachable": {
      return `Hi ${name},\n\nOur delivery executive tried to reach you for order ${orderId} (AWB: ${awb}) but unfortunately couldn't get through at the time of the delivery attempt.\n\nDon't worry — they'll try again on the next working day. To make sure the delivery goes through smoothly this time, please keep your phone reachable between 10 AM and 7 PM.\n\nIf you'd like to reschedule or provide any special instructions, just let us know and we'll pass that on.\n\n${sign}`;
    }

    case "ndr-address-issue": {
      return `Hi ${name},\n\nOur delivery executive attempted to deliver your order ${orderId} (AWB: ${awb}) but ran into trouble locating the address.\n\nTo help us complete the delivery, could you share the full and correct address details? Specifically:\n\n• Flat / House / Shop Number\n• A clear nearby landmark\n• Correct pincode\n\nOnce we have that, we'll coordinate the re-delivery right away. We're sorry for the hassle!\n\n${sign}`;
    }

    case "shipment-damaged-in-transit": {
      return `Hi ${name},\n\nI'm really sorry to hear that your order ${orderId} arrived damaged. That's absolutely not acceptable and I sincerely apologise for this experience.\n\nTo help us fix this as quickly as possible, could you please share:\n\n• Clear photos of the damaged packaging and item\n• An unboxing video if you have one\n\nOnce we receive these, we'll process a replacement or a full refund on priority — you won't have to wait long. Thank you for bringing this to our attention, ${name}.\n\n${sign}`;
    }

    case "delivery-confirmation": {
      return `Hi ${name},\n\nWe're happy to confirm that your order ${orderId} for "${itemName}" has been successfully delivered! 🎉\n\nWe hope you're absolutely loving it. If you have any questions, feedback, or need any help at all, we're always here for you.\n\nThank you so much for shopping with us!\n\n${sign}`;
    }

    case "fake-delivery": {
      return `Hi ${name},\n\nI completely understand your frustration, and I want you to know we take this very seriously. I'm truly sorry you're dealing with this.\n\nYour order ${orderId} (AWB: ${awb}) has been marked as delivered by ${courier}, but you haven't received it — we're raising an urgent investigation right now.\n\nWhile we work on this (it usually takes 3–5 working days), here are a few quick things to check:\n\n• Ask your neighbours or building reception if the package was left with them\n• Check if it was kept near your door or in a safe spot\n\nIf the package is confirmed as undelivered after the investigation, we will immediately arrange a full replacement or refund — no questions asked.\n\nWe're really sorry for this, ${name}. We'll keep you updated every step of the way.\n\n${sign}`;
    }

    case "partial-delivery": {
      const missingItems = g(values, "missingItems", "[Missing Items]");
      const missingList = missingItems
        .split("\n")
        .filter((l) => l.trim())
        .map((item, i) => `${i + 1}. ${item.trim()}`)
        .join("\n");
      return `Hi ${name},\n\nI'm really sorry to hear that your order ${orderId} wasn't complete. That must have been really disappointing, and I completely understand.\n\nThe following item(s) appear to be missing from your delivery:\n${missingList}\n\nWe'll either ship the missing items out to you immediately or process a refund for those items within 3–5 working days. We'll update you on which action we're taking.\n\nThank you for letting us know, ${name}. We're on it!\n\n${sign}`;
    }

    case "shipment-out-of-coverage": {
      return `Hi ${name},\n\nThank you for your order. Unfortunately, we've run into a challenge — the delivery address for order ${orderId} falls outside our current courier network's serviceable area.\n\nI'm sorry for the inconvenience. Here's what we can do for you:\n\n• You can provide an alternate address in a serviceable location\n• We can process a full refund if you'd prefer\n• We're also continuously expanding our delivery network, so this pincode may be serviceable soon\n\nJust let us know what works best for you and we'll take care of the rest.\n\n${sign}`;
    }
  }
}
