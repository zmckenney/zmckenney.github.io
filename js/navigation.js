/* ========================================
   Meridian RFP Portal - Navigation
   ======================================== */

const NAV_TREE = [
  {
    id: 'section1',
    number: '1',
    label: 'Company Profile',
    children: [
      { id: 'organization-details', number: '1.1', label: 'Organization Identification', href: 'pages/section1/organization-details.html' },
      {
        id: 'financial-overview',
        number: '1.2',
        label: 'Financial Overview',
        children: [
          { id: 'revenue-growth', number: '1.2.1', label: 'Revenue & Growth', href: 'pages/section1/revenue-growth.html' },
          { id: 'financial-stability', number: '1.2.2', label: 'Financial Stability', href: 'pages/section1/financial-stability.html' }
        ]
      },
      { id: 'past-performance', number: '1.3', label: 'Past Performance', href: 'pages/section1/past-performance.html' }
    ]
  },
  {
    id: 'section2',
    number: '2',
    label: 'Clinical & Technical Approach',
    children: [
      {
        id: 'service-model',
        number: '2.1',
        label: 'Service Model & Integrations',
        children: [
          { id: 'system-design', number: '2.1.1', label: 'Clinical Service Model', href: 'pages/section2/system-design.html' },
          { id: 'integration-plan', number: '2.1.2', label: 'Care Coordination & Integrations', href: 'pages/section2/integration-plan.html' }
        ]
      },
      {
        id: 'privacy-compliance',
        number: '2.2',
        label: 'Privacy, Compliance & Standards',
        children: [
          { id: 'data-protection', number: '2.2.1', label: 'Privacy & Data Protection', href: 'pages/section2/data-protection.html' },
          {
            id: 'regulatory',
            number: '2.2.2',
            label: 'Regulatory Compliance',
            children: [
              { id: 'federal-compliance', number: '2.2.2.1', label: 'HIPAA & Federal Regulations', href: 'pages/section2/federal-compliance.html' },
              { id: 'industry-standards', number: '2.2.2.2', label: 'Accreditation & Industry Standards', href: 'pages/section2/industry-standards.html' }
            ]
          }
        ]
      },
      { id: 'implementation-timeline', number: '2.3', label: 'Implementation Approach', href: 'pages/section2/implementation-timeline.html' }
    ]
  },
  {
    id: 'section3',
    number: '3',
    label: 'Additional Information',
    children: [
      { id: 'additional-information', number: '3.1', label: 'Executive Summary & Differentiators', href: 'pages/section3/additional-information.html' }
    ]
  }
];

// Collect all leaf pages in order
function getLeafPages(nodes) {
  const pages = [];
  for (const node of nodes) {
    if (node.href) pages.push(node);
    if (node.children) pages.push(...getLeafPages(node.children));
  }
  return pages;
}

const ALL_PAGES = getLeafPages(NAV_TREE);

// Get depth from body attribute (how many ../ to prepend)
function getBasePath() {
  const depth = parseInt(document.body.dataset.depth || '0', 10);
  return '../'.repeat(depth);
}

// Find node and its ancestors by page ID
function findNodePath(nodes, targetId, path = []) {
  for (const node of nodes) {
    const currentPath = [...path, node];
    if (node.id === targetId) return currentPath;
    if (node.children) {
      const found = findNodePath(node.children, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
}

// Render sidebar tree
function renderSidebar() {
  const container = document.getElementById('sidebar-nav');
  if (!container) return;

  const pageId = document.body.dataset.pageId;
  const activePath = pageId ? findNodePath(NAV_TREE, pageId) : null;
  const activeIds = activePath ? new Set(activePath.map(n => n.id)) : new Set();
  const basePath = getBasePath();

  function renderNode(node, depth) {
    const isActive = node.id === pageId;
    const isExpanded = activeIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSection = depth === 0;

    let html = `<li class="nav-item nav-depth-${depth + 1}">`;

    if (isSection) {
      // Top-level section header
      html += `<button class="nav-link nav-link--section" data-toggle="${node.id}" aria-expanded="${isExpanded}">`;
      html += `<svg class="nav-chevron ${isExpanded ? 'nav-chevron--expanded' : ''}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4l4 4-4 4"/></svg>`;
      html += `<span class="nav-number">${node.number}</span>`;
      html += `<span>${node.label}</span>`;
      html += `</button>`;
    } else if (hasChildren) {
      // Expandable parent (not a leaf)
      html += `<button class="nav-link" data-toggle="${node.id}" aria-expanded="${isExpanded}">`;
      html += `<svg class="nav-chevron ${isExpanded ? 'nav-chevron--expanded' : ''}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4l4 4-4 4"/></svg>`;
      html += `<span class="nav-number">${node.number}</span>`;
      html += `<span>${node.label}</span>`;
      html += `</button>`;
    } else {
      // Leaf page
      html += `<a class="nav-link ${isActive ? 'nav-link--active' : ''}" href="${basePath}${node.href}">`;
      html += `<span class="nav-number">${node.number}</span>`;
      html += `<span>${node.label}</span>`;
      html += `</a>`;
    }

    if (hasChildren) {
      html += `<ul class="nav-tree nav-children ${isExpanded ? '' : 'nav-children--collapsed'}" id="children-${node.id}">`;
      for (const child of node.children) {
        html += renderNode(child, depth + 1);
      }
      html += `</ul>`;
    }

    html += `</li>`;
    return html;
  }

  let html = '<ul class="nav-tree">';
  for (const node of NAV_TREE) {
    html += renderNode(node, 0);
  }
  html += '</ul>';
  container.innerHTML = html;

  // Bind toggle handlers
  container.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.toggle;
      const children = document.getElementById(`children-${targetId}`);
      const chevron = btn.querySelector('.nav-chevron');
      if (children) {
        children.classList.toggle('nav-children--collapsed');
        const expanded = !children.classList.contains('nav-children--collapsed');
        btn.setAttribute('aria-expanded', expanded);
        if (chevron) chevron.classList.toggle('nav-chevron--expanded', expanded);
      }
    });
  });
}

// Render breadcrumbs
function renderBreadcrumbs() {
  const container = document.getElementById('breadcrumbs');
  if (!container) return;

  const pageId = document.body.dataset.pageId;
  const path = pageId ? findNodePath(NAV_TREE, pageId) : null;
  const basePath = getBasePath();

  let html = `<a href="${basePath}index.html">Home</a>`;

  if (path) {
    for (let i = 0; i < path.length; i++) {
      html += '<span class="breadcrumb-sep">/</span>';
      if (i === path.length - 1) {
        html += `<span class="current">${path[i].label}</span>`;
      } else {
        html += `<span>${path[i].label}</span>`;
      }
    }
  }

  container.innerHTML = html;
}

// Render progress bar
function renderProgress() {
  const container = document.getElementById('progress-bar');
  if (!container) return;

  const pageId = document.body.dataset.pageId;
  const currentIndex = ALL_PAGES.findIndex(p => p.id === pageId);
  const total = ALL_PAGES.length;
  const current = currentIndex >= 0 ? currentIndex + 1 : 0;
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  container.innerHTML = `
    <div class="progress-bar-label">
      <span>Page ${current} of ${total}</span>
      <span>${percent}% Complete</span>
    </div>
    <div class="progress-bar-track">
      <div class="progress-bar-fill" style="width: ${percent}%"></div>
    </div>
  `;
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  renderBreadcrumbs();
  renderProgress();
});
