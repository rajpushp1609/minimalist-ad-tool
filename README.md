# Minimalist Ad Creative Studio

Internal ad creative tool for **[Minimalist](https://beminimalist.co)** — the transparent skincare brand.

Paste product details → get a rendered 1080×1080 ad creative ready for social media.

![Ad Creative Studio UI](scratch/final_ui.png)

## Features

- **Template-Based Rendering** — Headline comes from product name, supporting text from description. No AI-generated claims.
- **1080×1080 Ad Canvas** — Pixel-perfect square creative with Minimalist's clinical brand aesthetic.
- **Every Input Rendered** — Product name, active ingredient %, price, description, free-from claims, CTA, and product image.
- **Quick-Fill Presets** — 1-click test with real Minimalist products (Niacinamide 10%, Salicylic Acid 2%, Vitamin C 16%).
- **PNG Export** — Download exact 1080×1080 creative with pure white background.
- **Live Preview** — Updates in real-time as you type.

## Stack

- **Frontend**: HTML / CSS / JavaScript
- **Backend**: Python Flask
- **Export**: html2canvas (client-side PNG generation)

## Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

Open **http://127.0.0.1:5001/** in your browser.

## Project Structure

```
├── app.py                  # Flask backend, presets, routes
├── requirements.txt        # Python dependencies
├── templates/
│   ├── index.html          # Main workspace (form + canvas)
│   └── export.html         # Isolated 1080×1080 export view
├── static/
│   ├── css/style.css       # Design system + ad canvas styles
│   ├── js/app.js           # Form handling, scaling, export
│   └── images/             # Product bottle images
└── .gitignore
```

## Roadmap

- [x] **Part A** — Input form → rendered ad creative
- [ ] **Part B** — Brand rule scorer (audit ads against brand guidelines)

## License

Internal tool — not for public distribution.
