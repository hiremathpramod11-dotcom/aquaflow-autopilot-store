import sys
import time
import requests
from colorama import init, Fore, Style

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

init(autoreset=True)

BASE_URL = "http://localhost:3000/api"

def print_banner():
    print(Fore.CYAN + "=" * 70)
    print(Fore.CYAN + "🌊 AQUAFLOW AUTOPILOT OS -- COMMAND CLI DAEMON")
    print(Fore.GREEN + "   STATUS: AUTONOMOUS RUNNER ACTIVE | EARN LIKE WATER IN SEA")
    print(Fore.CYAN + "=" * 70)

def poll_and_report():
    try:
        res = requests.get(f"{BASE_URL}/analytics", timeout=3)
        if res.status_code == 200:
            ana = res.json()
            rev = ana.get("totalRevenue", 0)
            prof = ana.get("netProfit", 0)
            orders = ana.get("totalOrders", 0)
            roas = ana.get("blendedRoas", 3.4)
            visitors = ana.get("activeVisitorsNow", 45)

            print(Fore.WHITE + f"\n[{time.strftime('%H:%M:%S')}] TELEMETRY UPDATE:")
            print(Fore.BLUE + f"   💰 Gross Revenue:   ${rev:,.2f}")
            print(Fore.GREEN + f"   💎 Net Profit:      ${prof:,.2f} (~70% margin)")
            print(Fore.YELLOW + f"   📦 Total Orders:    {orders} orders")
            print(Fore.MAGENTA + f"   ⚡ Blended ROAS:    {roas}x")
            print(Fore.CYAN + f"   👥 Live Visitors:   {visitors} on store")
            return True
    except Exception as e:
        print(Fore.RED + f"[{time.strftime('%H:%M:%S')}] Waiting for local server at http://localhost:3000... ({e})")
        return False

def trigger_cycle():
    try:
        res = requests.post(f"{BASE_URL}/autopilot/trigger", timeout=5)
        if res.status_code == 200:
            print(Fore.GREEN + f"[{time.strftime('%H:%M:%S')}] [CYCLE TRIGGERED] Autonomous cycle executed successfully!")
    except Exception as e:
        print(Fore.RED + f"Cycle error: {e}")

def main():
    print_banner()
    print(Fore.YELLOW + "Starting telemetry polling loop (Press Ctrl+C to exit)...")
    
    cycle_counter = 0
    while True:
        connected = poll_and_report()
        time.sleep(15)
        cycle_counter += 1
        
        # Trigger an extra cycle every 45s
        if cycle_counter % 3 == 0 and connected:
            trigger_cycle()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(Fore.YELLOW + "\n[AUTOPILOT CLI] Stopped by user.")
