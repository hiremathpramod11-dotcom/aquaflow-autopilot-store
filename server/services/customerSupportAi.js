class CustomerSupportAi {
  constructor(fulfillmentService) {
    this.fulfillmentService = fulfillmentService;
  }

  processMessage(userMessage, orderContext = null) {
    const text = (userMessage || "").toLowerCase();

    // 1. Where is my order / tracking
    if (text.includes("track") || text.includes("where") || text.includes("order") || text.includes("status")) {
      // Check if text has an order number like AQF-12345
      const match = text.match(/aqf-?\d+/i);
      if (match) {
        const orderId = match[0].toUpperCase().replace("AQF", "AQF-").replace("--", "-");
        const order = this.fulfillmentService.trackOrder(orderId);
        if (order) {
          return {
            reply: `Hello! I pulled up order **#${order.orderId}** for ${order.customer.name}.\n\n` +
                   `📍 **Status:** ${order.fulfillmentStatus}\n` +
                   `🚚 **Carrier:** ${order.carrier}\n` +
                   `📦 **Tracking Number:** \`${order.trackingNumber}\`\n\n` +
                   `Latest update: *${order.timeline[order.timeline.length - 1].status}* at ${order.timeline[order.timeline.length - 1].time}.\n\n` +
                   `You can track the live delivery route on our Tracking Portal!`,
            orderFound: true
          };
        } else {
          return {
            reply: `I checked our system for order **${match[0].toUpperCase()}**, but couldn't locate it yet. Please double-check your receipt email, or reply with your checkout email address so I can look it up for you!`,
            orderFound: false
          };
        }
      }
      return {
        reply: `I can look up your delivery status in 1 second! 🚚\n\nPlease reply with your **Order Number** (e.g., \`AQF-98241\`) or the email address you used at checkout.`,
        needsOrderId: true
      };
    }

    // 2. Shipping speed and delivery times
    if (text.includes("shipping") || text.includes("delivery") || text.includes("how long") || text.includes("arrive")) {
      return {
        reply: `🚀 **Shipping Times & Processing:**\n\n` +
               `• Orders are processed & dispatched within 24 hours via automated express supplier routing.\n` +
               `• **US Delivery:** 3 - 6 Business Days via USPS Priority / YunExpress.\n` +
               `• **International Delivery:** 5 - 10 Business Days via DHL Express.\n` +
               `• Every package includes **Free Insured Tracking** directly to your door!`,
        topic: "shipping"
      };
    }

    // 3. Return, refund, or guarantee policy
    if (text.includes("refund") || text.includes("return") || text.includes("guarantee") || text.includes("money back")) {
      return {
        reply: `🛡️ **Our 30-Day Risk-Free Guarantee:**\n\n` +
               `We offer a 100% money-back guarantee for 30 full days after delivery! If you're not completely obsessed with your purchase, simply send an email to **support@aquaflowdirect.com** with your order number. We'll issue an instant prepaid return label and prompt refund. Zero hassle!`,
        topic: "returns"
      };
    }

    // 4. Discounts, coupons, deals
    if (text.includes("discount") || text.includes("coupon") || text.includes("code") || text.includes("cheap") || text.includes("deal")) {
      return {
        reply: `🎉 You unlocked an exclusive VIP deal!\n\nUse code **AUTOPILOT20** at checkout for an extra **20% OFF** your entire cart + Free Expedited Shipping! ⚡`,
        topic: "discount"
      };
    }

    // Default friendly assistant response
    return {
      reply: `Hi there! 👋 Welcome to AquaFlow Direct Support AI.\n\n` +
             `I can help you with:\n` +
             `• **Order Tracking & WISMO** ("Where is order AQF-98241?")\n` +
             `• **Shipping & Delivery Times** ("How fast do you ship?")\n` +
             `• **Returns & 30-Day Guarantee** ("What is your refund policy?")\n` +
             `• **VIP Discount Coupons** ("Do you have any discount codes?")\n\n` +
             `How can I assist your order today?`,
      topic: "general"
    };
  }
}

module.exports = CustomerSupportAi;
