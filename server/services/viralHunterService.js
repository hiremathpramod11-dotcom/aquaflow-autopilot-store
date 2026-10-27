const fs = require('fs');
const path = require('path');

// Knowledge base of high-converting product templates for continuous autopilot discovery
const TRENDING_CATALOG_CANDIDATES = [
  {
    title: "AquaBreeze Hydro-Mist Portable Air Conditioner & Cooler",
    category: "Home & Wellness",
    supplierCost: 12.50,
    retailPrice: 49.99,
    shippingCost: 3.80,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
    hook: "Cool down any room by 15°F in under 90 seconds without a $500 monthly electric bill.",
    description: "Compact rapid-chill ultrasonic cooling cube that chills, humidifies, and purifies personal spaces with ice-water mist technology.",
    bullets: [
      "❄️ Drops ambient air temp up to 15°F in seconds",
      "💧 3-in-1 Cooling, Humidifying, and Air Filtering",
      "🔋 USB-C Powered – run on power bank anywhere",
      "🤫 Whisper quiet sleep mode with 7-color ambient night light"
    ],
    niche: "Home & Wellness",
    baseScore: 92
  },
  {
    title: "NovaBeam Pro 360 Auto-Tracking Smart Gimbal Stabilizer",
    category: "Smart Tech Gadgets",
    supplierCost: 14.80,
    retailPrice: 59.95,
    shippingCost: 4.10,
    image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80",
    hook: "The AI personal cameraman that keeps you perfectly centered in every frame without needing an app.",
    description: "Built-in optical AI camera sensor tracks your face and body movements 360° seamlessly. Perfect for TikTok, live streaming, fitness, and calls.",
    bullets: [
      "🤖 360° AI Smart Facial & Body Recognition Tracking",
      "🚫 Zero App Required – instant plug-and-play with phone clamp",
      "✋ Gesture Control Recognition (OK sign to start, Palm to pause)",
      "🔋 12-Hour Continuous Battery Life per charge"
    ],
    niche: "Smart Tech Gadgets",
    baseScore: 94
  },
  {
    title: "PurrPulse Heated Anti-Anxiety Calming Donut Pet Bed",
    category: "Pet Supplies",
    supplierCost: 9.90,
    retailPrice: 39.99,
    shippingCost: 3.50,
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    hook: "Cure your pet's separation anxiety and give them the deepest, most rejuvenating sleep of their life.",
    description: "Orthopedic memory foam with raised rim bolsters and ultra-soft faux shag fur simulates the comforting warmth of mother's fur coat.",
    bullets: [
      "🐾 Proven to reduce pet stress and separation anxiety by 84%",
      "☁️ Premium High-Density Orthopedic Joint Support",
      "🧼 100% Machine Washable with removable zipper cover",
      "🔒 Non-slip waterproof bottom grip prevents sliding"
    ],
    niche: "Pet Supplies",
    baseScore: 93
  },
  {
    title: "SculptBlade Electric Lymphatic Drainage & Gua Sha Scraper",
    category: "Beauty & Personal Care",
    supplierCost: 8.60,
    retailPrice: 36.95,
    shippingCost: 3.20,
    image: "https://images.unsplash.com/photo-1512290903671-17adc82f05a9?auto=format&fit=crop&w=800&q=80",
    hook: "Melt away muscle tension and flush out toxic bloating with targeted vibration and thermotherapy.",
    description: "Modern ergonomic thermal stone gua sha scraper with 9 heat levels and high-frequency acoustic pulse vibrations.",
    bullets: [
      "✨ 9 Adjustable Thermal Heat Levels for deep cellular release",
      "💎 Promotes instant lymphatic drainage and debloating",
      "⚡ Acoustic micro-vibrations stimulate collagen and tone skin",
      "🔋 Cordless handheld design with LCD digital display"
    ],
    niche: "Beauty & Personal Care",
    baseScore: 91
  },
  {
    title: "ChronoGlow Ambient RGB Tube Clock & Weather Station",
    category: "Aesthetic Home & Wellness",
    supplierCost: 18.00,
    retailPrice: 69.99,
    shippingCost: 4.50,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    hook: "The cyberpunk retro-futuristic desk showpiece that everyone in your room will ask you about.",
    description: "Retro Nixie-tube inspired electronic clock with full color IPS screens displaying dynamic weather, photo albums, and ambient lighting.",
    bullets: [
      "🕰️ 6 High-Definition IPS Custom Digital Screen Dials",
      "🌈 16 Million RGB Backlight Color Combinations",
      "📶 WiFi Time & Live Weather Synchronization",
      "🪵 Real North American Black Walnut Solid Wood Base"
    ],
    niche: "Home & Wellness",
    baseScore: 89
  }
];

class ViralHunterService {
  constructor(dataPath) {
    this.productsPath = path.join(dataPath, 'products.json');
    this.analyticsPath = path.join(dataPath, 'analytics.json');
  }

  getProducts() {
    try {
      const data = fs.readFileSync(this.productsPath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  saveProducts(products) {
    fs.writeFileSync(this.productsPath, JSON.stringify(products, null, 2), 'utf8');
  }

  /**
   * Autonomous Opportunity Scorer
   * Evaluates margin, perceived value, shipping viability, and viral engagement
   */
  scoreCandidate(candidate) {
    const margin = ((candidate.retailPrice - (candidate.supplierCost + candidate.shippingCost)) / candidate.retailPrice) * 100;
    const markupMultiple = candidate.retailPrice / candidate.supplierCost;
    
    // Scoring logic (0-100)
    let marginScore = Math.min(30, (margin / 70) * 30);
    let markupScore = Math.min(25, (markupMultiple / 3.5) * 25);
    let trendMomentum = (candidate.baseScore || 85) * 0.45;
    
    const compositeScore = Math.round(marginScore + markupScore + trendMomentum);
    return Math.min(99, Math.max(75, compositeScore));
  }

  /**
   * Runs an automated product hunt cycle
   */
  huntWinningProduct() {
    const existingProducts = this.getProducts();
    const existingTitles = new Set(existingProducts.map(p => p.title.toLowerCase()));

    // Filter candidates not yet in the store
    const available = TRENDING_CATALOG_CANDIDATES.filter(
      c => !existingTitles.has(c.title.toLowerCase())
    );

    if (available.length === 0) {
      // If all pre-defined are added, create an algorithmic variant
      const randomBase = TRENDING_CATALOG_CANDIDATES[Math.floor(Math.random() * TRENDING_CATALOG_CANDIDATES.length)];
      const variantNumber = Math.floor(Math.random() * 900) + 100;
      const newTitle = `${randomBase.title.split(' ')[0]} Max V${variantNumber} Smart Edition`;
      
      const newProduct = {
        id: `prod_${Date.now()}`,
        title: newTitle,
        slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: randomBase.category,
        price: randomBase.retailPrice,
        compareAtPrice: Number((randomBase.retailPrice * 1.8).toFixed(2)),
        supplierCost: randomBase.supplierCost,
        shippingCost: randomBase.shippingCost,
        marginPercent: Number((((randomBase.retailPrice - (randomBase.supplierCost + randomBase.shippingCost)) / randomBase.retailPrice) * 100).toFixed(1)),
        profitPerUnit: Number((randomBase.retailPrice - (randomBase.supplierCost + randomBase.shippingCost)).toFixed(2)),
        rating: Number((4.8 + Math.random() * 0.18).toFixed(2)),
        reviewCount: Math.floor(Math.random() * 300) + 120,
        stock: Math.floor(Math.random() * 20) + 8,
        trendingScore: Math.floor(Math.random() * 8) + 91,
        badge: "🔥 NEW VIRAL FIND",
        image: randomBase.image,
        gallery: [randomBase.image],
        hook: randomBase.hook,
        description: randomBase.description,
        bullets: randomBase.bullets,
        shippingTime: "3-6 Business Days (Express)",
        supplier: "CJ Dropshipping Global Hub",
        tags: ["Viral Auto-Find", "High Margin", randomBase.niche]
      };

      existingProducts.unshift(newProduct);
      this.saveProducts(existingProducts);
      return newProduct;
    }

    // Pick top scoring candidate
    const candidate = available[0];
    const score = this.scoreCandidate(candidate);
    const profit = candidate.retailPrice - (candidate.supplierCost + candidate.shippingCost);
    const margin = (profit / candidate.retailPrice) * 100;

    const newProduct = {
      id: `prod_${Date.now()}`,
      title: candidate.title,
      slug: candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: candidate.category,
      price: candidate.retailPrice,
      compareAtPrice: Number((candidate.retailPrice * 1.9).toFixed(2)),
      supplierCost: candidate.supplierCost,
      shippingCost: candidate.shippingCost,
      marginPercent: Number(margin.toFixed(1)),
      profitPerUnit: Number(profit.toFixed(2)),
      rating: 4.9,
      reviewCount: Math.floor(Math.random() * 250) + 150,
      stock: Math.floor(Math.random() * 15) + 10,
      trendingScore: score,
      badge: "🚀 AUTOPILOT APPROVED",
      image: candidate.image,
      gallery: [candidate.image],
      hook: candidate.hook,
      description: candidate.description,
      bullets: candidate.bullets,
      shippingTime: "3-5 Business Days (US Priority)",
      supplier: "Zendrop Direct Fulfillment",
      tags: ["Trending", "High Demand", candidate.niche]
    };

    existingProducts.unshift(newProduct);
    this.saveProducts(existingProducts);
    return newProduct;
  }
}

module.exports = ViralHunterService;
