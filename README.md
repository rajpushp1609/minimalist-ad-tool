# Minimalist Ad Creative Studio & Brand Compliance Auditor

Internal ad creative studio and regulatory audit engine for **[Minimalist](https://beminimalist.co)** — the transparent, science-backed skincare brand.

🚀 **Live Deployed Application**: **[https://minimalist-ad-tool.onrender.com/](https://minimalist-ad-tool.onrender.com/)**

Paste any `beminimalist.co` product URL → the backend fetches and parses product details server-side → generates an authentic, pixel-perfect **1080×1080** social media ad creative. Audit compliance against Indian skincare advertising law (Drugs & Cosmetics Rules 2020, ASCI Code) and Minimalist brand guidelines in one click.

---

## 📖 Instructions: How to Use the Tool

### Surface A: Ad Creative Studio (`/`)

1. **Generate Ad from a Live Product URL**:
   - Navigate to **[https://minimalist-ad-tool.onrender.com/](https://minimalist-ad-tool.onrender.com/)**.
   - In the **Primary Input** box at the top left, paste any live `beminimalist.co` product URL (e.g. `https://beminimalist.co/products/aha-25-pha-5-bha-2` or `https://beminimalist.co/products/multi-vitamin-spf-50`).
   - Click **Fetch Details** (or press `Enter`).
   - The backend server extracts the authentic product title, primary active ingredients, real price, clinical safety validations, free-from claims, and high-resolution Shopify bottle imagery.
   - The **1080×1080 Live Canvas Preview** on the right updates in real-time.

2. **One-Click Live Presets**:
   - Under *Live Minimalist Products (One-Click Fetch)*, click any preset chip (*Provitamin D3 Massage Oil*, *Retinol 0.6% Face Serum*, *Copper Peptide + PDRN 1.25%*, or *Hair Growth + Anti-Grey 15.6%*) to instantly populate and view authentic brand creatives.

3. **Edit & Customize Ad Copy (Manual Fallback)**:
   - Use the **Product Details** form on the left to fine-tune headlines, active concentrations, short benefit descriptions, or free-from badges.
   - The live preview updates instantly as you type.

4. **Export 1080×1080 High-Res PNG**:
   - Click **Export 1080x1080 PNG** at the top right.
   - The tool builds an unscaled 1:1 off-screen DOM clone and triggers a direct browser download of the exact 1080×1080 pixel-perfect PNG with pure white background `(255, 255, 255)` ready for Instagram and digital ad placements.

5. **Transfer to Audit Scorer**:
   - Click **Score This Creative** right above the canvas preview.
   - All extracted fields (headline, active ingredient, supporting description, claims, CTA) are seamlessly transferred to the **Brand & Policy Scorer** for automated compliance review.

---

### Surface B: Brand & Policy Scorer (`/score`)

1. **Navigate to Scorer**:
   - Click the **Brand & Policy Scorer** tab in the top navigation bar or visit **[https://minimalist-ad-tool.onrender.com/score](https://minimalist-ad-tool.onrender.com/score)**.

2. **Run an Audit**:
   - If arriving from Studio via "Score This Creative", your copy will be pre-filled automatically.
   - Alternatively, test using the built-in preset test cases:
     - **Compliant Minimalist Copy** (`PUBLISH` / Pass)
     - **High-Risk Policy Violation** (Curative disease claims, chemical fearmongering / `BLOCK`)
     - **Hyperbolic Tone & Fluff** (Glass skin clichés, fairy-tale claims / `NEEDS REVISION`)
   - Or paste raw unformatted headline, body, and CTA copy from any external ad into the **Raw Ad Copy Paste** box.
   - Click **Audit Ad Copy**.

3. **Review Audit Report**:
   - **Overall Verdict**: `PUBLISH` (Green), `NEEDS REVISION` (Amber), or `BLOCK` (Red).
   - **Dimension Breakdown**:
     - *Policy & Claims*: Evaluates Drugs & Cosmetics Rules 2020 (no curative disease claims) and ASCI Code Chapter I (truthful substantiation).
     - *Brand Tone*: Evaluates education-first values and strict prohibition of fear-based marketing ("toxic chemical" scaremongering).
     - *Brand Language & Formatting*: Checks ingredient concentration syntax `[Active %]` and approved scientific vocabulary.
   - Highlights exact flagged text snippets with severity ratings, legal citations, and suggested compliant fixes.

4. **Transfer Approved Copy back to Studio**:
   - If the auditor provides a compliant rewrite, click **"Send to Studio"** at the bottom of the audit report to automatically reload the compliant text into the Studio canvas.

- **Server-Side Fetching & Parsing (`app.py`)**:
  - **SSL Verification via `certifi`**: Secure HTTPS requests using Mozilla's CA bundle.
  - **Shopify `.js` API Extraction**: Fast, structured JSON extraction for title, price (converted from paise to `₹XXX`), description, and high-res featured bottle image.
  - **Dynamic Free-From Claims**: Scrapes real icons from the product page (`.product-icons-list`) rather than static fallbacks (e.g., *Fragrance Free • Sulfates Free • Essential Oils Free • Mineral Oil Free • Dyes Free • Parabens Free*).
  - **Clinical Safety & "Tested For" Extraction**: Automatically parses clinical testing endorsements (e.g., *Proven Safe: Clinically Tested to be Hypoallergenic, Non-Comedogenic, Sensitive skin safe, Pediatrician-approved & Kind to Biome Certified*).
  - **Active Ingredient Detection**: Heuristically extracts active ingredients and concentrations (e.g. *Provitamin D3*, *Retinol 0.6%*).

- **Zero Invented Claims Policy**:
  - When any field (`free_from`, `tested_for`, `active_ingredient`) cannot be extracted from the scraped page, the backend leaves it strictly blank (`""`).
  - The UI clearly shows `"Not found on page"` rather than generating synthetic claims or fallbacks.
  - Users can manually input custom values into the fallback form if desired.

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

## Surface B: Brand & Compliance Scorer (`/score`)

A dedicated compliance audit and brand guardian surface powered by **DeepSeek AI** and the committed rubric at [`prompts/scorer_rubric.md`](prompts/scorer_rubric.md).

### Dual-Surface Navigation & Interoperability
- **Header Tabs**: Switch seamlessly between **Creative Studio** (`/`) and **Brand & Policy Scorer** (`/score`).
- **"Score This Creative" Button**: Located right above the 1080×1080 canvas preview in the Studio. In one click, it transfers the current creative's headline, active ingredient, description, claims, and CTA into the Scorer and triggers an audit.
- **"Send to Studio" Button**: After an audit recommends compliant rewrites, one click loads the approved copy back into the Studio canvas.
- **Raw Copy Paste Box**: Paste raw headline, body, and CTA copy from any external ad to audit ads not generated here.
- **Preset Test Cases**:
  - **Compliant Minimalist Copy**: Fully passes all dimensions (`PUBLISH`).
  - **High-Risk Policy Violation**: Tests curative disease claims, unbacked clinical tests, and toxic chemical scaremongering (`BLOCK`).
  - **Hyperbolic Tone & Fluff**: Tests generic beauty clichés ("goddess glow", "poreless glass skin", "magic potion") (`NEEDS REVISION`).

### The 3 Audit Dimensions
1. **Policy & Claims (Indian Legal Standards)**:
   - **Drugs & Cosmetics Act, 1940 & Cosmetics Rules, 2020**: Strictly flags curative disease claims ("cure acne", "treat eczema", "heals psoriasis"). Cosmetics can only claim cosmetic appearance benefits.
   - **ASCI Code Chapter I (Truth in Advertising)**: Flags unsubstantiated "clinically proven" claims lacking study duration, volunteer counts, or certified labs. Flags miracle/overnight guaranteed transformations.
2. **Brand Tone (Minimalist Brand Philosophy)**:
   - **Source: `beminimalist.co/pages/our-values`**:
   - Zero fear-based marketing (prohibits "toxic chemicals", "chemical-free", "detox dirty skincare").
   - Education-first, clinical, and transparent. Rejects hyperbolic fairy-tale beauty clichés.
3. **Brand Language & Formatting**:
   - Requires the **[Active Ingredient + Concentration %]** format (e.g. `Niacinamide 10%`, `Salicylic Acid 2%`).
   - Validates transparent mechanism descriptions and approved vs disapproved vocabulary.

### Audit Output
- **Overall Verdict**: `PUBLISH` (Green) | `NEEDS REVISION` (Amber) | `BLOCK` (Red)
- **Dimension Verdicts**: `Pass` | `Needs Revision` | `Fail`
- **Quoted Flagged Spans**: Exact substrings identified in the ad copy.
- **Severity Tags**: `High` | `Medium` | `Low`
- **Legal & Brand Citations**: Explicit rule references.
- **Actionable Suggested Fixes**: Compliant alternative wording.

---

## Tech Stack

- **Backend**: Python 3, Flask 3.1, `requests`, `certifi`, `beautifulsoup4`, `python-dotenv`
- **AI Audit Engine**: DeepSeek Chat Completions API (`deepseek-chat`) with structured JSON schema
- **Frontend**: Vanilla JavaScript (ES6+), Modern Semantic HTML5, Custom CSS Design System
- **Export Engine**: `html2canvas` with unscaled off-screen DOM clone

---

## Setup & Running Locally

### 1. Clone & Navigate
```bash
git clone https://github.com/rajpushp1609/minimalist-ad-tool.git
cd minimalist-ad-tool
```

### 2. Virtual Environment & Dependencies
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (already gitignored):
```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
PORT=5001
```

### 4. Run the Flask App
```bash
PORT=5001 python app.py
```

### 5. Access Surfaces in Browser
- **Creative Studio**: `http://127.0.0.1:5001/`
- **Brand & Compliance Scorer**: `http://127.0.0.1:5001/score`

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

---

### `POST /api/score-ad`
Scores ad copy against the Minimalist Brand & Indian Skincare Regulatory Rubric via DeepSeek.

**Request Body (Structured or Raw Paste):**
```json
{
  "headline": "Niacinamide 10% Face Serum",
  "active_ingredient": "Niacinamide 10%",
  "supporting_text": "Formulated with pure Niacinamide to balance excess sebum secretion and reduce the appearance of blemishes.",
  "cta": "Shop Now at beminimalist.co"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "verdict": {
    "overall_verdict": "Publish",
    "overall_summary": "Ad copy strictly adheres to cosmetic benefit claims and Minimalist scientific brand standards.",
    "dimensions": {
      "policy_claims": {
        "dimension_name": "Policy & Claims (Drugs & Cosmetics Rules / ASCI)",
        "verdict": "Pass",
        "flags": []
      },
      "brand_tone": {
        "dimension_name": "Brand Tone (Education-First & Anti-Fearmongering)",
        "verdict": "Pass",
        "flags": []
      },
      "brand_language": {
        "dimension_name": "Brand Language & Formatting (Active %, Vocabulary)",
        "verdict": "Pass",
        "flags": []
      }
    }
  }
}
```

---

## Project Structure

```
├── app.py                  # Flask backend: scraping, certifi SSL, /score routes, DeepSeek audit API
├── prompts/
│   └── scorer_rubric.md    # Committed brand & regulatory rubric (Drugs & Cosmetics, ASCI, beminimalist.co)
├── requirements.txt        # Flask, requests, beautifulsoup4, certifi, python-dotenv, Pillow
├── templates/
│   ├── index.html          # Creative Studio workspace (URL input, manual form, 1080x1080 canvas)
│   ├── score.html          # Brand & Policy Scorer surface (paste box, structured inputs, audit report)
│   ├── export.html         # Isolated 1080×1080 export view for headless verification
├── static/
│   ├── css/
│   │   └── style.css       # Unified design system for Studio and Scorer surfaces
│   ├── js/
│   │   ├── app.js          # Studio controller: URL fetch, canvas rendering, transfer to /score
│   │   └── scorer.js       # Scorer controller: presets, DeepSeek audit rendering, transfer to Studio
│   └── images/             # (reserved for future local assets)
├── .gitignore              # Strictly ignores .env, venv, pycache, scratch files
└── README.md               # Comprehensive documentation
```

---

## License

Internal tool for Minimalist — not for public distribution.

