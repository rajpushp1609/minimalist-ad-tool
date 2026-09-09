import os
import re
import html
import logging
from urllib.parse import urlparse
from flask import Flask, render_template, request, jsonify
import requests
import certifi
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("minimalist_ad_tool")

app = Flask(__name__)

# Authentic Minimalist presets with strictly scraped data (no invented claims)
SAMPLE_PRESETS = [
    {
        "id": "massage-oil",
        "url": "https://beminimalist.co/products/pediatrics-provitamin-d3-massage-oil",
        "name": "Provitamin D3 Massage Oil",
        "active_ingredient": "Provitamin D3",
        "price": "₹569 / 100ml",
        "image_url": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/MassageOilNew.png?v=1721398127",
        "description": "Crafted with nourishing Coconut, Sunflower, Safflower & Almond Oils enriched with Provitamin D3 to protect delicate skin and prevent moisture loss.",
        "free_from": "Fragrance Free • Sulfates Free • Essential Oils Free • Mineral Oil Free • Dyes Free • Parabens Free",
        "tested_for": "Proven Safe: Clinically Tested to be Hypoallergenic, Non-Comedogenic, Sensitive skin safe, Pediatrician-approved & Kind to Biome Certified, this oil is clinically validated for safety.",
        "cta": "Shop Now at beminimalist.co"
    },
    {
        "id": "retinol-0-6",
        "url": "https://beminimalist.co/products/retinol-0-6",
        "name": "Retinol 0.6% Face Serum",
        "active_ingredient": "Retinol 0.6%",
        "price": "₹617 / 30ml",
        "image_url": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/Retinol_06_New.png?v=1721398129",
        "description": "Medium strength Retinol formula in pure squalane for fading fine lines, smoothing uneven texture, and promoting cellular turnover.",
        "free_from": "Fragrance Free • Non-comedogenic • Essential Oil Free",
        "tested_for": "The product has been evaluated for safety through patch testing under the supervision of a Dermatologist.",
        "cta": "Shop Now at beminimalist.co"
    },
    {
        "id": "copper-peptide",
        "url": "https://beminimalist.co/products/copper_peptide_pdrn_1-25_face_serum",
        "name": "Copper Peptide + PDRN 1.25% Face Serum",
        "active_ingredient": "Copper Peptide + PDRN 1.25%",
        "price": "₹664 / 30ml",
        "image_url": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/CopyofArtboard1_2.jpg?v=1757069577",
        "description": "Advanced anti-aging serum enriched with Sodium DNA and multi-molecular Hyaluronic Acid to restore skin firmness, elasticity, and cellular repair.",
        "free_from": "Fragrance Free • Silicones Free • Parabens Free • Sulfates Free • Dyes Free • Essential Oils Free",
        "tested_for": "",  # Not on page -> left blank
        "cta": "Shop Now at beminimalist.co"
    },
    {
        "id": "hair-growth-15-6",
        "url": "https://beminimalist.co/products/hair-growth-anti-grey-actives-15-6-hair-serum",
        "name": "Hair Growth + Anti-Grey 15.6% Hair Serum",
        "active_ingredient": "Hair Growth + Anti-Grey 15.6%",
        "price": "₹854 / 50ml",
        "image_url": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/websiteimage_shadow_texture.jpg?v=1785500401",
        "description": "Advanced formulation powered by a 15.6% blend of 6 proven actives to visibly reduce grey hair density, minimize hair fall, and support follicular growth.",
        "free_from": "Fragrance free • Silicones free • Parabens free • Sulfates free • Dyes free • Essential Oils free",
        "tested_for": "",  # Not on page -> left blank
        "cta": "Shop Now at beminimalist.co"
    }
]

def clean_text(raw_html):
    """Strip HTML tags, unescape entities, and collapse whitespace."""
    if not raw_html:
        return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    text = soup.get_text(separator=" ")
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_active_ingredient(title, desc=""):
    """Heuristically extract active ingredient name and percentage from title or description. Never invent."""
    # Pattern with percentage, e.g. "Retinol 0.6%", "Niacinamide 10%", "Copper Peptide + PDRN 1.25%"
    match = re.search(r"([A-Za-z0-9\+\-\s]+?\b\d+(?:\.\d+)?%)", title)
    if match:
        return match.group(1).strip()
    
    # Known key skincare/haircare active names without percentage
    known_actives = [
        "Provitamin D3", "Vitamin C", "Vitamin B12", "Vitamin B5", "Niacinamide",
        "Salicylic Acid", "L-Ascorbic Acid", "Hyaluronic Acid", "Polyhydroxy Acid",
        "Alpha Arbutin", "Tranexamic", "Kojic Acid", "Glycolic Acid", "Lactic Acid",
        "Mandelic Acid", "Azelaic Acid", "Ceramide", "Peptide", "PDRN", "Retinal",
        "Retinol", "Squalane", "Marula Oil", "Bifida Ferment", "Zinc Oxide", "HOCL"
    ]
    for act in known_actives:
        if re.search(r'\b' + re.escape(act) + r'\b', title, re.I):
            return act

    # Strip product form suffixes
    cleaned = re.sub(r"(Face|Hair|Body|Baby)?\s*(Serum|Moisturizer|Cleanser|Toner|Shampoo|Cream|Balm|Oil|Massage|Lotion|Bag|Pouch|Kit|Set).*$", "", title, flags=re.IGNORECASE).strip()
    if cleaned and cleaned.lower() not in ["minimalist", "the", "free", "gift"]:
        for act in known_actives:
            if re.search(r'\b' + re.escape(act) + r'\b', cleaned, re.I):
                return cleaned

    return ""

def extract_free_from(soup, raw_desc):
    """
    Extract authentic free-from claims dynamically from product page icons and text.
    Never invent claims. Returns empty string if not found on page.
    """
    icons = []
    # Check PDP icons list
    for container in soup.find_all(class_=re.compile(r'product-icons-list|pdp_icon_lists|free_from|claims-icons', re.I)):
        for item in container.find_all(['p', 'span', 'li']):
            t = clean_text(item.get_text())
            if t and len(t) < 35 and not item.find(['p', 'span', 'li']):
                if t not in icons:
                    icons.append(t)
    if icons:
        return " • ".join(icons)

    # Check description text for 'Free From:' pattern
    m = re.search(r'([Ff]ree\s+[Ff]rom\s*:[^<\n\.]+)', raw_desc)
    if m:
        return clean_text(m.group(1))

    return ""

def extract_tested_for(soup, raw_desc):
    """
    Extract clinical test claims (e.g. Proven Safe / Clinically Tested / Patch Tested).
    Never invent claims. Returns empty string if not found on page.
    """
    full_desc_clean = clean_text(raw_desc)

    # 1. Check for 'Proven Safe:' specifically
    m = re.search(r'(Proven Safe:\s*.*?(?:\.|\bvalidated for safety\b[^\.]*\.?))', full_desc_clean, re.I)
    if m:
        return m.group(1).strip()

    for tag in soup.find_all(['span', 'p', 'div', 'li']):
        t = clean_text(tag.get_text())
        if t.lower().startswith('proven safe:'):
            return t

    # 2. Check for explicit clinical test / laboratory citations on page
    for tag in soup.find_all(['p', 'span', 'li', 'div']):
        t = clean_text(tag.get_text())
        if any(k in t.lower() for k in ['tested at princeton', 'patch tested in presence of', 'evaluated for safety through patch testing']):
            if 25 < len(t) < 220 and not tag.find(['p', 'div']):
                return t

    # 3. Check for independent lab / human test citations
    for tag in soup.find_all(['p', 'span', 'em']):
        t = clean_text(tag.get_text())
        if 'all tests are conducted on humans' in t.lower() or ('clinically tested to be' in t.lower() and len(t) < 220):
            if 25 < len(t) < 220 and not tag.find(['p', 'div']):
                return t

    return ""

def fetch_beminimalist_product(url):
    """
    Fetch and parse a beminimalist.co product page server-side.
    Uses certifi for SSL verification.
    First attempts Shopify's native .js endpoint, then falls back to HTML parsing (JSON-LD & OpenGraph).
    Leaves fields blank if not found on page. Never invents claims.
    """
    if not url or not isinstance(url, str):
        raise ValueError("No URL provided")

    url = url.strip()
    parsed = urlparse(url)

    if not parsed.scheme:
        url = "https://" + url
        parsed = urlparse(url)

    hostname = (parsed.hostname or "").lower()
    if "beminimalist.co" not in hostname:
        raise ValueError(f"URL hostname '{hostname}' is not beminimalist.co. Only beminimalist.co product pages are supported.")

    if "/products/" not in parsed.path:
        raise ValueError(f"URL path '{parsed.path}' is not a product page. Expected path like /products/<product-name>.")

    clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip("/")
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8"
    }

    product_data = {
        "name": "",
        "price": "",
        "description": "",
        "image_url": "",
        "active_ingredient": "",
        "free_from": "",
        "tested_for": "",
        "cta": "Shop Now at beminimalist.co",
        "url": clean_url
    }

    raw_js_desc = ""

    # Step 1: Try Shopify .js endpoint (fast, structured JSON)
    js_url = clean_url + ".js"
    logger.info("Attempting to fetch Shopify JSON from %s", js_url)
    try:
        r = requests.get(js_url, headers=headers, verify=certifi.where(), timeout=12)
        if r.status_code == 200:
            data = r.json()
            title = (data.get("title") or "").strip()
            if title:
                product_data["name"] = title
                product_data["active_ingredient"] = extract_active_ingredient(title)

            # Price in cents/paise
            price_raw = data.get("price")
            if price_raw:
                val = float(price_raw) / 100.0
                product_data["price"] = f"₹{int(val)}" if val == int(val) else f"₹{val:.2f}"

            # Featured image
            img = data.get("featured_image")
            if img:
                if img.startswith("//"):
                    img = "https:" + img
                product_data["image_url"] = img

            raw_js_desc = data.get("description") or ""
            desc = clean_text(raw_js_desc)
            if desc:
                product_data["description"] = desc
            logger.info("Successfully parsed Shopify JSON for '%s'", product_data["name"])
    except Exception as e:
        logger.warning("Shopify .js endpoint failed for %s: %s. Falling back to HTML scraping.", js_url, str(e))

    # Step 2: Fetch HTML page directly (for free-from icons, clinical tests, meta tags, JSON-LD)
    logger.info("Fetching full HTML page from %s", clean_url)
    try:
        r = requests.get(clean_url, headers=headers, verify=certifi.where(), timeout=12)
        if r.status_code != 200:
            logger.error("HTTP error fetching %s: status %s %s", clean_url, r.status_code, r.reason)
            if not product_data["name"]:
                raise ValueError(f"HTTP {r.status_code} ({r.reason}) when fetching product page")
        else:
            soup = BeautifulSoup(r.text, "html.parser")

            # Extract dynamic free-from claims from product page icons
            product_data["free_from"] = extract_free_from(soup, raw_js_desc)

            # Extract dynamic tested_for claims
            product_data["tested_for"] = extract_tested_for(soup, raw_js_desc)

            # Check JSON-LD
            for script in soup.find_all("script", type="application/ld+json"):
                try:
                    import json
                    ld = json.loads(script.string or "")
                    items = ld if isinstance(ld, list) else [ld]
                    for item in items:
                        if item.get("@type") == "Product":
                            if not product_data["name"] and item.get("name"):
                                product_data["name"] = item.get("name").strip()
                                product_data["active_ingredient"] = extract_active_ingredient(product_data["name"])

                            if not product_data["price"]:
                                offers = item.get("offers", [])
                                offer = offers[0] if isinstance(offers, list) and offers else (offers if isinstance(offers, dict) else {})
                                p = offer.get("price")
                                if p:
                                    pval = float(p)
                                    product_data["price"] = f"₹{int(pval)}" if pval == int(pval) else f"₹{pval:.2f}"

                            if not product_data["image_url"]:
                                img_info = item.get("image")
                                if isinstance(img_info, str):
                                    product_data["image_url"] = img_info
                                elif isinstance(img_info, dict):
                                    product_data["image_url"] = img_info.get("url") or img_info.get("image")
                                elif isinstance(img_info, list) and img_info:
                                    product_data["image_url"] = img_info[0] if isinstance(img_info[0], str) else img_info[0].get("url")

                            ld_desc = clean_text(item.get("description"))
                            if not product_data["description"] and ld_desc and len(ld_desc) > 30:
                                product_data["description"] = ld_desc
                except Exception:
                    pass

            # OpenGraph and Meta tags fallback
            og_desc = soup.find("meta", property="og:description")
            meta_desc = soup.find("meta", attrs={"name": "description"})
            marketing_desc = ""
            if og_desc and og_desc.get("content"):
                marketing_desc = clean_text(og_desc["content"])
            elif meta_desc and meta_desc.get("content"):
                marketing_desc = clean_text(meta_desc["content"])

            if marketing_desc and len(marketing_desc) > 25 and (not product_data["description"] or len(product_data["description"]) < 35):
                product_data["description"] = marketing_desc

            if not product_data["image_url"]:
                og_img = soup.find("meta", property="og:image")
                if og_img and og_img.get("content"):
                    product_data["image_url"] = og_img["content"]

            if not product_data["name"]:
                og_title = soup.find("meta", property="og:title")
                if og_title and og_title.get("content"):
                    product_data["name"] = og_title["content"].strip()
                    product_data["active_ingredient"] = extract_active_ingredient(product_data["name"])

    except Exception as e:
        logger.error("Failed to fetch/parse HTML for %s: %s", clean_url, str(e), exc_info=True)
        if not product_data["name"]:
            raise

    # Final normalization
    if product_data["image_url"] and product_data["image_url"].startswith("//"):
        product_data["image_url"] = "https:" + product_data["image_url"]

    # Ensure empty string if field could not be extracted (NEVER invent claims)
    if product_data["free_from"] is None:
        product_data["free_from"] = ""

    if product_data["tested_for"] is None:
        product_data["tested_for"] = ""

    if product_data["active_ingredient"] is None:
        product_data["active_ingredient"] = ""

    # If description contains embedded "Proven Safe: ...", remove it from description body so tested_for holds it exclusively
    if product_data["description"]:
        product_data["description"] = re.sub(r'Proven Safe:\s*.*?safety\.?', '', product_data["description"], flags=re.I)
        product_data["description"] = re.sub(r'All tests are conducted.*?\.', '', product_data["description"], flags=re.I).strip()
        if len(product_data["description"]) > 220:
            product_data["description"] = product_data["description"][:217].rsplit(" ", 1)[0] + "..."

    if not product_data["name"]:
        raise ValueError("Could not extract product name from the provided page.")

    return product_data

@app.route('/')
def index():
    return render_template('index.html', presets=SAMPLE_PRESETS)

@app.route('/api/presets', methods=['GET'])
def get_presets():
    return jsonify({"success": True, "presets": SAMPLE_PRESETS})

@app.route('/api/fetch-product', methods=['POST'])
def api_fetch_product():
    """Fetch and parse beminimalist.co product page server-side."""
    req_json = request.get_json(silent=True) or {}
    url = req_json.get("url")

    if not url:
        logger.error("Fetch request missing 'url' parameter.")
        return jsonify({
            "success": False,
            "error": "Missing 'url' parameter in request."
        }), 400

    logger.info("Received request to fetch product from: %s", url)
    try:
        product = fetch_beminimalist_product(url)
        logger.info("Successfully fetched product: %s (%s)", product.get("name"), product.get("price"))
        return jsonify({
            "success": True,
            "product": product
        })
    except Exception as e:
        error_msg = str(e)
        logger.error("Fetch failed for URL '%s': %s", url, error_msg, exc_info=True)
        return jsonify({
            "success": False,
            "error": error_msg,
            "reason": f"Server-side fetch error: {error_msg}"
        }), 400

@app.route('/canvas-export')
def canvas_export():
    """Clean isolated 1080x1080 export template view without UI chrome."""
    return render_template('export.html')

@app.route('/test-export')
def test_export():
    return render_template('test_export.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
