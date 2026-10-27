import sys
import os
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
SESSION_FILE = "instagram_session.json"

def print_banner():
    print(Fore.CYAN + "=" * 70)
    print(Fore.CYAN + "📸 AQUAFLOW DIRECT - AI INSTAGRAM AUTO-UPLOADER")
    print(Fore.GREEN + "   ACCOUNTS: @aquaflow_drop  |  @kevin_369")
    print(Fore.CYAN + "=" * 70)

def download_and_prepare_image(image_url, output_path="temp_post.jpg"):
    print(Fore.YELLOW + f"Downloading product visual from: {image_url}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(image_url, headers=headers, timeout=10)
    if r.status_code != 200:
        raise Exception(f"Failed to download image (status: {r.status_code})")
    
    img = Image.open(BytesIO(r.content)).convert("RGB")
    
    # Instagram requires 1:1 or 4:5 aspect ratio
    # Let's crop or pad to 1080x1080
    size = min(img.size)
    left = (img.width - size) / 2
    top = (img.height - size) / 2
    right = (img.width + size) / 2
    bottom = (img.height + size) / 2
    cropped = img.crop((left, top, right, bottom))
    resized = cropped.resize((1080, 1080), Image.Resampling.LANCZOS)
    resized.save(output_path, "JPEG", quality=95)
    print(Fore.GREEN + f"Prepared 1080x1080 Instagram-ready photo: {output_path}")
    return output_path

def get_latest_viral_product():
    res = requests.get(f"{STORE_URL}/api/products", timeout=5)
    if res.status_code == 200:
        products = res.json()
        return products[0]
    raise Exception("Could not fetch products from store")

def auto_upload(username, password):
    cl = Client()
    cl.delay_range = [2, 5]

    print(Fore.YELLOW + f"\nAuthenticating into Instagram account: @{username}...")
    
    # Try session load if available
    session_path = f"session_{username}.json"
    logged_in = False
    if os.path.exists(session_path):
        try:
            cl.load_settings(session_path)
            cl.login(username, password)
            logged_in = True
            print(Fore.GREEN + "Re-used existing saved session!")
        except Exception:
            logged_in = False

    if not logged_in:
        try:
            cl.login(username, password)
            cl.dump_settings(session_path)
            print(Fore.GREEN + f"Successfully logged into @{username}!")
        except Exception as e:
            print(Fore.RED + f"Login failed: {e}")
            print(Fore.YELLOW + "Tip: If Instagram sent a verification code to your phone/email, check your app or email.")
            return False

    # Get product
    prod = get_latest_viral_product()
    img_file = download_and_prepare_image(prod["image"])

    # High-converting caption
    caption = (
        f"Transform your space with the viral {prod['title']}! ✨\n\n"
        f"🔥 50% OFF FLASH SALE ENDS TONIGHT!\n"
        f"🚚 Free Priority Insured Shipping Worldwide\n"
        f"🛡️ 30-Day Money-Back Guarantee\n\n"
        f"👉 Tap the link in bio to claim yours: {STORE_URL}\n"
        f"Tag: @aquaflow_drop @kevin_369\n\n"
        f"#aquaflow #viralproducts #tiktokmademebuyit #roomdecor #musthaves #gadgetlovers #interiordesign #fyp"
    )

    print(Fore.YELLOW + "Publishing post to your feed...")
    media = cl.photo_upload(img_file, caption=caption)
    print(Fore.GREEN + "\n🎉 POST SUCCESSFULLY PUBLISHED TO INSTAGRAM!")
    print(Fore.CYAN + f"Instagram Post Code: {media.code}")
    print(Fore.CYAN + f"Live Post URL: https://www.instagram.com/p/{media.code}/")
    return True

if __name__ == "__main__":
    print_banner()
    
    username = input("Enter Instagram username (e.g. aquaflow_drop or kevin_369): ").strip().replace('@', '')
    if not username:
        username = "aquaflow_drop"
        
    import getpass
    password = getpass.getpass(f"Enter password for @{username}: ").strip()
    
    if not password:
        print(Fore.RED + "Password cannot be empty.")
        sys.exit(1)
        
    try:
        auto_upload(username, password)
    except Exception as e:
        print(Fore.RED + f"Upload error: {e}")
