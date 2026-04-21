/* ========================================
   GovProcure RFP Portal - Edge Cases JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================
  // B1: Contenteditable - handled by CSS :empty::before
  // ========================================

  // ========================================
  // B2: Custom Dropdown
  // ========================================
  const customDropdown = document.getElementById('custom-dropdown');
  if (customDropdown) {
    const trigger = customDropdown.querySelector('.custom-dropdown-trigger');
    const menu = customDropdown.querySelector('.custom-dropdown-menu');
    const hiddenInput = document.getElementById('custom-dropdown-value');
    const triggerText = trigger.querySelector('span');

    trigger.addEventListener('click', () => {
      const isOpen = menu.classList.contains('custom-dropdown-menu--open');
      menu.classList.toggle('custom-dropdown-menu--open');
      trigger.classList.toggle('custom-dropdown-trigger--open');
      if (isOpen) menu.classList.remove('custom-dropdown-menu--open');
    });

    menu.querySelectorAll('.custom-dropdown-option').forEach(opt => {
      opt.addEventListener('click', () => {
        menu.querySelectorAll('.custom-dropdown-option').forEach(o => o.classList.remove('custom-dropdown-option--selected'));
        opt.classList.add('custom-dropdown-option--selected');
        hiddenInput.value = opt.dataset.value;
        triggerText.textContent = opt.textContent;
        triggerText.classList.remove('placeholder');
        menu.classList.remove('custom-dropdown-menu--open');
        trigger.classList.remove('custom-dropdown-trigger--open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!customDropdown.contains(e.target)) {
        menu.classList.remove('custom-dropdown-menu--open');
        trigger.classList.remove('custom-dropdown-trigger--open');
      }
    });
  }

  // ========================================
  // B3: Autocomplete / Autosuggest
  // ========================================
  const autocompleteInput = document.getElementById('autocomplete-input');
  const suggestionsList = document.getElementById('autocomplete-suggestions');
  const technologies = [
    'Amazon Web Services (AWS)', 'Microsoft Azure', 'Google Cloud Platform',
    'Kubernetes', 'Docker', 'Terraform', 'Ansible', 'Jenkins',
    'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java',
    'GraphQL', 'REST API', 'gRPC', 'Apache Kafka',
    'Datadog', 'Splunk', 'New Relic', 'Prometheus', 'Grafana'
  ];

  if (autocompleteInput && suggestionsList) {
    let debounceTimer;
    autocompleteInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = autocompleteInput.value.toLowerCase().trim();
        if (query.length < 2) {
          suggestionsList.classList.remove('autocomplete-suggestions--open');
          return;
        }
        const matches = technologies.filter(t => t.toLowerCase().includes(query));
        if (matches.length === 0) {
          suggestionsList.classList.remove('autocomplete-suggestions--open');
          return;
        }
        suggestionsList.innerHTML = matches.map(m => {
          const idx = m.toLowerCase().indexOf(query);
          const highlighted = m.slice(0, idx) + '<mark>' + m.slice(idx, idx + query.length) + '</mark>' + m.slice(idx + query.length);
          return `<div class="autocomplete-suggestion" data-value="${m}">${highlighted}</div>`;
        }).join('');
        suggestionsList.classList.add('autocomplete-suggestions--open');

        suggestionsList.querySelectorAll('.autocomplete-suggestion').forEach(s => {
          s.addEventListener('click', () => {
            autocompleteInput.value = s.dataset.value;
            suggestionsList.classList.remove('autocomplete-suggestions--open');
          });
        });
      }, 200);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.autocomplete-wrapper')) {
        suggestionsList.classList.remove('autocomplete-suggestions--open');
      }
    });
  }

  // ========================================
  // B4: Rich Text Editor
  // ========================================
  document.querySelectorAll('.rich-editor-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = btn.dataset.command;
      if (cmd) {
        document.execCommand(cmd, false, null);
        btn.classList.toggle('rich-editor-btn--active');
      }
    });
  });

  // ========================================
  // B5: Dynamic Inputs (Add Team Member)
  // ========================================
  const dynamicContainer = document.getElementById('dynamic-rows');
  const addRowBtn = document.getElementById('add-dynamic-row');
  let dynamicCount = 1;

  if (addRowBtn && dynamicContainer) {
    addRowBtn.addEventListener('click', () => {
      dynamicCount++;
      const row = document.createElement('div');
      row.className = 'dynamic-row';
      row.innerHTML = `
        <div class="form-group">
          <label class="form-label">Member Name</label>
          <input type="text" class="form-input" name="team_member_name_${dynamicCount}" placeholder="Full name">
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <input type="text" class="form-input" name="team_member_role_${dynamicCount}" placeholder="Role / Title">
        </div>
        <button type="button" class="btn-remove" title="Remove">&times;</button>
      `;
      dynamicContainer.appendChild(row);
      row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
    });
  }

  // ========================================
  // B6: Debounced Input
  // ========================================
  const debounceInput = document.getElementById('debounce-input');
  const debounceStatus = document.getElementById('debounce-status');
  if (debounceInput && debounceStatus) {
    let timer;
    debounceInput.addEventListener('input', () => {
      debounceStatus.className = 'debounce-status debounce-status--typing';
      debounceStatus.textContent = 'Typing...';
      clearTimeout(timer);
      timer = setTimeout(() => {
        debounceStatus.className = 'debounce-status debounce-status--saved';
        debounceStatus.textContent = 'Saved';
      }, 300);
    });
  }

  // ========================================
  // C4: Shadow DOM Star Rating
  // ========================================
  class StarRating extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      const max = parseInt(this.getAttribute('max') || '5', 10);
      const name = this.getAttribute('name') || 'star_rating';

      shadow.innerHTML = `
        <style>
          :host { display: inline-flex; align-items: center; gap: 4px; }
          .star {
            width: 28px; height: 28px; cursor: pointer; fill: #d1d5db;
            transition: fill 0.15s ease;
          }
          .star:hover, .star.active { fill: #eab308; }
          .star:hover ~ .star { fill: #d1d5db; }
          input { display: none; }
          .label { margin-left: 8px; font-size: 0.875rem; color: #6b7280; }
        </style>
        <input type="hidden" name="${name}" value="0">
        ${Array.from({ length: max }, (_, i) => `
          <svg class="star" data-value="${i + 1}" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        `).join('')}
        <span class="label">0 / ${max}</span>
      `;

      const input = shadow.querySelector('input');
      const label = shadow.querySelector('.label');
      const stars = shadow.querySelectorAll('.star');

      stars.forEach(star => {
        star.addEventListener('click', () => {
          const val = parseInt(star.dataset.value, 10);
          input.value = val;
          label.textContent = `${val} / ${max}`;
          stars.forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.value, 10) <= val);
          });
        });
      });
    }
  }
  customElements.define('star-rating', StarRating);

  // ========================================
  // C5: Conditional Fields
  // ========================================
  document.querySelectorAll('input[name="edge_conditional"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('edge-conditional-a').style.display = radio.value === 'option-a' ? 'block' : 'none';
      document.getElementById('edge-conditional-b').style.display = radio.value === 'option-b' ? 'block' : 'none';
    });
  });

  // ========================================
  // C6: Multi-step Wizard
  // ========================================
  const wizardSteps = document.querySelectorAll('.wizard-step');
  const wizardPanels = document.querySelectorAll('.wizard-panel');
  let currentStep = 0;

  function showWizardStep(step) {
    wizardSteps.forEach((s, i) => {
      s.classList.remove('wizard-step--active', 'wizard-step--completed');
      if (i === step) s.classList.add('wizard-step--active');
      else if (i < step) s.classList.add('wizard-step--completed');
    });
    wizardPanels.forEach((p, i) => {
      p.classList.toggle('wizard-panel--active', i === step);
    });
    currentStep = step;
  }

  document.querySelectorAll('[data-wizard-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < wizardPanels.length - 1) showWizardStep(currentStep + 1);
    });
  });

  document.querySelectorAll('[data-wizard-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) showWizardStep(currentStep - 1);
    });
  });

  // ========================================
  // C7: Disabled/Readonly with Unlock
  // ========================================
  const unlockBtn = document.getElementById('unlock-fields-btn');
  if (unlockBtn) {
    unlockBtn.addEventListener('click', () => {
      const locked = unlockBtn.dataset.locked === 'true';
      document.getElementById('locked-field-1').disabled = !locked;
      document.getElementById('locked-field-2').readOnly = !locked;
      unlockBtn.textContent = locked ? 'Lock Fields' : 'Unlock Fields';
      unlockBtn.dataset.locked = locked ? 'false' : 'true';
    });
  }

  // ========================================
  // C8: Input Masks
  // ========================================
  const einInput = document.getElementById('ein-mask');
  if (einInput) {
    einInput.addEventListener('input', function () {
      let val = this.value.replace(/[^0-9]/g, '').slice(0, 9);
      if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
      this.value = val;
    });
  }

  const phoneMask = document.getElementById('phone-mask');
  if (phoneMask) {
    phoneMask.addEventListener('input', function () {
      let val = this.value.replace(/[^0-9]/g, '').slice(0, 10);
      if (val.length > 6) val = '(' + val.slice(0, 3) + ') ' + val.slice(3, 6) + '-' + val.slice(6);
      else if (val.length > 3) val = '(' + val.slice(0, 3) + ') ' + val.slice(3);
      else if (val.length > 0) val = '(' + val;
      this.value = val;
    });
  }

  // ========================================
  // C10: Auto-calculated Fields
  // ========================================
  const hoursInput = document.getElementById('calc-hours');
  const rateInput = document.getElementById('calc-rate');
  const totalDisplay = document.getElementById('calc-total');
  if (hoursInput && rateInput && totalDisplay) {
    function calcTotal() {
      const h = parseFloat(hoursInput.value) || 0;
      const r = parseFloat(rateInput.value) || 0;
      totalDisplay.value = h && r ? '$' + (h * r).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
    }
    hoursInput.addEventListener('input', calcTotal);
    rateInput.addEventListener('input', calcTotal);
  }

  // ========================================
  // C11: Maxlength Textarea with Counter
  // (handled by shared.js - just needs data attrs)
  // ========================================

  // ========================================
  // C9: Hidden fields - set values on load
  // ========================================
  const sessionField = document.getElementById('hidden-session');
  const timestampField = document.getElementById('hidden-timestamp');
  if (sessionField) sessionField.value = 'sess_' + Math.random().toString(36).slice(2, 11);
  if (timestampField) timestampField.value = new Date().toISOString();
});
