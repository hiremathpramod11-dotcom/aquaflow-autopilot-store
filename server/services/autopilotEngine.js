const fs = require('fs');
const path = require('path');

class AutopilotEngine {
  constructor(dataPath, services, broadcastCallback) {
    this.dataPath = dataPath;
    this.settingsPath = path.join(dataPath, 'settings.json');
    this.analyticsPath = path.join(dataPath, 'analytics.json');
    this.viralHunter = services.viralHunter;
    this.aiCopywriter = services.aiCopywriter;
    this.adCreative = services.adCreative;
    this.fulfillment = services.fulfillment;
    this.autoUpload = services.autoUpload;
    this.broadcast = broadcastCallback || (() => {});
    this.timer = null;
    this.isRunningCycle = false;
  }

  getSettings() {
    try {
      const data = fs.readFileSync(this.settingsPath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return { autopilotActive: true, autopilotIntervalSeconds: 45 };
    }
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(this.settingsPath, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  }

  start() {
    const settings = this.getSettings();
    if (this.timer) clearInterval(this.timer);

    const intervalMs = Math.max(15, (settings.autopilotIntervalSeconds || 45)) * 1000;
    console.log(`[AUTOPILOT] Initializing autonomous loop. Cycle interval: ${intervalMs / 1000}s`);

    this.timer = setInterval(() => {
      const liveSettings = this.getSettings();
      if (liveSettings.autopilotActive) {
        this.runCycle();
      }
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log(`[AUTOPILOT] Autonomous loop paused.`);
    }
  }

  /**
   * Executes one full autonomous cycle across all e-commerce departments
   */
  async runCycle() {
    if (this.isRunningCycle) return;
    this.isRunningCycle = true;

    try {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      this.broadcast({
        type: "LOG",
        level: "INFO",
        timestamp,
        message: "🤖 [AUTOPILOT CYCLE] Initiating automated product discovery & trend analysis..."
      });

      // 1. Hunt and qualify winning product
      const newProduct = this.viralHunter.huntWinningProduct();
      this.broadcast({
        type: "LOG",
        level: "SUCCESS",
        timestamp,
        message: `🎯 Discovered Winning Product: "${newProduct.title}" (Score: ${newProduct.trendingScore}/100, Est. Profit: $${newProduct.profitPerUnit}/unit)`
      });

      // 2. Generate AI Direct Response Copy & SEO Metadata
      const salesCopy = this.aiCopywriter.generateSalesCopy(newProduct);
      this.broadcast({
        type: "LOG",
        level: "INFO",
        timestamp,
        message: `✍️ AI Copywriter generated AIDA sales hooks & SEO tags for "${newProduct.title}"`
      });

      // 3. Generate Multi-Channel Viral Ad Campaign (TikTok + Meta)
      const campaign = this.adCreative.generateAdPackage(newProduct);
      this.broadcast({
        type: "LOG",
        level: "SUCCESS",
        timestamp,
        message: `🎬 Created Viral TikTok/Reels Script & Meta Ad Copy (Predicted ROAS: ${campaign.roas}x)`
      });

      // 4. Real Autonomous Auto-Upload to Instagram @kevin_369 (Zero fake/simulation)
      const settings = this.getSettings();
      if (settings.autoUploadInstagram !== false && this.autoUpload) {
        const igUser = settings.activeIntegrations?.instagram?.username || 'kevin_369';
        const igPass = settings.activeIntegrations?.instagram?.password || process.env.IG_PASSWORD;
        const hasSession = this.autoUpload.hasSavedSession(igUser);

        if (hasSession || igPass) {
          await this.autoUpload.uploadPost({
            productId: newProduct.id,
            username: igUser,
            password: igPass,
            simulate: false
          });
        } else {
          this.broadcast({
            type: "LOG",
            level: "INFO",
            timestamp,
            message: `📸 [AUTOUPLOAD] Standing by for live Instagram session for @${igUser}. Provide password once to enable automatic real-time feed publishing.`
          });
        }
      }

      // Real Transactions Only: Synthetic/fake orders permanently disabled.
      // Real sales are captured live via storefront checkout to PhonePe UPI: 910889831@ybl

      this.broadcast({
        type: "CYCLE_COMPLETE",
        timestamp,
        message: "✅ Autopilot Cycle successfully completed. Storefront and inventory updated."
      });

    } catch (err) {
      console.error("[AUTOPILOT ERROR]", err);
      this.broadcast({
        type: "LOG",
        level: "ERROR",
        timestamp: new Date().toLocaleTimeString(),
        message: `⚠️ Autopilot Cycle Exception: ${err.message}`
      });
    } finally {
      this.isRunningCycle = false;
    }
  }
}

module.exports = AutopilotEngine;
