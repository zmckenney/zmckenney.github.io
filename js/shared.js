/* ========================================
   Meridian RFP Portal - Shared Utilities
   ======================================== */

// Toast notification
function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast--${type}`;
  // Trigger reflow for animation
  void toast.offsetWidth;
  toast.classList.add('toast--visible');
  setTimeout(() => toast.classList.remove('toast--visible'), 2500);
}

// Save Draft handler
function handleSaveDraft() {
  showToast('Draft saved successfully');
}

// Previous / Next navigation
function getPrevNextPages() {
  const pageId = document.body.dataset.pageId;
  if (!pageId || typeof ALL_PAGES === 'undefined') return { prev: null, next: null };

  const currentIndex = ALL_PAGES.findIndex(p => p.id === pageId);
  const basePath = getBasePath();

  return {
    prev: currentIndex > 0 ? basePath + ALL_PAGES[currentIndex - 1].href : null,
    next: currentIndex < ALL_PAGES.length - 1 ? basePath + ALL_PAGES[currentIndex + 1].href : null
  };
}

// Bind action bar buttons
document.addEventListener('DOMContentLoaded', () => {
  const saveDraftBtn = document.getElementById('btn-save-draft');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', handleSaveDraft);
  }

  const { prev, next } = getPrevNextPages();

  if (prevBtn) {
    if (prev) {
      prevBtn.href = prev;
    } else {
      prevBtn.classList.add('btn');
      prevBtn.style.opacity = '0.4';
      prevBtn.style.pointerEvents = 'none';
    }
  }

  if (nextBtn) {
    if (next) {
      nextBtn.href = next;
    } else {
      nextBtn.style.opacity = '0.4';
      nextBtn.style.pointerEvents = 'none';
    }
  }

  // Conditional visibility for radio toggles
  document.querySelectorAll('[data-conditional-trigger]').forEach(radio => {
    radio.addEventListener('change', () => {
      const group = radio.getAttribute('name');
      const targetId = radio.dataset.conditionalTarget;
      const show = radio.dataset.conditionalTrigger === 'show';

      // Hide all conditional sections for this group
      document.querySelectorAll(`[data-conditional-group="${group}"]`).forEach(el => {
        el.classList.remove('conditional-section--visible');
      });

      // Show the target
      if (show && targetId) {
        const target = document.getElementById(targetId);
        if (target) target.classList.add('conditional-section--visible');
      }
    });
  });

  // Character counters
  document.querySelectorAll('[data-maxlength-counter]').forEach(textarea => {
    const max = parseInt(textarea.getAttribute('maxlength'), 10);
    const counter = document.getElementById(textarea.dataset.maxlengthCounter);
    if (!counter || !max) return;

    function updateCounter() {
      const remaining = max - textarea.value.length;
      counter.textContent = `${textarea.value.length} / ${max} characters`;
      counter.className = 'char-counter';
      if (remaining <= 50) counter.classList.add('char-counter--warning');
      if (remaining <= 10) counter.classList.add('char-counter--danger');
    }

    textarea.addEventListener('input', updateCounter);
    updateCounter();
  });

  // File upload click
  document.querySelectorAll('.file-upload').forEach(upload => {
    upload.addEventListener('click', () => {
      const input = upload.querySelector('input[type="file"]');
      if (input) input.click();
    });
  });

  // Rich text editors (contenteditable + execCommand toolbar)
  document.querySelectorAll('.rich-editor-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = btn.dataset.command;
      if (!cmd) return;
      const editor = btn.closest('.rich-editor');
      const content = editor ? editor.querySelector('.rich-editor-content') : null;
      if (content) content.focus();
      document.execCommand(cmd, false, null);
      btn.classList.toggle('rich-editor-btn--active');
    });
  });
});
