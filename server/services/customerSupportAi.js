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
    if (text.includes("refund") || text.includes("return") || text.includes("guarantee") || text.includes("replacement") || text.includes("damaged")) {
      return {
        reply: `🛡️ **Our 7-Day Hassle-Free Defect Replacement Policy:**\n\n` +
               `We stand 100% behind the quality of our factory-direct products! If your item arrives with any transit damage or manufacturing defect, simply email **support@aquaflowdirect.com** with a short unboxing video/photo within 7 days of delivery. Our automated team will dispatch a brand-new replacement unit to your doorstep immediately at zero cost! (To protect low factory pricing, we do not accept opened returns for change of mind).`,
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
             `• **7-Day Replacement Policy** ("What is your replacement policy?")\n` +
             `• **VIP Discount Coupons** ("Do you have any discount codes?")\n\n` +
             `How can I assist your order today?`,
      topic: "general"
    };
  }
}

module.exports = CustomerSupportAi;
