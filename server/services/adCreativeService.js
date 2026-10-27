const fs = require('fs');
const path = require('path');

class AdCreativeService {
  constructor(dataPath) {
    this.adCampaignsPath = path.join(dataPath, 'ad_campaigns.json');
  }

  getCampaigns() {
    try {
      const data = fs.readFileSync(this.adCampaignsPath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  saveCampaigns(campaigns) {
    fs.writeFileSync(this.adCampaignsPath, JSON.stringify(campaigns, null, 2), 'utf8');
  }

  generateAdPackage(product) {
    const hooks = [
      `Wait, why didn't anybody tell me about this ${product.category} hack sooner?! 😱`,
      `If you're still doing this manually in 2026, you need to watch this right now...`,
      `TikTok made me buy it: Honest review of the viral ${product.title}!`
    ];

    const campaign = {
      id: `ad_${Date.now()}`,
      productId: product.id,
      productTitle: product.title,
      platform: "TikTok / Meta Multi-Channel",
      status: "READY_TO_SCALE",
      roas: Number((3.2 + Math.random() * 1.6).toFixed(2)),
      hooks: hooks,
      videoScript: {
        duration: "25 - 30 seconds",
        pacing: "Fast direct-response UGC format",
        scenes: [
          {
            time: "0:00 - 0:03",
            visual: `High-energy hook clip displaying ${product.title} solving immediate problem`,
            audio: hooks[0]
          },
          {
            time: "0:03 - 0:10",
            visual: "Visual pain point agitation (frustration with old, slow, expensive alternatives)",
            audio: `I spent months dealing with this frustration until I found this exact tool.`
          },
          {
            time: "0:10 - 0:20",
            visual: "Demonstration of features in action with satisfying ASMR sounds",
            audio: product.hook || `It works in seconds and completely transforms your routine.`
          },
          {
            time: "0:20 - 0:28",
            visual: "Unboxing + 50% discount banner callout",
            audio: `They just started their 50% off seasonal flash sale with free shipping. Hit the link below to get yours before it sells out!`
          }
        ]
      },
      metaAdCopy: {
        primaryText: `⚡ UPGRADE YOUR ROUTINE IN SECONDS!\n\nMeet the all-new ${product.title}.\n\n✅ Over 1,000+ Verified 5-Star Reviews\n✅ 30-Day Risk-Free Money Back Guarantee\n✅ Free Priority Insured Shipping Worldwide\n\n👉 Tap 'Shop Now' to lock in your 50% discount today while supplies last!`,
        headline: `${product.title} (50% OFF FLASH DEAL)`,
        cta: "Shop Now"
      },
      audienceTargeting: {
        interests: [product.category, "Online Shopping", "Innovative Products", "Gadgets & Gear"],
        age: "21 - 55",
        gender: "All",
        placements: ["TikTok FYP", "Instagram Reels", "Facebook Feed"]
      }
    };

    const campaigns = this.getCampaigns();
    campaigns.unshift(campaign);
    this.saveCampaigns(campaigns);
    return campaign;
  }
}

module.exports = AdCreativeService;
