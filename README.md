# Minimalist Ad Creative Studio

Internal ad creative studio for **[Minimalist](https://beminimalist.co)** — the transparent, science-backed skincare brand.

Paste any `beminimalist.co` product URL → the backend fetches and parses product details server-side → generates an authentic, pixel-perfect **1080×1080** social media ad creative.

---

## Key Features

- **Product URL Primary Input**:
  - Paste any live `beminimalist.co` product page URL (e.g. `https://beminimalist.co/products/pediatrics-provitamin-d3-massage-oil`).
  - Click **Fetch Details** or hit `Enter` to extract all product assets automatically.

- **Server-Side Fetching & Parsing (`app.py`)**:
  - **SSL Verification via `certifi`**: Secure HTTPS requests using Mozilla's CA bundle.
  - **Shopify `.js` API Extraction**: Fast, structured JSON extraction for title, price (converted from paise to `₹XXX`), description, and high-res featured bottle image.
  - **Dynamic Free-From Claims**: Scrapes real icons from the product page (`.product-icons-list`) rather than static fallbacks (e.g., *Fragrance Free • Sulfates Free • Essential Oils Free • Mineral Oil Free • Dyes Free • Parabens Free*).
  - **Clinical Safety & "Tested For" Extraction**: Automatically parses clinical testing endorsements (e.g., *Proven Safe: Clinically Tested to be Hypoallergenic, Non-Comedogenic, Sensitive skin safe, Pediatrician-approved & Kind to Biome Certified*).
  - **Active Ingredient Detection**: Heuristically extracts active ingredients and concentrations (e.g. *Provitamin D3*, *Retinol 0.6%*).

- **Robust Error Handling & Manual Form Fallback**:
  - If a fetch fails (404, invalid URL, network timeout), the backend logs the exact error, status code, URL, and full traceback via Python's standard `logging` module.
  - A descriptive error banner is presented in the UI explaining why the fetch failed.
  - The **Manual Entry Form** serves as the fallback, remaining fully editable so users can manually input or fine-tune any field.

- **Authentic Product Photography**:
  - Directly pulls official high-resolution product photos from Minimalist's Shopify CDN. No synthetic or AI-generated bottles.

- **Pixel-Perfect 1080×1080 Square Engine**:
  - Live responsive preview scaled to fit your screen.
  - High-fidelity **Export 1080x1080 PNG** button producing an unscaled `1080×1080` asset with pure white background `(255, 255, 255)`.

- **One-Click Live Presets**:
  - Test instantly with authentic Minimalist products:
    - *Provitamin D3 Massage Oil* (`₹569 / 100ml`)
    - *Retinol 0.6% Face Serum* (`₹617 / 30ml`)
    - *Copper Peptide + PDRN 1.25% Face Serum* (`₹664 / 30ml`)
    - *Hair Growth + Anti-Grey 15.6% Hair Serum* (`₹854 / 50ml`)

---

## Tech Stack

- **Backend**: Python 3, Flask 3.1, `requests`, `certifi`, `beautifulsoup4`
- **Frontend**: Vanilla JavaScript (ES6+), Modern Semantic HTML5, Custom CSS Design System
- **Export Engine**: `html2canvas` with unscaled off-screen DOM clone

---

## Setup & Running Locally

### 1. Clone & Navigate
```bash
git clone https://github.com/rajpushp1609/minimalist-ad-tool.git
cd minimalist-ad-tool
```

### 2. Set Up Virtual Environment & Dependencies
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the Flask App
```bash
python app.py
```
Or specify a custom port:
```bash
PORT=5001 python app.py
```

### 4. Open in Browser
Visit **http://127.0.0.1:5001/** in your browser.

---

## API Reference

### `POST /api/fetch-product`
Fetches and parses a `beminimalist.co` product page server-side.

**Request Body:**
```json
{
  "url": "https://beminimalist.co/products/pediatrics-provitamin-d3-massage-oil"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "product": {
    "name": "Provitamin D3 Massage Oil",
    "active_ingredient": "Provitamin D3",
    "price": "₹569",
    "description": "This gentle Massage Oil is crafted with nourishing Coconut, Sunflower, Safflower, and Almond Oils, enriched with Provitamin D3...",
    "free_from": "Fragrance Free • Sulfates Free • Essential Oils Free • Mineral Oil Free • Dyes Free • Parabens Free",
    "tested_for": "Proven Safe: Clinically Tested to be Hypoallergenic, Non-Comedogenic, Sensitive skin safe, Pediatrician-approved & Kind to Biome Certified, this oil is clinically validated for safety.",
    "image_url": "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/MassageOilNew.png?v=1721398127",
    "cta": "Shop Now at beminimalist.co",
    "url": "https://beminimalist.co/products/pediatrics-provitamin-d3-massage-oil"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "HTTP 404 (Not Found) when fetching product page",
  "reason": "Server-side fetch error: HTTP 404 (Not Found) when fetching product page"
}
```

---

## Project Structure

```
├── app.py                  # Flask backend: server-side scraping, certifi SSL, error logging, APIs
├── requirements.txt        # Flask, requests, beautifulsoup4, certifi, Pillow
├── templates/
│   ├── index.html          # Main studio workspace (Primary URL input, manual fallback form, canvas)
│   ├── export.html         # Isolated 1080×1080 export view for headless verification
│   └── test_export.html    # Standalone export test view
├── static/
│   ├── css/
│   │   └── style.css       # Studio design system, responsive layout, 1080×1080 canvas styling
│   ├── js/
│   │   └── app.js          # Controller: URL fetch, live canvas rendering, manual form binding, PNG export
│   └── images/             # Local asset fallbacks
├── .gitignore              # Ignores venv, pycache, scratch artifacts
└── README.md               # Project documentation
```

---

## License

Internal tool for Minimalist — not for public distribution.
