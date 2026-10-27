/**
 * Autonomous AI Social Media & Viral Traffic Engine
 * Automatically generates ready-to-post TikTok captions, Reels storyboards,
 * high-growth hashtags, influencer DMs, and 1-click WhatsApp viral broadcasts.
 */

class SocialTrafficService {
  constructor(storeUrl) {
    this.storeUrl = storeUrl || "https://aquaflow-autopilot-store.onrender.com";
  }

  generateSocialPack(product) {
    const title = product.title || "Viral Product";
    const category = product.category || "Viral Gadgets";
    const price = product.price || 39.99;
    const compare = product.compareAtPrice || (price * 2);
    const link = `${this.storeUrl}?product=${product.id || 'hero'}`;

    return {
      productId: product.id,
      productTitle: title,
      productLink: link,
      
      // 1. TikTok & Reels Ready-to-Post Pack
      tiktokReels: {
        hookAudioPrompt: `Lo-Fi Chill Beats / Trending TikTok Sound`,
        onScreenHookText: `“Wait… did that water droplet just fly BACKWARDS?! 😳”`,
        caption: `I bought that illegal-looking aesthetic gadget from TikTok and I’m genuinely shocked it actually works this well… 😭✨ Droplet levitation + ultrasonic flame mist is unreal.\n\n⚡ 50% OFF FLASH SALE + FREE SHIPPING today only!\n🔗 Tap link in bio to get yours before stock clears out!`,
        hashtags: [
          "#tiktokmademebuyit", "#viralproducts", "#musthaves", "#aestheticvibes",
          "#roomdecor", "#coolgadgets", "#unboxing", "#homehacks", "#founditonamazon",
          "#fyp", "#trending"
        ].join(' '),
        videoDirectives: [
          "🎬 [0-3s]: Film in a dim room. Turn on the device so the levitating drops catch the light instantly.",
          "✨ [3-8s]: Add 3 drops of lavender oil. Watch the mist billow like a crackling fireplace.",
          "💬 [8-15s]: Hold up phone camera close to show smooth levitation effect.",
          "👉 [15-20s]: Show 50% off store page with link in bio callout."
        ]
      },

      // 2. Instagram Story / Feed Post Pack
      instagram: {
        feedCaption: `Transforming our bedroom into a 5-star luxury sanctuary with the ${title}. 🕯️🌿\n\nExperience ultrasonic ambient mist and calming aromatherapy that melts away daily anxiety and fatigue.\n\n✨ 50% OFF Autumn Sale Active\n🚚 Free Priority Insured Shipping Worldwide\n🛡️ 30-Day Money-Back Guarantee\n\n👉 Tap link in bio or visit: ${this.storeUrl}`,
        storyIdea: "Poll Sticker: 'Would you put this in your room? 😍 YES / NEED IT'",
        hashtags: [
          "#aestheticdecor", "#homedesign", "#relaxingvibes", "#interiordetails",
          "#gadgetlovers", "#viralfinds", "#dailyessentials", "#luxuryliving"
        ].join(' ')
      },

      // 3. 1-Click WhatsApp / Telegram Viral Broadcast
      whatsappViralBlast: `🔥 *LOOK WHAT JUST DROPPED (50% OFF)* 🔥\n\nHey! Check out this viral ${title} everyone is obsessed with on TikTok right now! It levitates water droplets in mid-air and has an ultrasonic flame mist effect 🤯\n\nNormal Price: ~$${compare.toFixed(2)}\n*Flash Sale: $${price.toFixed(2)} (SAVE 50%)*\n\nIncludes Free Express Shipping & 30-Day Guarantee:\n👉 ${link}`,

      // 4. Micro-Influencer DM Pitch Template
      influencerDmPitch: `Hey [Creator Name]! 👋\n\nWe love your aesthetic content and think our viral ${title} would look incredible in your next room setup or GRWM video!\n\nWe’d love to send you a complimentary unit 🎁 PLUS give you a personalized promo code where you earn $10 for every follower who grabs one through your link.\n\nCheck out the product here: ${link}\n\nLet us know where to ship your package and we'll dispatch it today! 📦✨`
    };
  }
}

module.exports = SocialTrafficService;
