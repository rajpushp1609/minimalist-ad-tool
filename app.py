import os
import re
import html
import logging
from urllib.parse import urlparse
from flask import Flask, render_template, request, jsonify
import requests
import certifi
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("minimalist_ad_tool")

app = Flask(__name__)

# Sample Minimalist skincare presets with real beminimalist.co URLs and authentic product photos
SAMPLE_PRESETS = [
    {
        "id": "retinol-0-6",
        "url": "https://beminimalist.co/products/retinol-0-6",
        "name": "Retinol 0.6% Face Serum",
        "active_ingredient": "Pure Retinol 0.6% • CoQ10",
        "price": "₹617 / 30ml",
        "image_url": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/Retinol_06_New.png?v=1721398129",
        "description": "Medium strength Retinol formula in pure squalane for fading fine lines, smoothing uneven texture, and promoting cellular turnover.",
        "free_from": "Fragrance Free • Water Free • Essential Oil Free • Non-Comedogenic",
        "cta": "Shop Now at beminimalist.co"
    },
    {
        "id": "retinal-0-1",
        "url": "https://beminimalist.co/products/retinal-0-1-face-serum",
        "name": "Retinal 0.1% Face Serum",
        "active_ingredient": "Retinaldehyde 0.1% • Peptides",
        "price": "₹759 / 30ml",
        "image_url": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/DomesticMain.png?v=1729750815",
        "description": "Next-generation stabilized retinal formula that acts 11x faster than retinol to boost collagen production, firm skin, and reduce deep wrinkles.",
        "free_from": "Fragrance Free • Non-Irritating • Cruelty Free • Clinically Tested",
        "cta": "Shop Now at beminimalist.co"
    },
    {
        "id": "copper-peptide",
        "url": "https://beminimalist.co/products/copper_peptide_pdrn_1-25_face_serum",
        "name": "Copper Peptide + PDRN 1.25% Face Serum",
        "active_ingredient": "Copper Peptide 1% • PDRN (Sodium DNA)",
        "price": "₹664 / 30ml",
        "image_url": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/CopyofArtboard1_2.jpg?v=1757069577",
        "description": "Advanced anti-aging serum enriched with Sodium DNA and multi-molecular Hyaluronic Acid to restore skin firmness, elasticity, and cellular repair.",
        "free_from": "Fragrance Free • Non-Comedogenic • Essential Oil Free • Paraben Free",
        "cta": "Shop Now at beminimalist.co"
    },
    {
        "id": "hair-growth-15-6",
        "url": "https://beminimalist.co/products/hair-growth-anti-grey-actives-15-6-hair-serum",
        "name": "Hair Growth + Anti-Grey 15.6% Hair Serum",
        "active_ingredient": "Darkenyl • Redensyl • Procapil 15.6%",
        "price": "₹854 / 50ml",
        "image_url": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/websiteimage_shadow_texture.jpg?v=1785500401",
        "description": "Advanced formulation powered by a 15.6% blend of 6 proven actives to visibly reduce grey hair density, minimize hair fall, and support follicular growth.",
        "free_from": "Fragrance Free • Alcohol Free • Silicone Free • Clean Actives",
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
    """Heuristically extract active ingredient name and percentage from title or description."""
    # Pattern for ingredient + percentage, e.g. "Retinol 0.6%", "Niacinamide 10%", "Salicylic Acid 2%"
    match = re.search(r"([A-Za-z0-9\+\-\s]+?\b\d+(?:\.\d+)?%)", title)
    if match:
        return match.group(1).strip()
    # Fallback to title stripped of "Face Serum", "Hair Serum", etc.
    cleaned = re.sub(r"(Face|Hair|Body)?\s*(Serum|Moisturizer|Cleanser|Toner|Shampoo|Cream|Balm).*$", "", title, flags=re.IGNORECASE).strip()
    if cleaned:
        return cleaned
    return "Clinical Actives"

def fetch_beminimalist_product(url):
    """
    Fetch and parse a beminimalist.co product page server-side.
    Uses certifi for SSL verification.
    First attempts Shopify's native .js endpoint, then falls back to HTML parsing (JSON-LD & OpenGraph).
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

    # Base clean product URL without query params or trailing slash
    clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip("/")
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8"
    }

    product_data = {
        "name": None,
        "price": None,
        "description": None,
        "image_url": None,
        "active_ingredient": None,
        "free_from": "Fragrance Free • Non-Comedogenic • Essential Oil Free • Dye Free",
        "cta": "Shop Now at beminimalist.co",
        "url": clean_url
    }

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

            # Description
            raw_desc = data.get("description") or ""
            desc = clean_text(raw_desc)
            if desc:
                # If very short or stub, we will check HTML page description below
                product_data["description"] = desc
            logger.info("Successfully parsed Shopify JSON for '%s'", product_data["name"])
    except Exception as e:
        logger.warning("Shopify .js endpoint failed for %s: %s. Falling back to HTML scraping.", js_url, str(e))

    # Step 2: Fetch HTML page directly (for meta tags, JSON-LD, and high-fidelity description)
    logger.info("Fetching full HTML page from %s", clean_url)
    try:
        r = requests.get(clean_url, headers=headers, verify=certifi.where(), timeout=12)
        if r.status_code != 200:
            logger.error("HTTP error fetching %s: status %s %s", clean_url, r.status_code, r.reason)
            # If we don't even have name from Step 1, raise
            if not product_data["name"]:
                raise ValueError(f"HTTP {r.status_code} ({r.reason}) when fetching product page")
        else:
            soup = BeautifulSoup(r.text, "html.parser")

            # Check JSON-LD for rich product data
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
                            if ld_desc and len(ld_desc) > 30:
                                product_data["description"] = ld_desc
                except Exception:
                    pass

            # Check OpenGraph and Meta tags for description (often has the most concise ad copy)
            og_desc = soup.find("meta", property="og:description")
            meta_desc = soup.find("meta", attrs={"name": "description"})
            marketing_desc = ""
            if og_desc and og_desc.get("content"):
                marketing_desc = clean_text(og_desc["content"])
            elif meta_desc and meta_desc.get("content"):
                marketing_desc = clean_text(meta_desc["content"])

            if marketing_desc and len(marketing_desc) > 25:
                product_data["description"] = marketing_desc

            # Fallback for image from OpenGraph
            if not product_data["image_url"]:
                og_img = soup.find("meta", property="og:image")
                if og_img and og_img.get("content"):
                    product_data["image_url"] = og_img["content"]

            # Fallback for title from OpenGraph
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

    # Shorten description if extremely long so it fits nicely on the 1080x1080 creative
    if product_data["description"] and len(product_data["description"]) > 220:
        product_data["description"] = product_data["description"][:217].rsplit(" ", 1)[0] + "..."

    # Validate mandatory fields
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
