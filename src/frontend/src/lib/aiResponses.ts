export type Intent =
  | "greeting"
  | "tracking"
  | "delay"
  | "cancellation"
  | "return_cod"
  | "return_prepaid"
  | "refund"
  | "damaged"
  | "wrong_item"
  | "quality"
  | "price"
  | "material"
  | "size"
  | "discount"
  | "delivery_estimate"
  | "account"
  | "billing"
  | "complaint"
  | "fallback";

export function detectIntent(message: string): Intent {
  const m = message.toLowerCase();

  if (/\b(hi|hello|hey|good morning|good evening|howdy|sup)\b/.test(m))
    return "greeting";
  if (
    /track|where is|status|shipped|dispatched|order status|order update|location/.test(
      m,
    )
  )
    return "tracking";
  if (
    /delay|late|not arrived|expected|when will|how long|still waiting|overdue/.test(
      m,
    )
  )
    return "delay";
  if (/cancel|cancellation|call off|stop order|withdraw/.test(m))
    return "cancellation";
  if (
    /return.*cod|cod.*return|cash on delivery.*return|refund.*cod|cod.*refund/.test(
      m,
    )
  )
    return "return_cod";
  if (/return.*prepaid|prepaid.*return|refund.*prepaid|prepaid.*refund/.test(m))
    return "return_prepaid";
  if (/refund|money back|reimburse|reimbursement/.test(m)) return "refund";
  if (/damage|damaged|broken|defective|cracked|torn|spoiled/.test(m))
    return "damaged";
  if (
    /wrong item|wrong product|incorrect|received wrong|not what i ordered|different item/.test(
      m,
    )
  )
    return "wrong_item";
  if (/quality|bad quality|poor quality|not good quality|cheap|flimsy/.test(m))
    return "quality";
  if (/price|too expensive|costly|cheaper|pricing|cost/.test(m)) return "price";
  if (/material|fabric|made of|composition|cotton|polyester/.test(m))
    return "material";
  if (/size|sizing|fit|measurements|length|dimensions|chart/.test(m))
    return "size";
  if (/discount|promo|coupon|offer|sale|deal|voucher/.test(m))
    return "discount";
  if (/deliver|delivery time|estimated|when.*arrive|arrival/.test(m))
    return "delivery_estimate";
  if (/account|login|password|sign in|profile|email/.test(m)) return "account";
  if (/bill|billing|charge|payment|invoice|transaction/.test(m))
    return "billing";
  if (/complaint|complain|unhappy|dissatisfied|frustrated|angry/.test(m))
    return "complaint";

  return "fallback";
}

export function getLocalResponse(
  intent: Intent,
  customerName?: string,
): string {
  const name = customerName?.trim() || "there";

  const responses: Record<Intent, string> = {
    greeting: `Hi ${name}! 😊 Welcome to LamaStore Support. I'm your AI assistant and I'm here to help you with any questions about your orders, returns, shipping, or anything else. What can I do for you today?`,

    tracking: `Hi ${name}! I'd be happy to help you track your order. 📦\n\nTo look up your shipment status, please share your Order ID (e.g., #123456) and I'll pull up the latest tracking information right away.\n\nYou can also check real-time updates directly on our tracking page using your order number and registered email.`,

    delay: `Hi ${name}, I completely understand your concern and I sincerely apologize for the delay. 🙏\n\nShipping delays can sometimes occur due to high demand, weather conditions, or courier issues. Here's what I suggest:\n\n1. Check your tracking link for the latest status update\n2. If your order is more than 5 days overdue, please share your Order ID and I'll escalate it immediately\n\nRest assured, we're doing everything we can to get your order to you as soon as possible. Thank you for your patience! 💙`,

    cancellation: `Hi ${name}, I've received your cancellation request. Here's what happens next:\n\n✅ If your order hasn't been shipped yet: We can cancel it immediately and initiate a refund (for prepaid orders) within 5-7 business days.\n\n⚠️ If your order is already shipped: Unfortunately we cannot cancel it at this stage. You can refuse the delivery or initiate a return once you receive it.\n\nPlease share your Order ID so I can check the current status and proceed accordingly. We're here to help! 😊`,

    return_cod: `Hi ${name}! For returning a Cash on Delivery (COD) order:\n\n📋 **Return Process:**\n1. Initiate return within 7 days of delivery\n2. Keep items in original packaging with tags intact\n3. Our team will schedule a pickup within 2-3 business days\n\n💰 **Refund for COD orders:**\nSince payment was made in cash, your refund will be credited to your bank account. Please keep your bank details handy when our team contacts you.\n\nShare your Order ID to get started! 🙌`,

    return_prepaid: `Hi ${name}! Here's how to return your prepaid order:\n\n📋 **Return Process:**\n1. Request a return within 7 days of delivery\n2. Ensure items are unused with original tags and packaging\n3. We'll arrange a free pickup from your doorstep\n\n💰 **Refund Timeline:**\nYour refund will be credited back to your original payment source (card/UPI/wallet) within 5-7 business days after we receive and inspect the item.\n\nShare your Order ID and I'll initiate the process right away! 😊`,

    refund: `Hi ${name}! I understand you're looking for information about your refund. Here's our policy:\n\n⏱️ **Refund Timeline:**\n- Prepaid orders: 5-7 business days back to original payment method\n- COD orders: 7-10 business days to your registered bank account\n\n📊 **Refund Status:** If your refund has been initiated, check with your bank or payment provider. The reference number will be sent to your registered email.\n\nIf you haven't received your refund within the expected time, please share your Order ID and I'll look into it immediately! 💙`,

    damaged: `Hi ${name}, I'm truly sorry to hear your order arrived damaged! 😔 That's definitely not the experience we want for you.\n\nTo resolve this quickly, please:\n\n📸 Share clear photos of:\n1. The damaged item\n2. The outer packaging\n3. The shipping label\n\nOnce I review the photos, we'll arrange a replacement or full refund — whichever you prefer — at absolutely no cost to you. Your satisfaction is our top priority! 🌟`,

    wrong_item: `Hi ${name}, I sincerely apologize for sending you the wrong item! That must be very frustrating and we take full responsibility. 🙏\n\nHere's what we'll do:\n✅ Arrange an immediate pickup of the wrong item\n✅ Send you the correct product with priority shipping\n✅ No extra cost to you whatsoever\n\nPlease share your Order ID and photos of the item you received, and we'll sort this out for you right away! 💙`,

    quality: `Hi ${name}, I'm sorry to hear you're not satisfied with the quality of your purchase. Your feedback matters a lot to us! 🙏\n\nWe stand behind our products and offer:\n✅ Easy returns within 7 days if the quality doesn't meet your expectations\n✅ Full refund or exchange on quality complaints\n\nCould you share what specifically disappointed you? This helps us improve. Also, please share your Order ID so I can check your purchase details and process a resolution right away! 💙`,

    price: `Hi ${name}! I understand you feel the price is on the higher side. Here's why our pricing reflects great value:\n\n✨ **What you get:**\n- Premium quality materials\n- Rigorous quality control checks\n- Hassle-free returns within 7 days\n- Dedicated customer support\n\n💰 **Save more with:**\n- Subscribe to our newsletter for exclusive deals\n- Follow us on social media for flash sales\n- Check our "Sale" section for discounted items\n\nUse code **LAMA10** for 10% off your next order! 🎉`,

    material: `Hi ${name}! Great question about our materials! 🌿\n\nOur products are made from:\n✨ **Premium 100% Cotton** — soft, breathable, and skin-friendly\n🌱 **Sustainable Sourcing** — ethically produced materials\n🎨 **Reactive Dyes** — vibrant colors that stay wash after wash\n\nWash Care:\n- Machine wash cold (30°C)\n- Gentle cycle\n- Do not bleach\n- Tumble dry low\n\nIf you have a specific product in mind, share the item name and I'll give you the exact material composition! 😊`,

    size: `Hi ${name}! Here's our size guide to help you pick the perfect fit:\n\n📏 **Size Chart (in inches):**\n| Size | Chest | Length | Shoulder |\n|------|-------|--------|----------|\n| S    | 38    | 27     | 16       |\n| M    | 40    | 28     | 17       |\n| L    | 42    | 29     | 18       |\n| XL   | 44    | 30     | 19       |\n| XXL  | 46    | 31     | 20       |\n\n💡 **Tip:** If you're between sizes, we recommend sizing up for a relaxed fit.\n\nNeed help with a specific item? Just ask! 😊`,

    discount: `Hi ${name}! 🎉 Great news — we have some exciting offers for you:\n\n🏷️ **Current Offers:**\n- **WELCOME15** — 15% off your first order\n- **LAMA10** — 10% off on orders above ₹999\n- Free shipping on orders above ₹799\n\n📧 **Get more deals:**\n- Subscribe to our newsletter for exclusive member discounts\n- Follow @LamaStore on Instagram for flash sale announcements\n- Download our app for app-only special prices\n\nWant me to check if any specific offer applies to your cart? 😊`,

    delivery_estimate: `Hi ${name}! Here are our standard delivery timelines:\n\n🚚 **Delivery Estimates:**\n- Metro cities (Mumbai, Delhi, Bangalore, etc.): **2-3 business days**\n- Tier 2 cities: **3-5 business days**\n- Remote areas / Tier 3 cities: **5-7 business days**\n\n⚡ **Express Delivery** (select cities): Next day or same-day delivery available at checkout.\n\nOnce your order is shipped, you'll receive a tracking link via SMS and email.\n\nShare your pincode and I can give you a more precise estimate! 📍`,

    account: `Hi ${name}! I can help you with your account. 🔐\n\n**Common Account Solutions:**\n- **Forgot password?** Click "Forgot Password" on the login page — a reset link will be sent to your email\n- **Can't access email?** Contact us with your registered phone number for account recovery\n- **Update details?** Log in → My Account → Edit Profile\n\nFor security reasons, I'm unable to make account changes directly through chat. Please visit our website or app for account management.\n\nIs there something specific I can help you with? 😊`,

    billing: `Hi ${name}! For billing related queries, here's what I can help with:\n\n💳 **Payment Methods Accepted:**\n- Credit/Debit Cards (Visa, Mastercard, RuPay)\n- UPI (GPay, PhonePe, Paytm)\n- Net Banking\n- Cash on Delivery (COD)\n- EMI options available\n\n🧾 **Invoice/Receipt:** Your invoice is automatically emailed after every order. You can also download it from My Orders section.\n\n⚠️ **Payment Issues?** If you were charged but order wasn't placed, the amount will be auto-refunded within 3-5 business days.\n\nShare your Order ID for specific billing queries! 😊`,

    complaint: `Hi ${name}, I'm truly sorry to hear you've had a frustrating experience. 😔 Your satisfaction means everything to us and we take your feedback very seriously.\n\nI want to make this right for you. Could you please tell me more about what happened? Specifically:\n\n1. Your Order ID\n2. What went wrong\n3. How you'd like this resolved\n\nI'll personally ensure this is handled with the highest priority. We appreciate your patience and the opportunity to make things right. 🙏💙`,

    fallback: `Hi ${name}! 😊 Thanks for reaching out to LamaStore Support.\n\nI want to make sure I give you the most accurate help. Could you provide a bit more detail about your query?\n\nYou can ask me about:\n📦 Order tracking & status\n🔄 Returns & refunds\n🚚 Delivery & shipping\n❌ Order cancellation\n👕 Product information\n💰 Discounts & offers\n\nOr you can reach us directly:\n📧 support@lamastore.com\n📞 1800-XXX-XXXX (Mon-Sat, 9am-7pm)\n\nHow can I help you today? 🌟`,
  };

  return responses[intent];
}
