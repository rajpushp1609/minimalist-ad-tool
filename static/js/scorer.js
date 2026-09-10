// Minimalist Brand & Policy Compliance Scorer Controller

document.addEventListener('DOMContentLoaded', () => {
  // Input mode tabs & containers
  const tabPasteMode = document.getElementById('tab-paste-mode');
  const tabStructuredMode = document.getElementById('tab-structured-mode');
  const pasteContainer = document.getElementById('paste-container');
  const structuredContainer = document.getElementById('structured-container');

  // Input Fields
  const rawCopyInput = document.getElementById('raw-copy-input');
  const scoreHeadline = document.getElementById('score-headline');
  const scoreActive = document.getElementById('score-active');
  const scoreSupporting = document.getElementById('score-supporting');
  const scoreFreefrom = document.getElementById('score-freefrom');
  const scoreTested = document.getElementById('score-tested');
  const scoreCta = document.getElementById('score-cta');

  // Form & Action Buttons
  const scorerForm = document.getElementById('scorer-form');
  const auditBtn = document.getElementById('audit-btn');
  const auditBtnText = document.getElementById('audit-btn-text');
  const clearScoreBtn = document.getElementById('clear-score-btn');

  // Sample Buttons
  const btnSampleCompliant = document.getElementById('btn-sample-compliant');
  const btnSampleViolation = document.getElementById('btn-sample-violation');
  const btnSampleFluff = document.getElementById('btn-sample-fluff');

  // Transferred Alert
  const transferAlert = document.getElementById('transfer-alert');
  const dismissTransfer = document.getElementById('dismiss-transfer');

  // Report Viewport States
  const reportEmptyState = document.getElementById('report-empty-state');
  const reportLoadingState = document.getElementById('report-loading-state');
  const auditResultsContainer = document.getElementById('audit-results-container');
  const reportStatusTag = document.getElementById('report-status-tag');
  const reportActions = document.getElementById('report-actions');
  const copySuggestedBtn = document.getElementById('copy-suggested-btn');
  const applyToStudioBtn = document.getElementById('apply-to-studio-btn');

  // Result Elements
  const verdictBanner = document.getElementById('verdict-banner');
  const verdictTagPill = document.getElementById('verdict-tag-pill');
  const verdictSummaryHeading = document.getElementById('verdict-summary-heading');
  const verdictSummaryText = document.getElementById('verdict-summary-text');
  const verdictMetricsStrip = document.getElementById('verdict-metrics-strip');

  const dim1VerdictPill = document.getElementById('dim1-verdict-pill');
  const dim1Body = document.getElementById('dim1-body');
  const dim2VerdictPill = document.getElementById('dim2-verdict-pill');
  const dim2Body = document.getElementById('dim2-body');
  const dim3VerdictPill = document.getElementById('dim3-verdict-pill');
  const dim3Body = document.getElementById('dim3-body');

  const suggestedCopyCard = document.getElementById('suggested-copy-card');
  const suggestedCopyText = document.getElementById('suggested-copy-text');
  const copyBtnInside = document.getElementById('copy-btn-inside');

  let currentMode = 'paste'; // 'paste' or 'structured'
  let latestCompliantCopy = null;

  // 1. Tab Switching
  function setInputMode(mode) {
    currentMode = mode;
    if (mode === 'paste') {
      tabPasteMode.classList.add('active');
      tabStructuredMode.classList.remove('active');
      pasteContainer.classList.remove('hidden');
      pasteContainer.style.display = 'block';
      structuredContainer.classList.add('hidden');
      structuredContainer.style.display = 'none';
    } else {
      tabStructuredMode.classList.add('active');
      tabPasteMode.classList.remove('active');
      structuredContainer.classList.remove('hidden');
      structuredContainer.style.display = 'block';
      pasteContainer.classList.add('hidden');
      pasteContainer.style.display = 'none';
    }
  }

  tabPasteMode.addEventListener('click', () => setInputMode('paste'));
  tabStructuredMode.addEventListener('click', () => setInputMode('structured'));

  // 2. Sample Data Definitions
  const SAMPLE_COMPLIANT = {
    headline: "Niacinamide 10% Face Serum",
    active_ingredient: "Niacinamide 10% + Zinc 1%",
    supporting_text: "For oily, acne-prone skin with post-inflammatory blemishes. Formulated with Niacinamide (Vitamin B3) to balance excess sebum secretion and Zinc PCA to help calm visible redness. Apply 2-3 drops daily in AM and PM routines after cleansing for visible results in 2-4 weeks with consistent use.",
    free_from: "Fragrance Free • Essential Oils Free • Dyes Free • Sulfates Free",
    tested_for: "The product has been evaluated for safety through patch testing under the supervision of a Dermatologist.",
    cta: "Shop Now at beminimalist.co"
  };

  const SAMPLE_VIOLATION = {
    headline: "100% Miracle Acne Cure Serum",
    active_ingredient: "Miracle Active",
    supporting_text: "Clinically proven to permanently cure cystic acne and eczema in just 24 hours. Detox your damaged skin from harmful toxic chemicals and experience zero pores guaranteed!",
    free_from: "100% Chemical-Free • Zero Toxins • Pure Natural Magic",
    tested_for: "Guaranteed overnight medical cure for all skin diseases.",
    cta: "Cure Your Acne Today"
  };

  const SAMPLE_FLUFF = {
    headline: "Goddess Glow Secret Elixir",
    active_ingredient: "Youth Nectar 50x",
    supporting_text: "Unlock eternal youth and radiant goddess skin. Transform into a poreless porcelain angel with our heavenly skin potion that stops the aging clock forever.",
    free_from: "Free from harsh dirty laboratory chemicals",
    tested_for: "Loved by 10,000 angels worldwide",
    cta: "Claim Your Goddess Glow Now"
  };

  function populateFields(data, triggerAudit = false) {
    scoreHeadline.value = data.headline || '';
    scoreActive.value = data.active_ingredient || '';
    scoreSupporting.value = data.supporting_text || '';
    scoreFreefrom.value = data.free_from || '';
    scoreTested.value = data.tested_for || '';
    scoreCta.value = data.cta || '';

    // Build raw paste representation
    const lines = [];
    if (data.headline) lines.push(`Headline: ${data.headline}`);
    if (data.active_ingredient) lines.push(`Active Ingredient: ${data.active_ingredient}`);
    if (data.supporting_text) lines.push(`Supporting Text: ${data.supporting_text}`);
    if (data.free_from) lines.push(`Free-From Claims: ${data.free_from}`);
    if (data.tested_for) lines.push(`Tested-For: ${data.tested_for}`);
    if (data.cta) lines.push(`CTA: ${data.cta}`);
    rawCopyInput.value = lines.join('\n');

    if (triggerAudit) {
      runComplianceAudit();
    }
  }

  btnSampleCompliant.addEventListener('click', () => populateFields(SAMPLE_COMPLIANT, true));
  btnSampleViolation.addEventListener('click', () => populateFields(SAMPLE_VIOLATION, true));
  btnSampleFluff.addEventListener('click', () => populateFields(SAMPLE_FLUFF, true));

  // 3. Clear Fields
  clearScoreBtn.addEventListener('click', () => {
    rawCopyInput.value = '';
    scoreHeadline.value = '';
    scoreActive.value = '';
    scoreSupporting.value = '';
    scoreFreefrom.value = '';
    scoreTested.value = '';
    scoreCta.value = '';
    resetReportState();
  });

  if (dismissTransfer) {
    dismissTransfer.addEventListener('click', () => {
      transferAlert.classList.add('hidden');
    });
  }

  // 4. SessionStorage Transfer from Studio
  try {
    const transferred = sessionStorage.getItem('minimalist_score_transfer');
    if (transferred) {
      const data = JSON.parse(transferred);
      sessionStorage.removeItem('minimalist_score_transfer');
      
      populateFields(data, false);
      setInputMode('structured');
      transferAlert.classList.remove('hidden');

      if (data.auto_score) {
        setTimeout(runComplianceAudit, 300);
      }
    }
  } catch (e) {
    console.warn('Could not read transfer data:', e);
  }

  // 5. Submit Audit
  scorerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runComplianceAudit();
  });

  async function runComplianceAudit() {
    let payload = {};

    if (currentMode === 'paste' && rawCopyInput.value.trim()) {
      payload = { ad_text: rawCopyInput.value.trim() };
    } else {
      payload = {
        headline: scoreHeadline.value.trim(),
        active_ingredient: scoreActive.value.trim(),
        supporting_text: scoreSupporting.value.trim(),
        free_from: scoreFreefrom.value.trim(),
        tested_for: scoreTested.value.trim(),
        cta: scoreCta.value.trim(),
        ad_text: rawCopyInput.value.trim()
      };
    }

    // Validate that at least something is provided
    if (!payload.ad_text && !payload.headline && !payload.supporting_text) {
      alert('Please enter or paste ad copy to audit.');
      return;
    }

    // Set Loading State
    setLoadingState(true);

    try {
      const resp = await fetch('/api/score-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Ad audit service encountered an error.');
      }

      renderAuditReport(data.verdict, payload);
    } catch (err) {
      console.error('Audit failed:', err);
      alert('Audit Error: ' + err.message);
      resetReportState();
    } finally {
      setLoadingState(false);
    }
  }

  function setLoadingState(isLoading) {
    auditBtn.disabled = isLoading;
    if (isLoading) {
      auditBtn.classList.add('btn-loading');
      auditBtnText.textContent = 'Auditing with DeepSeek...';
      reportEmptyState.classList.add('hidden');
      reportEmptyState.style.display = 'none';
      auditResultsContainer.classList.add('hidden');
      auditResultsContainer.style.display = 'none';
      reportLoadingState.classList.remove('hidden');
      reportLoadingState.style.display = 'flex';
      reportStatusTag.textContent = 'AUDITING...';
      reportStatusTag.className = 'report-status-tag status-tag-loading';
      reportActions.style.display = 'none';
    } else {
      auditBtn.classList.remove('btn-loading');
      auditBtnText.textContent = 'Run Compliance Audit';
      reportLoadingState.classList.add('hidden');
      reportLoadingState.style.display = 'none';
    }
  }

  function resetReportState() {
    reportEmptyState.classList.remove('hidden');
    reportEmptyState.style.display = 'flex';
    auditResultsContainer.classList.add('hidden');
    auditResultsContainer.style.display = 'none';
    reportLoadingState.classList.add('hidden');
    reportLoadingState.style.display = 'none';
    reportStatusTag.textContent = 'STANDBY';
    reportStatusTag.className = 'report-status-tag';
    reportActions.style.display = 'none';
  }

  // 6. Render Full Audit Report
  function renderAuditReport(verdict, originalInput) {
    reportEmptyState.classList.add('hidden');
    reportEmptyState.style.display = 'none';
    reportLoadingState.classList.add('hidden');
    reportLoadingState.style.display = 'none';
    auditResultsContainer.classList.remove('hidden');
    auditResultsContainer.style.display = 'flex';
    reportActions.style.display = 'flex';

    const overall = (verdict.overall_verdict || 'REVISE').toUpperCase();
    reportStatusTag.textContent = overall;

    // Overall verdict badge & banner classes
    verdictBanner.className = 'overall-verdict-banner';
    verdictTagPill.className = 'verdict-tag-pill';

    if (overall === 'PUBLISH') {
      verdictBanner.classList.add('banner-publish');
      verdictTagPill.classList.add('pill-publish');
      verdictTagPill.textContent = 'PUBLISH';
      reportStatusTag.className = 'report-status-tag status-tag-pass';
      verdictSummaryHeading.textContent = 'Approved for Minimalist Publishing';
      verdictSummaryText.textContent = verdict.overall_summary || 'Copy adheres to Indian cosmetic regulations (Drugs & Cosmetics 2020) and aligns with Minimalist scientific brand guidelines.';
    } else if (overall === 'BLOCK') {
      verdictBanner.classList.add('banner-block');
      verdictTagPill.classList.add('pill-block');
      verdictTagPill.textContent = 'BLOCK';
      reportStatusTag.className = 'report-status-tag status-tag-fail';
      verdictSummaryHeading.textContent = 'Legal or High-Risk Brand Violations Detected';
      verdictSummaryText.textContent = verdict.overall_summary || 'Copy contains serious legal claims (curative/medical disease treatment) or severe brand violations that must be blocked before publication.';
    } else {
      verdictBanner.classList.add('banner-revise');
      verdictTagPill.classList.add('pill-revise');
      verdictTagPill.textContent = 'NEEDS REVISION';
      reportStatusTag.className = 'report-status-tag status-tag-warn';
      verdictSummaryHeading.textContent = 'Revisions Required Prior to Release';
      verdictSummaryText.textContent = verdict.overall_summary || 'Minor claim or tone adjustments are required to achieve full compliance with Minimalist standards and ASCI truthfulness guidelines.';
    }

    // Extract dimensions flexibly (support both verdict.dimensions.policy_claims and verdict.dimension_1_policy_and_claims)
    const dim1 = (verdict.dimensions && verdict.dimensions.policy_claims) || 
                 verdict.dimension_1_policy_and_claims || 
                 (verdict.dimensions && verdict.dimensions.dimension_1) || {};

    const dim2 = (verdict.dimensions && verdict.dimensions.brand_tone) || 
                 verdict.dimension_2_brand_tone || 
                 (verdict.dimensions && verdict.dimensions.dimension_2) || {};

    const dim3 = (verdict.dimensions && verdict.dimensions.brand_language) || 
                 verdict.dimension_3_brand_language || 
                 (verdict.dimensions && verdict.dimensions.dimension_3) || {};

    // Count flags
    let highCount = 0;
    let medCount = 0;
    let lowCount = 0;
    [dim1, dim2, dim3].forEach(d => {
      if (d && Array.isArray(d.flags)) {
        d.flags.forEach(f => {
          const sev = (f.severity || '').toLowerCase();
          if (sev === 'high') highCount++;
          else if (sev === 'medium') medCount++;
          else if (sev === 'low') lowCount++;
        });
      }
    });

    verdictMetricsStrip.innerHTML = `
      <div class="metric-chip ${highCount > 0 ? 'chip-high' : 'chip-ok'}">
        <span class="metric-num">${highCount}</span>
        <span>High Severity Flags</span>
      </div>
      <div class="metric-chip ${medCount > 0 ? 'chip-med' : 'chip-ok'}">
        <span class="metric-num">${medCount}</span>
        <span>Medium Severity</span>
      </div>
      <div class="metric-chip chip-ok">
        <span class="metric-num">${lowCount}</span>
        <span>Low / Formatting</span>
      </div>
    `;

    // Render Dimensions
    renderDimension(dim1, dim1VerdictPill, dim1Body, "Drugs & Cosmetics Act 1940 / Cosmetics Rules 2020 & ASCI Code Ch. I");
    renderDimension(dim2, dim2VerdictPill, dim2Body, "beminimalist.co/pages/our-values (Anti-Fearmongering & Science-First)");
    renderDimension(dim3, dim3VerdictPill, dim3Body, "Minimalist Active Concentration % Standard & Lexicon Guide");

    // Suggested Compliant Copy
    if (verdict.suggested_compliant_copy) {
      suggestedCopyCard.style.display = 'block';
      let formattedCopy = '';
      if (typeof verdict.suggested_compliant_copy === 'object') {
        const parts = [];
        if (verdict.suggested_compliant_copy.headline) parts.push(`Headline: ${verdict.suggested_compliant_copy.headline}`);
        if (verdict.suggested_compliant_copy.active_ingredient) parts.push(`Active Ingredient: ${verdict.suggested_compliant_copy.active_ingredient}`);
        if (verdict.suggested_compliant_copy.supporting_text) parts.push(`Supporting Text: ${verdict.suggested_compliant_copy.supporting_text}`);
        if (verdict.suggested_compliant_copy.free_from) parts.push(`Free-From Claims: ${verdict.suggested_compliant_copy.free_from}`);
        if (verdict.suggested_compliant_copy.tested_for) parts.push(`Tested-For: ${verdict.suggested_compliant_copy.tested_for}`);
        if (verdict.suggested_compliant_copy.cta) parts.push(`CTA: ${verdict.suggested_compliant_copy.cta}`);
        formattedCopy = parts.join('\n');
        latestCompliantCopy = verdict.suggested_compliant_copy;
      } else {
        formattedCopy = String(verdict.suggested_compliant_copy);
        latestCompliantCopy = { headline: formattedCopy };
      }
      suggestedCopyText.textContent = formattedCopy;
    } else {
      suggestedCopyCard.style.display = 'none';
      latestCompliantCopy = null;
    }
  }

  function renderDimension(dimData, pillEl, bodyEl, defaultCitation) {
    if (!dimData || Object.keys(dimData).length === 0) {
      pillEl.className = 'dim-verdict-pill pill-pass';
      pillEl.textContent = 'PASS';
      bodyEl.innerHTML = '<div class="dim-pass-notice"><div class="pass-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><div class="pass-text"><strong>Full Compliance</strong><span>No violations detected.</span></div></div>';
      return;
    }

    const verdict = (dimData.verdict || 'Pass').trim();
    const flags = Array.isArray(dimData.flags) ? dimData.flags : [];

    pillEl.className = 'dim-verdict-pill';
    if (verdict.toLowerCase().includes('fail') || verdict.toLowerCase().includes('block')) {
      pillEl.classList.add('pill-block');
      pillEl.textContent = 'FAIL';
    } else if (verdict.toLowerCase().includes('revision') || verdict.toLowerCase().includes('needs')) {
      pillEl.classList.add('pill-revise');
      pillEl.textContent = 'NEEDS REVISION';
    } else {
      pillEl.classList.add('pill-pass');
      pillEl.textContent = 'PASS';
    }

    if (flags.length === 0) {
      bodyEl.innerHTML = `
        <div class="dim-pass-notice">
          <div class="pass-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="pass-text">
            <strong>Full Compliance</strong>
            <span>Ad copy strictly aligns with ${escapeHtml(defaultCitation)}.</span>
          </div>
        </div>
      `;
      return;
    }

    let flagsHtml = `<div class="flags-list">`;
    flags.forEach((f, idx) => {
      const sev = (f.severity || 'Medium').toLowerCase();
      const sevClass = sev === 'high' ? 'sev-high' : (sev === 'medium' ? 'sev-medium' : 'sev-low');
      const sevLabel = (f.severity || 'Medium').toUpperCase();
      const flaggedSpan = f.span || f.flagged_span || '';
      const flagIssue = f.issue || f.reason || f.explanation || '';
      const flagCitation = f.citation || f.legal_or_brand_citation || f.rule_citation || defaultCitation;
      const flagFix = f.suggested_fix || f.fix || '';

      flagsHtml += `
        <div class="flag-item ${sevClass}">
          <div class="flag-top">
            <span class="severity-badge ${sevClass}">${sevLabel} SEVERITY</span>
            <span class="flag-citation">${escapeHtml(flagCitation)}</span>
          </div>
          ${flaggedSpan ? `
            <div class="flag-quoted-block">
              <span class="quote-prefix">Flagged Span:</span>
              <span class="quote-text">&ldquo;${escapeHtml(flaggedSpan)}&rdquo;</span>
            </div>
          ` : ''}
          <div class="flag-reason">
            <strong>Violation:</strong> ${escapeHtml(flagIssue)}
          </div>
          ${flagFix ? `
            <div class="flag-fix">
              <span class="fix-prefix">Suggested Fix:</span>
              <span class="fix-text">&ldquo;${escapeHtml(flagFix)}&rdquo;</span>
            </div>
          ` : ''}
        </div>
      `;
    });
    flagsHtml += `</div>`;
    bodyEl.innerHTML = flagsHtml;
  }

  // 7. Copy Actions
  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  if (copySuggestedBtn) {
    copySuggestedBtn.addEventListener('click', () => {
      const text = suggestedCopyText.textContent;
      if (text) {
        copyTextToClipboard(text);
        const orig = copySuggestedBtn.innerHTML;
        copySuggestedBtn.innerHTML = '<span>Copied!</span>';
        setTimeout(() => { copySuggestedBtn.innerHTML = orig; }, 1800);
      }
    });
  }

  if (copyBtnInside) {
    copyBtnInside.addEventListener('click', () => {
      const text = suggestedCopyText.textContent;
      if (text) {
        copyTextToClipboard(text);
        copyBtnInside.textContent = 'Copied!';
        setTimeout(() => { copyBtnInside.textContent = 'Copy Text'; }, 1800);
      }
    });
  }

  // 8. Apply Compliant Copy to Studio
  if (applyToStudioBtn) {
    applyToStudioBtn.addEventListener('click', () => {
      if (!latestCompliantCopy) {
        alert('No compliant copy available to transfer.');
        return;
      }
      try {
        sessionStorage.setItem('minimalist_compliant_transfer', JSON.stringify(latestCompliantCopy));
      } catch (e) {
        console.warn('SessionStorage write failed:', e);
      }
      window.location.href = '/';
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
