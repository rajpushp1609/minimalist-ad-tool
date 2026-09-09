// Minimalist Ad Creative Studio - Frontend Controller

document.addEventListener('DOMContentLoaded', () => {
  // Primary URL Input Controls
  const urlInput = document.getElementById('product-url');
  const fetchUrlBtn = document.getElementById('fetch-url-btn');
  const fetchStatus = document.getElementById('fetch-status');
  const fetchBtnLabel = document.getElementById('fetch-btn-label');

  // Manual & Fallback Form Controls
  const form = document.getElementById('ad-form');
  const nameInput = document.getElementById('product-name');
  const activeInput = document.getElementById('active-ingredient');
  const priceInput = document.getElementById('product-price');
  const descInput = document.getElementById('short-description');
  const freeFromInput = document.getElementById('free-from');
  const testedInput = document.getElementById('tested-for');
  const ctaInput = document.getElementById('ad-cta');
  const imageInput = document.getElementById('image-url');
  const fileInput = document.getElementById('image-file');
  const resetBtn = document.getElementById('reset-btn');
  const downloadBtn = document.getElementById('download-btn');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Ad Creative Canvas Elements
  const adCreative = document.getElementById('ad-creative');
  const adWrapper = document.getElementById('ad-wrapper');
  const canvasViewport = document.getElementById('canvas-viewport');
  
  const adHeadline = document.getElementById('ad-headline-text');
  const adActive = document.getElementById('ad-active-text');
  const adPrice = document.getElementById('ad-price-text');
  const adDesc = document.getElementById('ad-description-text');
  const adClaims = document.getElementById('ad-claims-text');
  const adTested = document.getElementById('ad-tested-text');
  const adCtaText = document.getElementById('ad-cta-text');
  const adImg = document.getElementById('ad-product-img');

  const DEFAULT_IMG = "https://cdn.shopify.com/s/files/1/0410/9608/5665/files/MassageOilNew.png?v=1721398127";

  // Auto-Scale 1080x1080 Canvas so it fits smoothly in preview viewport
  function updateCanvasScale() {
    if (!canvasViewport || !adWrapper) return;
    const padding = 40;
    const availableWidth = canvasViewport.clientWidth - padding;
    const availableHeight = canvasViewport.clientHeight - padding;
    
    // Maintain exact 1:1 aspect ratio
    const scale = Math.max(0.2, Math.min(availableWidth / 1080, availableHeight / 1080));
    adWrapper.style.transform = `scale(${scale})`;
    adWrapper.style.width = '1080px';
    adWrapper.style.height = '1080px';
  }

  window.addEventListener('resize', updateCanvasScale);

  // Format Price Cleanly
  function formatPrice(val) {
    if (!val) return '₹569 / 100ml';
    val = val.trim();
    if (!val.startsWith('₹') && !val.toLowerCase().startsWith('rs')) {
      return `₹${val}`;
    }
    return val;
  }

  // Render Ad Canvas strictly from inputs
  function renderAdCreative() {
    const name = nameInput.value.trim() || 'Provitamin D3 Massage Oil';
    const active = activeInput.value.trim() || 'Provitamin D3 • Vitamin E & F';
    const price = formatPrice(priceInput.value);
    const desc = descInput.value.trim() || 'Crafted with nourishing Coconut, Sunflower, Safflower & Almond Oils enriched with Provitamin D3 to protect delicate skin and prevent moisture loss.';
    const freeFrom = freeFromInput.value.trim() || 'Fragrance Free • Sulfates Free • Essential Oils Free • Mineral Oil Free • Dyes Free • Parabens Free';
    const tested = (testedInput && testedInput.value.trim()) ? testedInput.value.trim() : 'Proven Safe: Clinically Tested to be Hypoallergenic, Non-Comedogenic, Sensitive skin safe, Pediatrician-approved & Kind to Biome Certified, this oil is clinically validated for safety.';
    const cta = ctaInput.value.trim() || 'Shop Now at beminimalist.co';
    const imgUrl = imageInput.value.trim() || DEFAULT_IMG;

    // Direct mapping to template elements
    if (adHeadline) adHeadline.textContent = name;
    if (adActive) adActive.textContent = active;
    if (adPrice) adPrice.textContent = price;
    if (adDesc) adDesc.textContent = desc;
    if (adClaims) adClaims.textContent = freeFrom;
    if (adTested) adTested.textContent = tested;
    if (adCtaText) adCtaText.textContent = cta;

    if (imgUrl && adImg) {
      adImg.src = imgUrl;
      adImg.onerror = () => {
        console.warn('Product image failed to load, falling back to default Minimalist product image.');
        adImg.src = DEFAULT_IMG;
      };
    }
  }

  // Display status feedback banner
  function showStatusBanner(type, title, detail) {
    if (!fetchStatus) return;
    fetchStatus.style.display = 'block';
    fetchStatus.className = `fetch-status-banner ${type}`;
    fetchStatus.innerHTML = `
      <div class="status-title">${title}</div>
      ${detail ? `<div class="status-detail">${detail}</div>` : ''}
    `;
  }

  function hideStatusBanner() {
    if (!fetchStatus) return;
    fetchStatus.style.display = 'none';
  }

  // Fetch product from backend server-side parser
  async function fetchProductFromUrl(url) {
    if (!url || !url.trim()) {
      showStatusBanner('error', 'Please enter a product URL', 'Provide a valid beminimalist.co product page URL.');
      return;
    }

    const trimmedUrl = url.trim();

    // Set UI loading state
    fetchUrlBtn.classList.add('loading');
    if (fetchBtnLabel) fetchBtnLabel.textContent = 'Fetching...';
    showStatusBanner('loading', 'Fetching from beminimalist.co...', 'Connecting to server and parsing product page server-side...');

    try {
      const resp = await fetch('/api/fetch-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: trimmedUrl })
      });

      const data = await resp.json();

      if (resp.ok && data.success && data.product) {
        const prod = data.product;

        // Auto-fill all form fields
        nameInput.value = prod.name || '';
        activeInput.value = prod.active_ingredient || '';
        priceInput.value = prod.price || '';
        descInput.value = prod.description || '';
        if (prod.free_from) freeFromInput.value = prod.free_from;
        if (prod.tested_for && testedInput) testedInput.value = prod.tested_for;
        if (prod.cta) ctaInput.value = prod.cta;
        if (prod.image_url) imageInput.value = prod.image_url;

        // Update ad creative preview
        renderAdCreative();

        showStatusBanner('success', '✓ Product Details Loaded', `${prod.name} (${prod.price}) parsed server-side. Edit below if needed.`);
      } else {
        const errorReason = data.error || data.reason || 'Failed to fetch product';
        console.error('Server-side product fetch failed:', errorReason, data);
        showStatusBanner(
          'error',
          'Fetch Failed &bull; Use Manual Form Below',
          `${errorReason}. You can enter and edit the product details manually in the form below.`
        );
        nameInput.focus();
      }
    } catch (err) {
      console.error('Network or fetch error:', err);
      showStatusBanner(
        'error',
        'Connection Error &bull; Use Manual Form Below',
        `Could not contact server: ${err.message}. Manual entry is ready below.`
      );
      nameInput.focus();
    } finally {
      fetchUrlBtn.classList.remove('loading');
      if (fetchBtnLabel) fetchBtnLabel.textContent = 'Fetch Details';
    }
  }

  // Trigger fetch on button click or Enter key
  if (fetchUrlBtn) {
    fetchUrlBtn.addEventListener('click', () => {
      fetchProductFromUrl(urlInput.value);
    });
  }

  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fetchProductFromUrl(urlInput.value);
      }
    });
  }

  // Live updates on typing in manual form
  const inputList = [nameInput, activeInput, priceInput, descInput, freeFromInput, testedInput, ctaInput, imageInput];
  inputList.forEach(input => {
    if (input) {
      input.addEventListener('input', renderAdCreative);
    }
  });

  // Local File Upload handler
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          imageInput.value = evt.target.result;
          renderAdCreative();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Manual Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    renderAdCreative();
    
    const submitBtn = document.getElementById('submit-btn');
    const origHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      Preview Updated!
    `;
    setTimeout(() => {
      submitBtn.innerHTML = origHtml;
    }, 1200);
  });

  // Preset Selection
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const presetUrl = chip.dataset.url || '';
      if (presetUrl) {
        urlInput.value = presetUrl;
      }

      nameInput.value = chip.dataset.name || '';
      activeInput.value = chip.dataset.active || '';
      priceInput.value = chip.dataset.price || '';
      descInput.value = chip.dataset.desc || '';
      freeFromInput.value = chip.dataset.free || '';
      if (testedInput && chip.dataset.tested) testedInput.value = chip.dataset.tested;
      ctaInput.value = chip.dataset.cta || '';
      imageInput.value = chip.dataset.image || '';

      renderAdCreative();
      showStatusBanner('success', `Loaded Preset: ${chip.dataset.name}`, 'You can click "Fetch Details" to re-fetch live from beminimalist.co or edit directly.');
    });
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    hideStatusBanner();
    if (presetChips.length > 0) {
      presetChips[0].click();
    } else {
      form.reset();
      renderAdCreative();
    }
  });

  // High-Fidelity 1080x1080 Native PNG Export
  downloadBtn.addEventListener('click', async () => {
    const origBtnHtml = downloadBtn.innerHTML;
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `<span>Exporting 1080&times;1080...</span>`;

    let offscreenContainer = null;
    try {
      // 1. Wait for all fonts to be completely ready
      await document.fonts.ready;

      // 2. Build off-screen unscaled isolation container at native 1080x1080
      offscreenContainer = document.createElement('div');
      offscreenContainer.id = 'export-stage';
      offscreenContainer.style.position = 'fixed';
      offscreenContainer.style.left = '0';
      offscreenContainer.style.top = '0';
      offscreenContainer.style.width = '1080px';
      offscreenContainer.style.height = '1080px';
      offscreenContainer.style.transform = 'none';
      offscreenContainer.style.margin = '0';
      offscreenContainer.style.padding = '0';
      offscreenContainer.style.zIndex = '-99999';
      offscreenContainer.style.opacity = '1';
      offscreenContainer.style.pointerEvents = 'none';
      offscreenContainer.style.overflow = 'hidden';
      offscreenContainer.style.backgroundColor = '#ffffff';

      // 3. Clone ad creative node
      const clone = adCreative.cloneNode(true);
      clone.style.position = 'relative';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.transform = 'none';
      clone.style.width = '1080px';
      clone.style.height = '1080px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxSizing = 'border-box';

      offscreenContainer.appendChild(clone);
      document.body.appendChild(offscreenContainer);

      // 4. Wait for all images in clone to be loaded
      const images = Array.from(clone.querySelectorAll('img'));
      await Promise.all(images.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      // Small tick for layout stabilization
      await new Promise(r => setTimeout(r, 120));

      // 5. Render canvas at exact 1:1 scale with pure white background
      const canvas = await html2canvas(clone, {
        width: 1080,
        height: 1080,
        scale: 1,
        windowWidth: 1080,
        windowHeight: 1080,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        logging: false
      });

      // 6. Download PNG file
      const link = document.createElement('a');
      const safeTitle = (nameInput.value || 'minimalist-ad').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${safeTitle}-1080x1080.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (err) {
      console.error('PNG Export failed:', err);
      alert('Export encountered an error: ' + err.message);
    } finally {
      if (offscreenContainer && offscreenContainer.parentNode) {
        offscreenContainer.parentNode.removeChild(offscreenContainer);
      }
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = origBtnHtml;
    }
  });

  // Initialize with the first preset
  if (presetChips.length > 0) {
    presetChips[0].click();
  } else {
    renderAdCreative();
  }

  updateCanvasScale();
  setTimeout(updateCanvasScale, 150);
});
