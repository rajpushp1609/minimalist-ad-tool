// Minimalist Ad Creative Studio - Frontend Controller

document.addEventListener('DOMContentLoaded', () => {
  // Form Controls
  const form = document.getElementById('ad-form');
  const nameInput = document.getElementById('product-name');
  const activeInput = document.getElementById('active-ingredient');
  const priceInput = document.getElementById('product-price');
  const descInput = document.getElementById('short-description');
  const freeFromInput = document.getElementById('free-from');
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
  const adCtaText = document.getElementById('ad-cta-text');
  const adImg = document.getElementById('ad-product-img');

  const DEFAULT_IMG = "/static/images/niacinamide.png";

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
    if (!val) return '₹599 / 30ml';
    val = val.trim();
    if (!val.startsWith('₹') && !val.toLowerCase().startsWith('rs')) {
      return `₹${val}`;
    }
    return val;
  }

  // Render Ad Canvas strictly from inputs
  function renderAdCreative() {
    const name = nameInput.value.trim() || 'Niacinamide 10% + Zinc 1%';
    const active = activeInput.value.trim() || 'Niacinamide 10% • Zinc PCA 1%';
    const price = formatPrice(priceInput.value);
    const desc = descInput.value.trim() || 'Clinically proven face serum that balances sebum secretion, minimizes enlarged pores, and clears dark blemishes.';
    const freeFrom = freeFromInput.value.trim() || 'Fragrance Free • Non-Comedogenic • Essential Oil Free • Dye Free';
    const cta = ctaInput.value.trim() || 'Shop Now at beminimalist.co';
    const imgUrl = imageInput.value.trim() || DEFAULT_IMG;

    // Direct mapping to template elements
    adHeadline.textContent = name;
    adActive.textContent = active;
    adPrice.textContent = price;
    adDesc.textContent = desc;
    adClaims.textContent = freeFrom;
    adCtaText.textContent = cta;

    if (imgUrl) {
      adImg.src = imgUrl;
      adImg.onerror = () => {
        console.warn('Custom image failed to load, falling back to default Minimalist bottle.');
        adImg.src = DEFAULT_IMG;
      };
    }
  }

  // Live updates on typing
  [nameInput, activeInput, priceInput, descInput, freeFromInput, ctaInput, imageInput].forEach(input => {
    input.addEventListener('input', renderAdCreative);
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

  // Form Submit
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

      nameInput.value = chip.dataset.name || '';
      activeInput.value = chip.dataset.active || '';
      priceInput.value = chip.dataset.price || '';
      descInput.value = chip.dataset.desc || '';
      freeFromInput.value = chip.dataset.free || '';
      ctaInput.value = chip.dataset.cta || '';
      imageInput.value = chip.dataset.image || '';

      renderAdCreative();
    });
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    if (presetChips.length > 0) {
      presetChips[0].click();
    } else {
      form.reset();
      renderAdCreative();
    }
  });

  // High-Fidelity 1080x1080 Native PNG Export (No CSS Transform, White Background, No Black Area)
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
        allowTaint: true,
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
