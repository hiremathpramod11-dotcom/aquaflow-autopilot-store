import sys
import os
import json
import csv
import argparse

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Safe colorama import
try:
    from colorama import init, Fore, Style
    init(autoreset=True)
except ImportError:
    class DummyColor:
        def __getattr__(self, name):
            return ""
    Fore = DummyColor()
    Style = DummyColor()

"""
AquaFlow Direct - Unit Economics & Profit Mastery Calculator (Production Edition)
Calculates real-world dropshipping economics factoring in:
- COGS (Supplier + Shipping)
- Payment Gateway Fees (e.g., 2.9% + $0.30)
- Refund / Return Reserve Allowance (3-5%)
- Chargeback / Dispute buffer
- Amortized Store & App Overhead (Shopify, Klaviyo, Loox, domain)
- Damage / Reshipment buffer
- CAC Ceiling (Max allowable CPA for breakeven)
- Breakeven ROAS & Target ROAS for desired net margin
- Bundle / Tiered AOV Upsell multipliers (Buy 1 vs Buy 2 vs Buy 3)
"""

def calculate_dropship_economics(
    supplier_cost,
    shipping_cost,
    target_margin_percent=70.0,
    retail_price=None,
    est_cpa=12.0,
    return_rate_percent=4.0,
    gateway_percent=2.9,
    gateway_fixed=0.30,
    overhead_per_order=1.50,
    damage_reserve=0.50,
    target_net_margin_percent=25.0
):
    cogs = round(supplier_cost + shipping_cost, 2)
    
    # Determine retail price (either explicitly provided or derived from target gross margin)
    if retail_price is None or retail_price <= 0:
        margin_factor = 1 - (target_margin_percent / 100.0)
        margin_factor = max(margin_factor, 0.05)  # avoid division by zero
        calculated_price = round(cogs / margin_factor, 2)
    else:
        calculated_price = round(retail_price, 2)

    gross_profit = round(calculated_price - cogs, 2)
    gross_margin_pct = round((gross_profit / calculated_price) * 100.0, 1) if calculated_price > 0 else 0

    # Payment gateway deduction (e.g., Stripe/Shopify Payments: 2.9% + $0.30)
    gateway_fee = round((calculated_price * (gateway_percent / 100.0)) + gateway_fixed, 2)

    # Return & refund reserve (dropshipping standard 3-5%)
    refund_reserve = round(calculated_price * (return_rate_percent / 100.0), 2)

    # Total operating friction before ad spend
    operating_costs = round(gateway_fee + refund_reserve + overhead_per_order + damage_reserve, 2)

    # Net contribution margin before ad spend
    contribution_margin = round(gross_profit - operating_costs, 2)

    # CAC Ceiling: The absolute maximum you can spend on ads per customer to break even ($0 net profit)
    cac_ceiling = max(0.0, contribution_margin)

    # Breakeven ROAS: Retail Price / CAC Ceiling
    breakeven_roas = round(calculated_price / cac_ceiling, 2) if cac_ceiling > 0 else 999.0

    # Net profit assuming current estimated CPA
    net_profit_after_ads = round(contribution_margin - est_cpa, 2)
    net_margin_percent = round((net_profit_after_ads / calculated_price) * 100.0, 1) if calculated_price > 0 else 0

    # Target ROAS needed to pocket target_net_margin_percent (e.g. 25% pure net profit)
    target_profit_dollars = calculated_price * (target_net_margin_percent / 100.0)
    target_max_cpa = contribution_margin - target_profit_dollars
    if target_max_cpa > 0:
        target_roas = round(calculated_price / target_max_cpa, 2)
    else:
        target_roas = None  # mathematically impossible without raising price or lowering costs

    # Bundle Upsell Modeling (1 unit vs 2 units with 10% off vs 3 units with 20% off)
    # Crucial insight: Ad CPA is paid ONLY ONCE per order, making multi-item bundles dramatically more profitable!
    bundle_models = []
    tiers = [
        (1, 0.0, "Single Item"),
        (2, 0.10, "Buy 2 (Get 10% OFF - Popular Gift)"),
        (3, 0.20, "Buy 3 (Get 20% OFF - Best Value Bundle)")
    ]

    for qty, discount, label in tiers:
        b_cogs = round(cogs * qty, 2)
        b_price = round((calculated_price * qty) * (1 - discount), 2)
        b_gross = round(b_price - b_cogs, 2)
        b_gateway = round((b_price * (gateway_percent / 100.0)) + gateway_fixed, 2)
        b_refund = round(b_price * (return_rate_percent / 100.0), 2)
        b_overhead = round(overhead_per_order + (damage_reserve * qty), 2)
        b_contrib = round(b_gross - (b_gateway + b_refund + b_overhead), 2)
        b_net_profit = round(b_contrib - est_cpa, 2)  # CPA is fixed per customer transaction!
        b_net_margin = round((b_net_profit / b_price) * 100.0, 1) if b_price > 0 else 0

        bundle_models.append({
            "qty": qty,
            "label": label,
            "retail_price": b_price,
            "cogs": b_cogs,
            "net_profit": b_net_profit,
            "net_margin": b_net_margin
        })

    return {
        "cogs": cogs,
        "supplier_cost": supplier_cost,
        "shipping_cost": shipping_cost,
        "retail_price": calculated_price,
        "gross_profit": gross_profit,
        "gross_margin_percent": gross_margin_pct,
        "gateway_fee": gateway_fee,
        "refund_reserve": refund_reserve,
        "overhead_per_order": overhead_per_order,
        "damage_reserve": damage_reserve,
        "operating_costs": operating_costs,
        "contribution_margin": contribution_margin,
        "cac_ceiling": cac_ceiling,
        "breakeven_roas": breakeven_roas,
        "est_cpa": est_cpa,
        "net_profit_after_ads": net_profit_after_ads,
        "net_margin_percent": net_margin_percent,
        "target_net_margin_percent": target_net_margin_percent,
        "target_roas": target_roas,
        "target_max_cpa": round(target_max_cpa, 2) if target_max_cpa else 0,
        "bundles": bundle_models
    }

def print_banner():
    print(Fore.CYAN + "=" * 70)
    print(Fore.CYAN + "🌊 AQUAFLOW DIRECT - UNIT ECONOMICS & PROFIT MASTERY CALCULATOR")
    print(Fore.GREEN + "   EARN LIKE WATER IN SEA | REAL-WORLD P&L & ROAS CEILING ENGINE")
    print(Fore.CYAN + "=" * 70)

def print_result_card(name, res):
    print(Fore.YELLOW + f"\n[PRODUCT] 📦 {name}")
    print(Fore.WHITE + "-" * 70)
    print(Fore.WHITE + f"   Supplier Cost + Shipping (COGS): ${res['cogs']:.2f} (${res['supplier_cost']:.2f} + ${res['shipping_cost']:.2f})")
    print(Fore.WHITE + f"   Retail Selling Price:            ${res['retail_price']:.2f}")
    print(Fore.WHITE + f"   Gross Profit:                    ${res['gross_profit']:.2f} ({res['gross_margin_percent']}% Gross Margin)")
    
    print(Fore.LIGHTBLACK_EX + f"   ---------------- Operating Deductions ----------------")
    print(Fore.LIGHTBLACK_EX + f"   • Gateway Fee (2.9% + $0.30):    -${res['gateway_fee']:.2f}")
    print(Fore.LIGHTBLACK_EX + f"   • Refund & Dispute Reserve (4%): -${res['refund_reserve']:.2f}")
    print(Fore.LIGHTBLACK_EX + f"   • App & Store Overhead:          -${res['overhead_per_order']:.2f}")
    print(Fore.LIGHTBLACK_EX + f"   • Damage & Reship Reserve:       -${res['damage_reserve']:.2f}")
    print(Fore.LIGHTBLACK_EX + f"   Total Deductions:                -${res['operating_costs']:.2f}")
    
    print(Fore.CYAN + f"   ---------------- Contribution & Ad Ceilings ----------------")
    print(Fore.CYAN + f"   💎 Contribution Margin:          ${res['contribution_margin']:.2f}")
    print(Fore.RED  + f"   🚨 CAC Ceiling (Max Ad CPA):     ${res['cac_ceiling']:.2f} (Over this = LOSING MONEY)")
    print(Fore.BLUE + f"   🎯 Breakeven ROAS Needed:        {res['breakeven_roas']}x")
    if res['target_roas']:
        print(Fore.MAGENTA + f"   🏆 Target ROAS for {res['target_net_margin_percent']}% Net:    {res['target_roas']}x (Target Ad CPA: ${res['target_max_cpa']:.2f})")
    else:
        print(Fore.MAGENTA + f"   🏆 Target ROAS for {res['target_net_margin_percent']}% Net:    (Increase price to reach target)")

    print(Fore.GREEN + f"   ---------------- Net Bottom Line (At ${res['est_cpa']:.2f} CPA) ----------------")
    if res['net_profit_after_ads'] > 0:
        print(Fore.GREEN + f"   💰 PURE NET PROFIT / UNIT:       ${res['net_profit_after_ads']:.2f} ({res['net_margin_percent']}% Net Margin)")
    else:
        print(Fore.RED   + f"   ⚠️ NET LOSS / UNIT:             ${res['net_profit_after_ads']:.2f} ({res['net_margin_percent']}%) - LOWER AD CPA OR RAISE PRICE")

    print(Fore.LIGHTBLUE_EX + f"   ---------------- AOV Bundle Multiplier Impact ----------------")
    for b in res['bundles']:
        star = "★" if b['qty'] > 1 else " "
        print(Fore.LIGHTBLUE_EX + f"   {star} [{b['qty']}x] {b['label']:<40} Price: ${b['retail_price']:.2f} | Net: ${b['net_profit']:.2f} ({b['net_margin']}%)")

def run_interactive():
    print_banner()
    print(Fore.YELLOW + "\n[INTERACTIVE WIZARD] Enter your product specs to calculate profitability:")
    try:
        name = input(Fore.WHITE + "Enter Product Name (or press Enter for 'Custom Product'): ").strip() or "Custom Product"
        supplier_cost = float(input(Fore.WHITE + "Supplier Item Cost ($ USD) [e.g. 9.50]: ").strip() or "9.50")
        shipping_cost = float(input(Fore.WHITE + "Supplier Shipping Cost ($ USD) [e.g. 3.50]: ").strip() or "3.50")
        
        price_input = input(Fore.WHITE + "Target Retail Price ($ USD) (Leave empty to auto-calculate at 70% margin): ").strip()
        retail_price = float(price_input) if price_input else None
        
        cpa_input = input(Fore.WHITE + "Estimated Ad CPA ($ USD) [default: 12.00]: ").strip()
        est_cpa = float(cpa_input) if cpa_input else 12.00

        res = calculate_dropship_economics(
            supplier_cost=supplier_cost,
            shipping_cost=shipping_cost,
            retail_price=retail_price,
            est_cpa=est_cpa
        )
        print_result_card(name, res)
    except ValueError as e:
        print(Fore.RED + f"Invalid input format: {e}")
    except KeyboardInterrupt:
        print(Fore.YELLOW + "\nCancelled by user.")

def analyze_store_inventory():
    """Reads live products from server/data/products.json and analyzes all items."""
    print_banner()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(current_dir, "..", "server", "data", "products.json"),
        os.path.join(current_dir, "server", "data", "products.json"),
        os.path.join("server", "data", "products.json")
    ]
    products_path = None
    for c in candidates:
        if os.path.exists(c):
            products_path = c
            break

    if not products_path:
        print(Fore.RED + "[ERROR] Could not locate server/data/products.json.")
        return

    try:
        with open(products_path, "r", encoding="utf-8") as f:
            products = json.load(f)
        
        print(Fore.GREEN + f"\n[*] Loaded {len(products)} active products from store database ({products_path})")
        print(Fore.WHITE + f"[*] Running real-world Unit Economics audit across all inventory...\n")

        for prod in products[:8]:  # Analyze top 8 products to prevent scroll flood
            title = prod.get("title", "Unnamed")
            sup = float(prod.get("supplierCost", 10.0))
            ship = float(prod.get("shippingCost", 3.5))
            price = float(prod.get("price", 39.99))
            
            res = calculate_dropship_economics(
                supplier_cost=sup,
                shipping_cost=ship,
                retail_price=price,
                est_cpa=12.0
            )
            print_result_card(title, res)
        
        if len(products) > 8:
            print(Fore.YELLOW + f"\n... and {len(products) - 8} more products in database.")
    except Exception as e:
        print(Fore.RED + f"Failed to read inventory: {e}")

def main():
    parser = argparse.ArgumentParser(description="AquaFlow Unit Economics & ROAS Calculator")
    parser.add_argument("-i", "--interactive", action="store_true", help="Launch interactive step-by-step calculator")
    parser.add_argument("--store", action="store_true", help="Audit all products from server/data/products.json")
    parser.add_argument("--cost", type=float, default=None, help="Supplier product cost in USD")
    parser.add_argument("--ship", type=float, default=None, help="Supplier shipping cost in USD")
    parser.add_argument("--price", type=float, default=None, help="Retail selling price in USD")
    parser.add_argument("--margin", type=float, default=70.0, help="Target gross margin percentage (default: 70.0)")
    parser.add_argument("--cpa", type=float, default=12.0, help="Estimated ad CPA in USD (default: 12.0)")
    parser.add_argument("--name", type=str, default="Custom Product", help="Product title")
    parser.add_argument("--export-json", type=str, default=None, help="Export result to a JSON file")

    args = parser.parse_args()

    if args.interactive:
        run_interactive()
        return

    if args.store:
        analyze_store_inventory()
        return

    if args.cost is not None and args.ship is not None:
        print_banner()
        res = calculate_dropship_economics(
            supplier_cost=args.cost,
            shipping_cost=args.ship,
            target_margin_percent=args.margin,
            retail_price=args.price,
            est_cpa=args.cpa
        )
        print_result_card(args.name, res)
        if args.export_json:
            with open(args.export_json, "w", encoding="utf-8") as f:
                json.dump({"product": args.name, "economics": res}, f, indent=2)
            print(Fore.GREEN + f"\n[EXPORT] Economics exported to {args.export_json}")
        return

    # Default: Run test cases and display tips
    print_banner()
    test_cases = [
        ("Lumina Mist Anti-Gravity Humidifier", 8.40, 3.50, 70.0, 10.0),
        ("SonicGlow 7-in-1 Facial Wand", 11.20, 3.80, 70.0, 12.0),
        ("AuraGrip 10,000mAh Magnetic Powerbank", 9.50, 3.20, 68.0, 9.5),
        ("ThermoPulse Neck Massager", 14.50, 4.50, 68.0, 14.0)
    ]

    for name, sup, ship, margin, cpa in test_cases:
        res = calculate_dropship_economics(
            supplier_cost=sup,
            shipping_cost=ship,
            target_margin_percent=margin,
            est_cpa=cpa
        )
        print_result_card(name, res)

    print(Fore.CYAN + "\n" + "=" * 70)
    print(Fore.WHITE + "💡 Quick Commands:")
    print(Fore.YELLOW + "   python automation/profit_calculator.py -i           (Interactive wizard)")
    print(Fore.YELLOW + "   python automation/profit_calculator.py --store      (Audit live store products.json)")
    print(Fore.YELLOW + "   python automation/profit_calculator.py --cost 9 --ship 3.5 --price 39.99 --cpa 11")
    print(Fore.CYAN + "=" * 70)

if __name__ == "__main__":
    main()

    print(Fore.CYAN + "\n" + "=" * 70)
    print(Fore.WHITE + "💡 Quick Commands:")
    print(Fore.YELLOW + "   python automation/profit_calculator.py -i           (Interactive wizard)")
    print(Fore.YELLOW + "   python automation/profit_calculator.py --store      (Audit live store products.json)")
    print(Fore.YELLOW + "   python automation/profit_calculator.py --cost 9 --ship 3.5 --price 39.99 --cpa 11")
    print(Fore.CYAN + "=" * 70)

if __name__ == "__main__":
    main()

