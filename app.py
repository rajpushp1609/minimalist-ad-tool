import os
from flask import Flask, render_template, request, jsonify, send_file
from io import BytesIO

app = Flask(__name__)

# Sample Minimalist skincare presets with real local bottle shots & authentic claims
SAMPLE_PRESETS = [
    {
        "id": "niacinamide-10",
        "name": "Niacinamide 10% + Zinc 1%",
        "active_ingredient": "Niacinamide 10% • Zinc PCA 1%",
        "price": "₹599 / 30ml",
        "image_url": "/static/images/niacinamide.png",
        "description": "Clinically proven face serum that balances sebum secretion, minimizes enlarged pores, and clears dark blemishes for clear, translucent skin.",
        "free_from": "Fragrance Free • Non-Comedogenic • Essential Oil Free • Dye Free",
        "cta": "Shop Now at beminimalist.co"
    },
    {
        "id": "salicylic-2",
        "name": "Salicylic Acid 2%",
        "active_ingredient": "Salicylic Acid 2% • LHA",
        "price": "₹549 / 30ml",
        "image_url": "/static/images/salicylic.png",
        "description": "Gentle daily chemical exfoliant that penetrates deep into pores to dissolve trapped sebum, clear blackheads, and prevent active acne flare-ups.",
        "free_from": "Fragrance Free • Alcohol Free • Non-Irritating • Clinically Tested",
        "cta": "Shop Now at beminimalist.co"
    },
    {
        "id": "vitamin-c-16",
        "name": "Vitamin C 16%",
        "active_ingredient": "Ethyl Ascorbic Acid 16% • Fullerene",
        "price": "₹699 / 30ml",
        "image_url": "/static/images/vitaminc.png",
        "description": "High-potency antioxidant serum formulated with Centella water to boost collagen synthesis, neutralize free radicals, and visibly brighten uneven skin tone.",
        "free_from": "Fragrance Free • Essential Oil Free • Photostable • Non-Sticky",
        "cta": "Shop Now at beminimalist.co"
    }
]

@app.route('/')
def index():
    return render_template('index.html', presets=SAMPLE_PRESETS)

@app.route('/api/presets', methods=['GET'])
def get_presets():
    return jsonify({"success": True, "presets": SAMPLE_PRESETS})

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
