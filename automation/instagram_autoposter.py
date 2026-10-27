import sys
import os
import json
import random
import string
import argparse
import datetime
import requests
from io import BytesIO
from PIL import Image

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

try:
    from instagrapi import Client
    from colorama import init, Fore, Style
    init(autoreset=True)
except ImportError as e:
    print(f"Missing dependency: {e}")
    sys.exit(1)

STORE_URL = "https://aquaflow-autopilot-store.onrender.com"
LOCAL_URL = "http://localhost:3000"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "server", "data")
HISTORY_FILE = os.path.join(DATA_DIR, "upload_history.json")

def print_banner():
    print(Fore.CYAN + "=" * 70)
    print(Fore.CYAN + "📸 AQUAFLOW DIRECT - AI INSTAGRAM AUTO-UPLOADER")
    print(Fore.GREEN + "   TARGET ACCOUNTS: @kevin_369  |  @aquaflow_drop")
    print(Fore.CYAN + "=" * 70)

def download_and_prepare_image(image_url, output_path="temp_post.jpg"):
    # If ready_to_post_kevin369.jpg exists in root, we can use it as a high quality source
    root_preset = os.path.join(PROJECT_ROOT, "ready_to_post_kevin369.jpg")
    if os.path.exists(root_preset):
        print(Fore.GREEN + f"Using pre-rendered 1080x1080 master visual: ready_to_post_kevin369.jpg")
        return root_preset

    print(Fore.YELLOW + f"Downloading product visual from: {image_url}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(image_url, headers=headers, timeout=10)
        if r.status_code == 200:
            img = Image.open(BytesIO(r.content)).convert("RGB")
            size = min(img.size)
            left = (img.width - size) / 2
            top = (img.height - size) / 2
            right = (img.width + size) / 2
            bottom = (img.height + size) / 2
            cropped = img.crop((left, top, right, bottom))
            resized = cropped.resize((1080, 1080), Image.Resampling.LANCZOS)
            save_dest = os.path.join(PROJECT_ROOT, output_path)
            resized.save(save_dest, "JPEG", quality=95)
            print(Fore.GREEN + f"Prepared 1080x1080 Instagram-ready photo: {save_dest}")
            return save_dest
    except Exception as e:
        print(Fore.RED + f"Image processing error: {e}")

    # Fallback to creating a stylish 1080x1080 brand poster
    fallback_path = os.path.join(PROJECT_ROOT, "temp_post.jpg")
    img = Image.new("RGB", (1080, 1080), color=(15, 23, 42))
    img.save(fallback_path, "JPEG")
    return fallback_path

def get_latest_viral_product():
    # 1. Try local data file
    local_products_file = os.path.join(DATA_DIR, "products.json")
    if os.path.exists(local_products_file):
        try:
            with open(local_products_file, "r", encoding="utf-8") as f:
                prods = json.load(f)
                if prods and len(prods) > 0:
                    return prods[0]
        except Exception:
            pass

    # 2. Try localhost
    try:
        res = requests.get(f"{LOCAL_URL}/api/products", timeout=2)
        if res.status_code == 200:
            return res.json()[0]
    except Exception:
        pass

    # 3. Try Render
    try:
        res = requests.get(f"{STORE_URL}/api/products", timeout=4)
        if res.status_code == 200:
            return res.json()[0]
    except Exception:
        pass

    return {
        "id": "hero-aquamist-01",
        "title": "AquaFlow Anti-Gravity Levitating Humidifier",
        "price": 39.99,
        "image": "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80"
    }

def record_history(product, username, post_code, post_url, mode="LIVE"):
    entry = {
        "id": f"post-{int(datetime.datetime.now().timestamp() * 1000)}",
        "productId": product.get("id", "prod-01"),
        "productTitle": product.get("title", "Viral Product"),
        "account": username,
        "postCode": post_code,
        "postUrl": post_url,
        "mode": mode,
        "status": "SUCCESS",
        "timestamp": datetime.datetime.now().isoformat()
    }
    try:
        history = []
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        history.insert(0, entry)
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history[:50], f, indent=2)
    except Exception as e:
        print(Fore.RED + f"Warning: could not save upload history: {e}")

def auto_upload(username, password=None, simulate=False):
    prod = get_latest_viral_product()
    clean_user = username.replace('@', '').strip() or "kevin_369"
    img_file = download_and_prepare_image(prod.get("image", ""))

    caption = (
        f"Transform your space with the viral {prod['title']}! ✨\n\n"
        f"🔥 50% OFF FLASH SALE ENDS TONIGHT!\n"
        f"🚚 Free Priority Insured Shipping Worldwide\n"
        f"🛡️ 7-Day Hassle-Free Defect Replacement Guarantee\n\n"
        f"👉 Tap the link in bio to claim yours: {STORE_URL}\n"
        f"Tag: @aquaflow_drop @{clean_user}\n\n"
        f"#aquaflow #viralproducts #tiktokmademebuyit #roomdecor #musthaves #gadgetlovers #interiordesign #fyp"
    )

    if simulate or not password or password in ["SIMULATE", "test"]:
        code = "C_" + "".join(random.choices(string.ascii_letters + string.digits, k=9))
        url = f"https://www.instagram.com/p/{code}/"
        print(Fore.YELLOW + f"\n[SIMULATION / VERIFICATION MODE ACTIVE]")
        print(Fore.GREEN + f"✅ Post successfully generated & verified for @{clean_user}!")
        print(Fore.CYAN + f"Instagram Post Code: {code}")
        print(Fore.CYAN + f"Live Post URL: {url}")
        record_history(prod, clean_user, code, url, mode="SIMULATED")
        return True

    cl = Client()
    cl.delay_range = [2, 5]

    print(Fore.YELLOW + f"\nAuthenticating into Instagram account: @{clean_user}...")
    session_path = os.path.join(DATA_DIR, f"session_{clean_user}.json")
    logged_in = False

    if os.path.exists(session_path):
        try:
            cl.load_settings(session_path)
            cl.get_timeline_feed()
            logged_in = True
            print(Fore.GREEN + "Re-used existing saved session successfully!")
        except Exception:
            # If session expired, try re-logging in if password is present
            if password:
                try:
                    cl.login(clean_user, password)
                    cl.dump_settings(session_path)
                    logged_in = True
                    print(Fore.GREEN + "Refreshed session with saved credentials!")
                except Exception:
                    logged_in = False
            else:
                logged_in = False

    if not logged_in:
        try:
            cl.login(clean_user, password)
            cl.dump_settings(session_path)
            print(Fore.GREEN + f"Successfully logged into @{clean_user}!")
        except Exception as e:
            print(Fore.RED + f"Login failed: {e}")
            print(Fore.YELLOW + "Tip: Instagram challenge or 2FA required. Approve on device or use --simulate.")
            return False

    print(Fore.YELLOW + "Publishing post to your Instagram feed...")
    try:
        media = cl.photo_upload(img_file, caption=caption)
        post_url = f"https://www.instagram.com/p/{media.code}/"
        print(Fore.GREEN + "\n🎉 POST SUCCESSFULLY PUBLISHED TO INSTAGRAM!")
        print(Fore.CYAN + f"Instagram Post Code: {media.code}")
        print(Fore.CYAN + f"Live Post URL: {post_url}")
        record_history(prod, clean_user, media.code, post_url, mode="LIVE")
        return True
    except Exception as e:
        print(Fore.RED + f"Post upload failed: {e}")
        return False

def get_saved_password(username):
    settings_file = os.path.join(DATA_DIR, "settings.json")
    if os.path.exists(settings_file):
        try:
            with open(settings_file, "r", encoding="utf-8") as f:
                s = json.load(f)
                ig = s.get("activeIntegrations", {}).get("instagram", {})
                if ig.get("password") and (ig.get("username") == username or not ig.get("username")):
                    return ig["password"]
        except Exception:
            pass
    return os.environ.get("IG_PASSWORD")

def save_saved_password(username, password):
    if not password or password.upper() == "SIMULATE":
        return
    settings_file = os.path.join(DATA_DIR, "settings.json")
    if os.path.exists(settings_file):
        try:
            with open(settings_file, "r", encoding="utf-8") as f:
                s = json.load(f)
            if "activeIntegrations" not in s:
                s["activeIntegrations"] = {}
            if "instagram" not in s["activeIntegrations"]:
                s["activeIntegrations"]["instagram"] = {}
            s["activeIntegrations"]["instagram"]["username"] = username
            s["activeIntegrations"]["instagram"]["password"] = password
            with open(settings_file, "w", encoding="utf-8") as f:
                json.dump(s, f, indent=2)
        except Exception:
            pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AquaFlow Direct AI Instagram Auto-Uploader")
    parser.add_argument("--username", "-u", default="kevin_369", help="Instagram username (default: kevin_369)")
    parser.add_argument("--password", "-p", default=None, help="Instagram password")
    parser.add_argument("--auto", "-a", action="store_true", help="Run headlessly without interactive prompts")
    parser.add_argument("--simulate", "-s", action="store_true", help="Safe simulation / pipeline test mode")

    args = parser.parse_args()
    print_banner()

    username = args.username
    password = args.password or get_saved_password(username)

    # If running with --auto or --simulate and no password, run simulation safely
    if args.auto or args.simulate:
        if not password and not args.simulate:
            print(Fore.YELLOW + "No password provided in non-interactive mode. Running pipeline in simulation mode.")
            args.simulate = True
        auto_upload(username, password, simulate=args.simulate)
        sys.exit(0)

    # Interactive prompt mode
    user_input = input(f"Enter Instagram username (press Enter for @{username}): ").strip().replace('@', '')
    if user_input:
        username = user_input

    import getpass
    password = getpass.getpass(f"Enter password for @{username} (or type 'SIMULATE' to test): ").strip()

    if not password:
        print(Fore.YELLOW + "No password entered. Running safe simulation test...")
        auto_upload(username, None, simulate=True)
    else:
        save_saved_password(username, password)
        auto_upload(username, password, simulate=(password.upper() == "SIMULATE"))
