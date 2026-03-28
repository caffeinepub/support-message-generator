export type ScenarioId =
  | "order-confirmation"
  | "abandoned-checkout"
  | "delivery-failed"
  | "damaged-unit"
  | "wrong-unit"
  | "return-cod"
  | "return-prepaid"
  | "order-cancellation"
  | "estimate-delivery"
  | "unfulfilled"
  | "cancelled"
  | "urgent-delivery"
  | "under-production"
  | "bad-quality"
  | "price-too-high"
  | "what-material"
  | "tee-length"
  | "size-variants"
  | "discount-available"
  | "refund-policy"
  | "return-process"
  | "cod-refund-process"
  | "prepaid-refund-process";

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  "order-confirmation": "Order Confirmation Not Received",
  "abandoned-checkout": "Abandoned Checkout",
  "delivery-failed": "Delivery Failed",
  "damaged-unit": "Damaged Unit Received",
  "wrong-unit": "Wrong Unit Received",
  "return-cod": "Return-COD",
  "return-prepaid": "Return-Prepaid",
  "order-cancellation": "Order Cancellation",
  "estimate-delivery": "Estimate Delivery",
  unfulfilled: "Unfulfilled",
  cancelled: "Cancelled",
  "urgent-delivery": "Urgent Delivery",
  "under-production": "Order Under Production",
  "bad-quality": "Bad Quality Complaint",
  "price-too-high": "Price Too High",
  "what-material": "What is the Material",
  "tee-length": "What is the Length of Tee",
  "size-variants": "Size Variants Available",
  "discount-available": "Any Discount Available",
  "refund-policy": "Refund Policy",
  "return-process": "How Return Process Works",
  "cod-refund-process": "How Refund is Done for COD",
  "prepaid-refund-process": "How Refund is Done for Prepaid",
};

function buildItemList(itemsText: string): string {
  if (!itemsText.trim()) return "";
  const items = itemsText
    .split("\n")
    .map((i) => i.trim())
    .filter(Boolean);
  return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
}

export function generateMessage(
  scenario: ScenarioId,
  v: Record<string, string>,
): string {
  const name = v.name || "[Customer Name]";
  const orderId = v.orderId || "[Order ID]";
  const subCat = v.subCategory || "";

  switch (scenario) {
    case "order-confirmation":
      return `Dear ${name},

Thank you for your order! We understand you haven't received your order confirmation for Order ID: ${orderId} placed on ${v.orderDate || "[Order Date]"}.

We've checked and your order is confirmed in our system. The confirmation email may have gone to your spam/junk folder. Please check there.

If you still can't find it, we'll be happy to resend it to your registered email address.

Thank you!
Team LamaStore`;

    case "abandoned-checkout":
      return `Dear ${name},

We noticed you left something behind! Your ${v.item || "ABC"} from our ${v.category || "oversized T-shirt"} collection is still waiting for you.

Complete your purchase today and enjoy ${v.discount || "15%"} off with code: ${v.promoCode || "WINTER15"}

Don't miss out — this offer is for a limited time only!

Shop Now: [Your Store Link]

Thank you!
Team LamaStore`;

    case "delivery-failed": {
      const attempts: string[] = [];
      if (v.attempt1Date) {
        attempts.push(
          `1st Attempt: ${v.attempt1Date}${v.attempt1Remarks ? ` - ${v.attempt1Remarks}` : ""}`,
        );
      }
      if (v.attempt2Date) {
        attempts.push(
          `2nd Attempt: ${v.attempt2Date}${v.attempt2Remarks ? ` - ${v.attempt2Remarks}` : ""}`,
        );
      }
      if (v.attempt3Date) {
        attempts.push(
          `3rd Attempt: ${v.attempt3Date}${v.attempt3Remarks ? ` - ${v.attempt3Remarks}` : ""}`,
        );
      }
      return `Dear ${name},

We regret to inform you that our delivery partner attempted to deliver your order.

Order ID: ${orderId}
Order Date: ${v.orderDate || "[Order Date]"}
Item: "${v.itemName || "[Item Name]"}"

Delivery Attempt Details:
${attempts.length ? attempts.join("\n") : "[Delivery attempt details]"}

We request you to please ensure availability for the next delivery attempt or contact us for rescheduling.

Thank you!
LamaStore Team`;
    }

    case "damaged-unit":
      return `Dear ${name},

We sincerely apologize for the inconvenience caused. We're sorry to hear that you received a damaged item for Order ID: ${orderId}.

To resolve this at the earliest, we request you to:
1. Share clear photos of the damaged item
2. Share the order ID
3. Shipping Lable

We assure you that this will be handled on a priority basis.

Thank you!
Team LamaStore`;

    case "wrong-unit":
      return `Dear ${name},

We sincerely apologize for the inconvenience caused. We're sorry to hear that you received "${v.receivedItem || "[Received Item]"}" instead of "${v.orderedItem || "[Ordered Item]"}" for Order ID: ${orderId}.

We will initiate the process to send you the correct item at the earliest. Our team will contact you shortly to arrange the exchange.

Thank you!
Team LamaStore`;

    case "return-cod": {
      const itemList = buildItemList(v.itemsToPickup || "");
      return `Dear ${name},

We have booked a reverse pickup for Order ID: ${orderId}, scheduled to be picked up on ${v.pickupDate || "[Pickup Date]"}.

Once the return pickup is delivered to our warehouse, we will initiate your refund amount to your bank account within 5-7 working days from the date of dispatch.

Kindly confirm your bank details for the refund:

Account Holder Name:
Bank Name:
Account Number:
IFSC Code:

Note: The refunded amount for the order will be Rs. ${v.refundAmount || "[Amount]"}.

Note:

Item to pickup:
${itemList || "[Items to pickup]"}

Thank you!
Team LamaStore`;
    }

    case "return-prepaid": {
      const itemList = buildItemList(v.itemsToPickup || "");
      return `Dear ${name},

We have booked a reverse pickup for Order ID: ${orderId}, scheduled to be picked up on ${v.pickupDate || "[Pickup Date]"}.

Once the return pickup is delivered to our warehouse, we will initiate your refund amount to your source account within 5-7 working days from the date of dispatch.

Note:

Item to pickup:
${itemList || "[Items to pickup]"}

Thank you!
Team LamaStore`;
    }

    case "order-cancellation":
      return `Dear ${name},

We have received your cancellation request for Order ID: ${orderId} for the "${v.itemName || "[Item Name]"}".

We are currently processing your request and will notify you once it is successfully cancelled.

Thank you!
Team LamaStore`;

    case "estimate-delivery":
      return `Dear ${name},

Thank you for reaching out! Your Order ID: ${orderId} is on its way and is estimated to be delivered by ${v.deliveryDate || "[Estimated Delivery Date]"}.

Please feel free to reach out if you need any further assistance.

Thank you!
Team LamaStore`;

    case "unfulfilled":
      return `Dear ${name},

Thank you for your patience! We wanted to update you that your Order ID: ${orderId} for "${v.itemName || "[Item Name]"}" is currently being processed and will be fulfilled shortly.

We will notify you once it is dispatched.

Thank you!
Team LamaStore`;

    case "cancelled":
      return `Dear ${name},

We regret to inform you that your Order ID: ${orderId} for "${v.itemName || "[Item Name]"}" has been cancelled due to ${v.reason || "[Reason]"}.

We apologize for the inconvenience. Please feel free to place a new order or contact us for further assistance.

Thank you!
Team LamaStore`;

    case "urgent-delivery":
      return `Dear ${name},

Thank you for contacting us! We understand your urgency regarding Order ID: ${orderId}.

We have flagged your order as urgent and are working to ensure delivery by ${v.requestedDate || "[Requested Delivery Date]"}. Our team will do their best to accommodate your request.

Thank you!
Team LamaStore`;

    case "under-production":
      return `Dear ${name},

Thank you for your order! We wanted to update you that your Order ID: ${orderId} for "${v.itemName || "[Item Name]"}" is currently under production.

Your order is expected to be ready by ${v.completionDate || "[Expected Completion Date]"}. We will notify you once it is dispatched.

Thank you!
Team LamaStore`;

    case "bad-quality":
      return `Dear ${name},

Thank you for reaching out and sharing your feedback. We sincerely apologize that the ${subCat ? `${subCat}` : "product"} did not meet your quality expectations.

We take quality concerns very seriously. Kindly share clear photos of the item along with your Order ID so our team can review the issue and assist you with the best possible resolution.

Thank you!
Team LamaStore`;

    case "price-too-high":
      return `Dear ${name},

Thank you for your feedback! We understand price is an important factor.

We strive to offer the best quality products at competitive prices. We do run seasonal sales and special offers from time to time. You can follow us on our social media channels or subscribe to our newsletter to stay updated on upcoming deals and discounts.

Thank you!
Team LamaStore`;

    case "what-material":
      return `Dear ${name},

Thank you for your question!

${subCat ? `Our ${subCat}` : "Our T-shirts"} are made from 100% premium combed cotton, which is soft, breathable, and durable — perfect for everyday wear.

If you have any more questions about the product, feel free to ask!

Thank you!
Team LamaStore`;

    case "tee-length":
      return `Dear ${name},

Thank you for your question!

The length of ${subCat ? `our ${subCat}` : "our T-shirts"} varies by size:
- S: 27 inches
- M: 28 inches
- L: 29 inches
- XL: 30 inches
- XXL: 31 inches

These are approximate measurements. If you need further assistance with sizing, feel free to reach out!

Thank you!
Team LamaStore`;

    case "size-variants":
      return `Dear ${name},

Thank you for your interest!

Yes, ${subCat ? `our ${subCat}` : "our T-shirts"} are available in the following sizes: S, M, L, XL, and XXL.

Please check the product page for current availability of each size. If a specific size is not available, you can contact us and we will try our best to assist you.

Thank you!
Team LamaStore`;

    case "discount-available":
      return `Dear ${name},

Thank you for reaching out!

We do offer discounts and special promotions from time to time. Please follow us on our social media channels or subscribe to our newsletter to stay updated on all upcoming offers and discount codes.

You can also check our website regularly for any ongoing sales.

Thank you!
Team LamaStore`;

    case "refund-policy":
      return `Dear ${name},

Thank you for your question!

Our refund policy is as follows:
- Refund requests must be raised within 7 days of delivery.
- Once the return pickup is completed and the item is received at our warehouse, the refund will be processed within 5–7 working days.

For any refund-related queries, feel free to reach out to us.

Thank you!
Team LamaStore`;

    case "return-process":
      return `Dear ${name},

Thank you for reaching out!

Here is how our return process works:
1. Raise a return request within 7 days of delivery by contacting us.
2. Our team will verify the request and book a reverse pickup.
3. Ensure the item is packed securely and handed over to the pickup agent.
4. Once the item is received at our warehouse, the refund or replacement will be processed.

Feel free to contact us if you need any further assistance!

Thank you!
Team LamaStore`;

    case "cod-refund-process":
      return `Dear ${name},

Thank you for your question!

For Cash on Delivery (COD) orders, refunds are processed to your bank account. Once the return pickup is received at our warehouse, we will initiate the refund within 5–7 working days.

You will need to provide the following bank details for the refund:
- Account Holder Name
- Bank Name
- Account Number
- IFSC Code

Our team will reach out to collect these details once the return is confirmed.

Thank you!
Team LamaStore`;

    case "prepaid-refund-process":
      return `Dear ${name},

Thank you for your question!

For prepaid orders, the refund will be credited back to your original payment source (UPI, credit card, debit card, etc.) within 5–7 working days after the return item is received at our warehouse.

No additional bank details are required for prepaid refunds.

Feel free to contact us if you need any further assistance!

Thank you!
Team LamaStore`;

    default:
      return "";
  }
}

export function detectScenario(text: string): ScenarioId | null {
  const t = text.toLowerCase();

  // FAQ / policy scenarios — check before generic return checks
  if (
    t.includes("bad quality") ||
    t.includes("poor quality") ||
    t.includes("not good quality") ||
    t.includes("quality issue") ||
    t.includes("quality problem")
  )
    return "bad-quality";
  if (
    t.includes("price too high") ||
    t.includes("too expensive") ||
    t.includes("costly") ||
    t.includes("overpriced")
  )
    return "price-too-high";
  if (
    t.includes("what material") ||
    t.includes("material of") ||
    t.includes("fabric") ||
    t.includes("made of")
  )
    return "what-material";
  if (
    t.includes("length of tee") ||
    t.includes("tee length") ||
    t.includes("length of t-shirt") ||
    t.includes("how long is")
  )
    return "tee-length";
  if (
    t.includes("size variants") ||
    t.includes("size available") ||
    t.includes("available sizes") ||
    t.includes("sizes available") ||
    t.includes("what sizes")
  )
    return "size-variants";
  if (
    t.includes("any discount") ||
    t.includes("discount available") ||
    t.includes("offer available") ||
    t.includes("promo code") ||
    t.includes("coupon")
  )
    return "discount-available";
  if (
    t.includes("refund policy") ||
    t.includes("return policy") ||
    t.includes("how many days refund") ||
    t.includes("refund time")
  )
    return "refund-policy";
  if (
    t.includes("how to return") ||
    t.includes("return process") ||
    t.includes("how do i return") ||
    t.includes("return my order")
  )
    return "return-process";
  if (
    t.includes("cod refund") ||
    t.includes("cash on delivery refund") ||
    t.includes("refund for cod")
  )
    return "cod-refund-process";
  if (
    t.includes("prepaid refund") ||
    t.includes("refund for prepaid") ||
    t.includes("online payment refund") ||
    t.includes("refund for online")
  )
    return "prepaid-refund-process";

  // Order-specific scenarios
  if (t.includes("return") && (t.includes("cod") || t.includes("cash")))
    return "return-cod";
  if (
    t.includes("return") &&
    (t.includes("prepaid") || t.includes("online") || t.includes("paid online"))
  )
    return "return-prepaid";
  if (
    t.includes("delivery failed") ||
    t.includes("not delivered") ||
    t.includes("unable to deliver") ||
    t.includes("attempted delivery")
  )
    return "delivery-failed";
  if (
    t.includes("wrong") &&
    (t.includes("item") || t.includes("product") || t.includes("received"))
  )
    return "wrong-unit";
  if (t.includes("damaged") || t.includes("broken") || t.includes("defective"))
    return "damaged-unit";
  if (t.includes("cancel") && (t.includes("order") || t.includes("request")))
    return "order-cancellation";
  if (
    t.includes("abandoned") ||
    (t.includes("left") && (t.includes("cart") || t.includes("checkout")))
  )
    return "abandoned-checkout";
  if (
    t.includes("confirmation") &&
    (t.includes("not received") ||
      t.includes("not got") ||
      t.includes("didn't receive"))
  )
    return "order-confirmation";
  if (
    (t.includes("when") &&
      (t.includes("deliver") || t.includes("arrive") || t.includes("reach"))) ||
    (t.includes("estimated") && t.includes("delivery"))
  )
    return "estimate-delivery";
  if (
    t.includes("unfulfilled") ||
    t.includes("not fulfilled") ||
    t.includes("not shipped")
  )
    return "unfulfilled";
  if (t.includes("urgent") || t.includes("asap") || t.includes("immediate"))
    return "urgent-delivery";
  if (
    t.includes("under production") ||
    t.includes("being made") ||
    t.includes("manufacturing")
  )
    return "under-production";
  if (t.includes("cancelled")) return "cancelled";
  if (t.includes("return")) return "return-prepaid";

  return null;
}
