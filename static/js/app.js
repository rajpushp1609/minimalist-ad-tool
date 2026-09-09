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
  const adActiveBadge = document.querySelector('.ad-active-badge');
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
    if (!val) return '';
    val = val.trim();
    if (!val.startsWith('₹') && !val.toLowerCase().startsWith('rs')) {
      return `₹${val}`;
    }
    return val;
  }

  // Render Ad Canvas strictly from inputs without inventing missing claims
  function renderAdCreative() {
    const name = nameInput.value.trim() || 'Product Name';
    const active = activeInput.value.trim();
    const price = formatPrice(priceInput.value) || 'Price Not Found';
    const desc = descInput.value.trim() || 'Description: Not found on page';
    const freeFrom = freeFromInput.value.trim();
    const tested = (testedInput && testedInput.value.trim()) ? testedInput.value.trim() : '';
    const cta = ctaInput.value.trim() || 'Shop Now at beminimalist.co';
    const imgUrl = imageInput.value.trim() || DEFAULT_IMG;

    // Direct mapping to template elements
    if (adHeadline) adHeadline.textContent = name;
    if (adPrice) adPrice.textContent = price;
    if (adDesc) adDesc.textContent = desc;
    if (adCtaText) adCtaText.textContent = cta;

    // Active Ingredient
    if (adActive) {
      if (active) {
        adActive.textContent = active;
        if (adActiveBadge) {
          adActiveBadge.style.display = 'inline-flex';
          adActiveBadge.style.opacity = '1';
        }
      } else {
        adActive.textContent = 'Active ingredient: Not found on page';
        if (adActiveBadge) {
          adActiveBadge.style.display = 'inline-flex';
          adActiveBadge.style.opacity = '0.5';
        }
      }
    }

    // Free-From Claims Strip
    if (adClaims) {
      if (freeFrom) {
        adClaims.textContent = freeFrom;
        adClaims.style.opacity = '1';
        adClaims.style.fontStyle = 'normal';
      } else {
        adClaims.textContent = 'Free-From Claims: Not found on page';
        adClaims.style.opacity = '0.5';
        adClaims.style.fontStyle = 'italic';
      }
    }

    // Clinical Testing & Safety
    if (adTested) {
      if (tested) {
        adTested.textContent = tested;
        adTested.style.opacity = '1';
        adTested.style.fontStyle = 'normal';
      } else {
        adTested.textContent = 'Clinical safety validation: Not found on page';
        adTested.style.opacity = '0.5';
        adTested.style.fontStyle = 'italic';
      }
    }

    // Product Bottle Image
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

        // Auto-fill all form fields strictly from scraped data (never invented claims)
        nameInput.value = prod.name || '';
        activeInput.value = prod.active_ingredient || '';
        activeInput.placeholder = prod.active_ingredient ? 'e.g. Provitamin D3' : 'Not found on page';

        priceInput.value = prod.price || '';
        priceInput.placeholder = prod.price ? 'e.g. ₹569 / 100ml' : 'Not found on page';

        descInput.value = prod.description || '';
        descInput.placeholder = prod.description ? 'Clinical benefits and outcomes...' : 'Not found on page';

        freeFromInput.value = prod.free_from || '';
        freeFromInput.placeholder = prod.free_from ? 'e.g. Fragrance Free • Sulfates Free' : 'Not found on page';

        if (testedInput) {
          testedInput.value = prod.tested_for || '';
          testedInput.placeholder = prod.tested_for ? 'e.g. Proven Safe: Clinically Tested...' : 'Not found on page';
        }

        if (prod.cta) ctaInput.value = prod.cta;
        if (prod.image_url) imageInput.value = prod.image_url;

        // Update ad creative preview
        renderAdCreative();

        showStatusBanner('success', '✓ Product Details Loaded', `${prod.name || 'Product'} (${prod.price || 'Price not found'}) parsed server-side. Unextracted fields left blank.`);
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
      activeInput.placeholder = chip.dataset.active ? 'e.g. Provitamin D3' : 'Not found on page';

      priceInput.value = chip.dataset.price || '';
      descInput.value = chip.dataset.desc || '';
      freeFromInput.value = chip.dataset.free || '';
      freeFromInput.placeholder = chip.dataset.free ? 'e.g. Fragrance Free • Sulfates Free' : 'Not found on page';

      if (testedInput) {
        testedInput.value = chip.dataset.tested || '';
        testedInput.placeholder = chip.dataset.tested ? 'e.g. Proven Safe: Clinically Tested...' : 'Not found on page';
      }

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

  // Wire up "Score this creative" button
  const scoreCreativeBtn = document.getElementById('score-creative-btn');
  if (scoreCreativeBtn) {
    scoreCreativeBtn.addEventListener('click', () => {
      const creativePayload = {
        headline: (nameInput.value || '').trim(),
        active_ingredient: (activeInput.value || '').trim(),
        supporting_text: (descInput.value || '').trim(),
        free_from: (freeFromInput.value || '').trim(),
        tested_for: (testedInput.value || '').trim(),
        cta: (ctaInput.value || '').trim(),
        auto_score: true
      };
      try {
        sessionStorage.setItem('minimalist_score_transfer', JSON.stringify(creativePayload));
      } catch (e) {
        console.warn('SessionStorage write failed:', e);
      }
      window.location.href = '/score';
    });
  }

  // Check if compliant copy was transferred from the Scorer
  let hasTransferredCompliant = false;
  try {
    const compliantRaw = sessionStorage.getItem('minimalist_compliant_transfer');
    if (compliantRaw) {
      const cData = JSON.parse(compliantRaw);
      sessionStorage.removeItem('minimalist_compliant_transfer');
      if (cData.headline) nameInput.value = cData.headline;
      if (cData.active_ingredient) activeInput.value = cData.active_ingredient;
      if (cData.supporting_text) descInput.value = cData.supporting_text;
      if (cData.free_from) freeFromInput.value = cData.free_from;
      if (cData.tested_for) testedInput.value = cData.tested_for;
      if (cData.cta) ctaInput.value = cData.cta;
      hasTransferredCompliant = true;
      renderAdCreative();
    }
  } catch (e) {
    console.warn('Could not read transferred compliant copy:', e);
  }

  // Initialize with the first preset if no transferred data
  if (!hasTransferredCompliant) {
    if (presetChips.length > 0) {
      presetChips[0].click();
    } else {
      renderAdCreative();
    }
  }

  updateCanvasScale();
  setTimeout(updateCanvasScale, 150);
});
