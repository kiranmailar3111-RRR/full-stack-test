/* ============================================
   WPoets – main.js
   Tabs · Slider · Col-3 sync · CRUD Admin
   ============================================ */

const API_BASE = 'php/api.php?path=';

/* ── Toast ── */
function showToast(msg, type = 'success') {
  const $t = $('#toast');
  $t.text(msg).removeClass('error show');
  if (type === 'error') $t.addClass('error');
  // Force reflow so transition fires even if toast was just shown
  void $t[0].offsetWidth;
  $t.addClass('show');
  clearTimeout($t.data('timer'));
  $t.data('timer', setTimeout(() => $t.removeClass('show'), 3400));
}

/* ── API fetch wrapper ── */
async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch (e) { throw new Error('Server returned non-JSON: ' + text.substring(0, 120)); }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* ============================================
   IMAGE PATHS
   Change these paths once your images are in place.
   The files are already in files/images/ in the repo.
   ============================================ */
const CATEGORY_IMAGES = {
  'learning':      'files/images/DL-learning.svg',
  'technology':    'files/images/DL-technology.svg',
  'communication': 'files/images/DL-communication.svg',
};
const DEFAULT_ICON = 'files/images/DL-learning.svg';

function getIconForSlug(slug) {
  const key = (slug || '').toLowerCase();
  for (const k of Object.keys(CATEGORY_IMAGES)) {
    if (key.includes(k)) return CATEGORY_IMAGES[k];
  }
  return DEFAULT_ICON;
}

/* ============================================
   SHOWCASE STATE
   ============================================ */
let allData        = [];
let activeCatIndex = 0;
let activeSlide    = 0;

function getCurrentSlides() {
  return allData[activeCatIndex]?.slides || [];
}

/* ── Col 1: Tabs ── */
function renderTabs() {
  const $col = $('#colTabs').empty();
  allData.forEach((cat, i) => {
    const $btn = $(`
      <button class="tab-btn${i === activeCatIndex ? ' active' : ''}" data-index="${i}" role="tab">
        <div class="tab-icon">
          <img src="${getIconForSlug(cat.slug)}" alt="${cat.name}">
        </div>
        <span class="tab-label">${cat.name}</span>
      </button>`);
    $col.append($btn);
  });
}

$(document).on('click', '#colTabs .tab-btn', function () {
  activeCatIndex = parseInt($(this).data('index'));
  activeSlide    = 0;
  renderTabs();
  renderSlider();
  renderMobile();
});

/* ── Col 2: Slider ── */
function renderSlider() {
  const slides   = getCurrentSlides();
  const $track   = $('#sliderTrack').empty();
  const $dots    = $('#sliderDots').empty();

  slides.forEach((s, i) => {
    $track.append(`
      <div class="slide">
        <span class="slide-eyebrow">${s.eyebrow || 'Digital Learning Infrastructure'}</span>
        <h3 class="slide-title">${s.title}</h3>
        <button class="slide-cta">
          Learn More <img src="files/images/arrow-right.svg" alt="">
        </button>
      </div>`);
    $dots.append(`<span class="dot${i === activeSlide ? ' active' : ''}" data-slide="${i}"></span>`);
  });

  $('#sliderTrack').css('transform', `translateX(-${activeSlide * 100}%)`);
  $('#slideCounter').text(slides.length
    ? `${String(activeSlide + 1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}` : '–');

  syncFeatureImage();
}

function syncFeatureImage() {
  const slides = getCurrentSlides();
  const $img   = $('#featureImg');
  if (!slides.length) { $img.attr('src', ''); return; }
  const src = slides[activeSlide]?.thumbnail_image || slides[activeSlide]?.slide_image || '';
  if ($img.attr('src') !== src) {
    $img.addClass('leaving');
    setTimeout(() => {
      $img.attr({ src, alt: slides[activeSlide]?.title || '' }).removeClass('leaving');
    }, 360);
  }
}

function goToSlide(n) {
  const slides = getCurrentSlides();
  if (!slides.length) return;
  activeSlide = (n + slides.length) % slides.length;
  $('#sliderTrack').css('transform', `translateX(-${activeSlide * 100}%)`);
  $('#sliderDots .dot').each(function (i) { $(this).toggleClass('active', i === activeSlide); });
  $('#slideCounter').text(
    `${String(activeSlide + 1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`);
  syncFeatureImage();
}

$(document).on('click', '#sliderDots .dot', function () { goToSlide(parseInt($(this).data('slide'))); });
$(document).on('click', '#btnPrev', () => goToSlide(activeSlide - 1));
$(document).on('click', '#btnNext', () => goToSlide(activeSlide + 1));
$(document).on('keydown', e => {
  if (e.key === 'ArrowLeft')  goToSlide(activeSlide - 1);
  if (e.key === 'ArrowRight') goToSlide(activeSlide + 1);
});

let touchStartX = 0;
$(document).on('touchstart', '#colSlider', e => {
  touchStartX = e.originalEvent.touches[0].clientX;
}, { passive: true });
$(document).on('touchend', '#colSlider', e => {
  const dx = touchStartX - e.originalEvent.changedTouches[0].clientX;
  if (Math.abs(dx) > 40) goToSlide(activeSlide + (dx > 0 ? 1 : -1));
});

/* ── Col 3 / Mobile ── */
function renderMobile() {
  const $col = $('#mobileAccordion').empty();
  allData.forEach((cat, ci) => {
    const isOpen = ci === activeCatIndex;
    const $item  = $('<div class="accordion-item"></div>');
    const $hdr   = $(`
      <button class="acc-header${isOpen ? ' active' : ''}" data-ci="${ci}">
        <div class="acc-header-left">
          <div class="acc-icon"><img src="${getIconForSlug(cat.slug)}" alt="${cat.name}"></div>
          <span class="acc-label">${cat.name}</span>
        </div>
        <div class="acc-toggle">
          <img src="files/images/${isOpen ? 'minus-01' : 'plus-01'}.svg" alt="">
        </div>
      </button>`);

    let slidesHtml = cat.slides.map((s, si) => `
      <div class="mobile-slide${si === 0 ? ' active' : ''}"
           style="background-image:url('${s.thumbnail_image || s.slide_image || ''}')"
           data-si="${si}" data-ci="${ci}">
        <div class="mobile-slide-overlay"></div>
        <div class="mobile-slide-content">
          <span class="slide-eyebrow">${s.eyebrow || 'Digital Learning Infrastructure'}</span>
          <h3>${s.title}</h3>
          <button class="slide-cta">Learn More <img src="files/images/arrow-right.svg" alt=""></button>
        </div>
      </div>`).join('');

    const dotsHtml = cat.slides.map((_, si) =>
      `<span class="dot${si === 0 ? ' active' : ''}" data-si="${si}" data-ci="${ci}"></span>`
    ).join('');

    const ctrlHtml = cat.slides.length > 1 ? `
      <div class="mobile-controls">
        <button class="ctrl-btn" data-dir="-1" data-ci="${ci}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="ctrl-btn" data-dir="1" data-ci="${ci}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>` : '';

    const $panel = $(`
      <div class="accordion-panel${isOpen ? ' open' : ''}">
        <div class="mobile-slider" id="mSlider-${ci}">
          ${slidesHtml}
          <div class="mobile-dots">${dotsHtml}</div>
          ${ctrlHtml}
        </div>
      </div>`);

    $item.append($hdr).append($panel);
    $col.append($item);
  });
}

$(document).on('click', '#mobileAccordion .acc-header', function () {
  activeCatIndex = parseInt($(this).data('ci'));
  activeSlide    = 0;
  renderMobile();
  renderTabs();
});

$(document).on('click', '#mobileAccordion .mobile-controls .ctrl-btn', function (e) {
  e.stopPropagation();
  const ci      = parseInt($(this).data('ci'));
  const dir     = parseInt($(this).data('dir'));
  const total   = allData[ci].slides.length;
  const $slides = $(`#mSlider-${ci} .mobile-slide`);
  const $dots   = $(`#mSlider-${ci} .dot`);
  const cur     = $slides.filter('.active').index();
  const next    = (cur + dir + total) % total;
  $slides.removeClass('active').eq(next).addClass('active');
  $dots.removeClass('active').eq(next).addClass('active');
});

/* ============================================
   LOAD SHOWCASE DATA
   ============================================ */
async function loadData() {
  try {
    allData = await apiFetch('all');
  } catch (err) {
    console.warn('API unavailable – using demo data:', err.message);
    allData = getDemoData();
  }
  renderTabs();
  renderSlider();
  renderMobile();
}

/* ============================================
   MODAL — state stored on the modal element
   itself to avoid closure / stale-variable bugs
   ============================================ */
function openModal(type, data) {
  const $modal = $('#crudModal');
  // Store state directly on the DOM element — rock solid
  $modal.data('editingType', type);
  $modal.data('editingId',   data?.id ?? null);

  $('#modalTitle').text(
    type === 'category'
      ? (data ? 'Edit Category' : 'New Category')
      : (data ? 'Edit Slide'    : 'New Slide')
  );

  if (type === 'category') {
    $('#modalBody').html(`
      <div class="form-group">
        <label class="form-label">Name *</label>
        <input id="fName" class="form-control" value="${data?.name || ''}" placeholder="e.g. Learning">
      </div>
      <div class="form-group">
        <label class="form-label">Slug *</label>
        <input id="fSlug" class="form-control" value="${data?.slug || ''}" placeholder="e.g. learning">
      </div>
      <div class="form-group">
        <label class="form-label">Sort Order</label>
        <input id="fSort" type="number" class="form-control" value="${data?.sort_order ?? 0}">
      </div>`);

    // Auto-slug
    $(document).off('input.autoslug').on('input.autoslug', '#fName', function () {
      if (!$modal.data('editingId')) {
        $('#fSlug').val($(this).val().toLowerCase().replace(/\s+/g, '-'));
      }
    });

  } else {
    const catOptions = allData.map(c =>
      `<option value="${c.id}"${c.id == (data?.category_id ?? '') ? ' selected' : ''}>${c.name}</option>`
    ).join('');

    $('#modalBody').html(`
      <div class="form-group">
        <label class="form-label">Category *</label>
        <select id="fCat" class="form-control">
          <option value="">Choose a category…</option>
          ${catOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input id="fTitle" class="form-control" value="${data?.title || ''}" placeholder="Slide headline">
      </div>
      <div class="form-group">
        <label class="form-label">Eyebrow Text</label>
        <input id="fEyebrow" class="form-control" value="${data?.eyebrow || ''}" placeholder="e.g. Digital Learning Infrastructure">
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea id="fDesc" class="form-control">${data?.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Slide Image URL</label>
        <input id="fImg" class="form-control" value="${data?.slide_image || ''}" placeholder="files/images/DL-Learning-1.jpg">
      </div>
      <div class="form-group">
        <label class="form-label">Thumbnail URL (1:1 for Col 3)</label>
        <input id="fThumb" class="form-control" value="${data?.thumbnail_image || ''}" placeholder="files/images/DL-Learning-1.jpg">
      </div>
      <div class="form-group">
        <label class="form-label">Sort Order</label>
        <input id="fSort" type="number" class="form-control" value="${data?.sort_order ?? 0}">
      </div>`);
  }

  $modal.addClass('open');
  // Focus first input for UX
  setTimeout(() => $modal.find('input, select').first().focus(), 100);
}

function closeModal() {
  $('#crudModal').removeClass('open');
  $(document).off('input.autoslug');
}

/* ── Save button ── */
$(document).on('click', '#modalSave', async function () {
  const $modal      = $('#crudModal');
  const editingType = $modal.data('editingType');
  const editingId   = $modal.data('editingId');   // null = create, number = update

  if (!editingType) {
    showToast('Modal state lost — please close and reopen', 'error');
    return;
  }

  const $btn = $(this).prop('disabled', true).text('Saving…');

  try {
    let payload, path;

    if (editingType === 'category') {
      const name = $('#fName').val().trim();
      const slug = $('#fSlug').val().trim();
      if (!name) { showToast('Name is required', 'error'); return; }
      payload = { name, slug, sort_order: parseInt($('#fSort').val()) || 0 };
      path    = editingId ? `categories/${editingId}` : 'categories';

    } else {
      const catId = $('#fCat').val();
      const title = $('#fTitle').val().trim();
      if (!catId)  { showToast('Please select a category', 'error'); return; }
      if (!title)  { showToast('Title is required', 'error'); return; }
      payload = {
        category_id:     catId,
        title:           title,
        eyebrow:         $('#fEyebrow').val().trim(),
        description:     $('#fDesc').val().trim(),
        slide_image:     $('#fImg').val().trim(),
        thumbnail_image: $('#fThumb').val().trim(),
        sort_order:      parseInt($('#fSort').val()) || 0,
      };
      path = editingId ? `slides/${editingId}` : 'slides';
    }

    const method = editingId ? 'PUT' : 'POST';
    await apiFetch(path, { method, body: JSON.stringify(payload) });

    const noun   = editingType === 'category' ? 'Category' : 'Slide';
    const action = editingId ? 'updated' : 'created';
    showToast(`${noun} ${action} successfully ✓`);
    closeModal();

    // Refresh both showcase and admin table
    await loadData();
    if (editingType === 'category') loadCategoryTable();
    else loadSlideTable();

  } catch (err) {
    console.error('Save error:', err);
    showToast('Error: ' + err.message, 'error');
  } finally {
    $btn.prop('disabled', false).text('Save');
  }
});

/* ── Modal close ── */
$(document).on('click', '#modalClose, #modalCancel', closeModal);
$(document).on('click', '#crudModal', function (e) {
  if (e.target === this) closeModal();
});

/* ── Escape key closes modal ── */
$(document).on('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

/* ============================================
   ADMIN TABLE — CATEGORIES
   ============================================ */
async function loadCategoryTable() {
  const $tbody = $('#catTableBody');
  $tbody.html('<tr><td colspan="5"><div class="skeleton" style="height:36px"></div></td></tr>');
  try {
    const cats = await apiFetch('categories');
    if (!cats.length) {
      $tbody.html('<tr><td colspan="5" style="color:var(--clr-muted);text-align:center;padding:24px">No categories yet. Click "+ Category" to add one.</td></tr>');
      return;
    }
    $tbody.html(cats.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.slug}</td>
        <td>${c.sort_order}</td>
        <td class="action-btns">
          <button class="btn btn-outline btn-sm js-edit-cat" data-id="${c.id}">Edit</button>
          <button class="btn btn-danger  btn-sm js-del-cat"  data-id="${c.id}">Delete</button>
        </td>
      </tr>`).join(''));
  } catch (err) {
    $tbody.html(`<tr><td colspan="5" style="color:var(--clr-accent);padding:16px">Could not load — ${err.message}</td></tr>`);
  }
}

/* ============================================
   ADMIN TABLE — SLIDES
   ============================================ */
async function loadSlideTable() {
  const $tbody = $('#slideTableBody');
  $tbody.html('<tr><td colspan="5"><div class="skeleton" style="height:36px"></div></td></tr>');
  try {
    const slides = await apiFetch('slides');
    if (!slides.length) {
      $tbody.html('<tr><td colspan="5" style="color:var(--clr-muted);text-align:center;padding:24px">No slides yet. Click "+ Slide" to add one.</td></tr>');
      return;
    }
    $tbody.html(slides.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>
          ${s.thumbnail_image || s.slide_image
            ? `<img src="${s.thumbnail_image || s.slide_image}" style="width:46px;height:46px;object-fit:cover;border-radius:4px" onerror="this.style.display='none'">`
            : '<span style="color:var(--clr-muted);font-size:.7rem">no img</span>'}
        </td>
        <td>${s.title}</td>
        <td>${s.category_name}</td>
        <td class="action-btns">
          <button class="btn btn-outline btn-sm js-edit-slide" data-id="${s.id}">Edit</button>
          <button class="btn btn-danger  btn-sm js-del-slide"  data-id="${s.id}">Delete</button>
        </td>
      </tr>`).join(''));
  } catch (err) {
    $tbody.html(`<tr><td colspan="5" style="color:var(--clr-accent);padding:16px">Could not load — ${err.message}</td></tr>`);
  }
}

/* ── Event delegation for all table action buttons ── */
$(document).on('click', '.js-edit-cat', async function () {
  try {
    const cat = await apiFetch(`categories/${$(this).data('id')}`);
    openModal('category', cat);
  } catch (err) { showToast('Could not load category: ' + err.message, 'error'); }
});

$(document).on('click', '.js-del-cat', async function () {
  if (!confirm('Delete this category AND all its slides? This cannot be undone.')) return;
  try {
    await apiFetch(`categories/${$(this).data('id')}`, { method: 'DELETE' });
    showToast('Category deleted');
    loadCategoryTable();
    loadData();
  } catch (err) { showToast('Delete failed: ' + err.message, 'error'); }
});

$(document).on('click', '.js-edit-slide', async function () {
  try {
    const slide = await apiFetch(`slides/${$(this).data('id')}`);
    openModal('slide', slide);
  } catch (err) { showToast('Could not load slide: ' + err.message, 'error'); }
});

$(document).on('click', '.js-del-slide', async function () {
  if (!confirm('Delete this slide?')) return;
  try {
    await apiFetch(`slides/${$(this).data('id')}`, { method: 'DELETE' });
    showToast('Slide deleted');
    loadSlideTable();
    loadData();
  } catch (err) { showToast('Delete failed: ' + err.message, 'error'); }
});

/* ── Admin panel tab switcher ── */
$(document).on('click', '#tabBtnCats, #tabBtnSlides', function () {
  const panel = $(this).data('panel');
  $('.admin-panel').removeClass('active');
  $(`#${panel}`).addClass('active');
  $('.admin-bar-left .btn').removeClass('active-tab');
  $(this).addClass('active-tab');
  if (panel === 'panelCats') loadCategoryTable();
  else loadSlideTable();
});

/* ── Add buttons ── */
$(document).on('click', '#btnAddCat',   () => openModal('category', null));
$(document).on('click', '#btnAddSlide', () => openModal('slide',    null));

/* ============================================
   DEMO DATA
   ▶ Image paths — already in your repo at:
       files/images/DL-Learning-1.jpg
       files/images/DL-Technology.jpg
       files/images/DL-Communication.jpg
   ============================================ */
function getDemoData() {
  return [
    {
      id: 1, name: 'Learning', slug: 'learning',
      slides: [
        { id:1, category_id:1, eyebrow:'Digital Learning Infrastructure',
          title:'Usability enhancement and Training for Transaction Portal for Customers',
          slide_image:'files/images/DL-Learning-1.jpg', thumbnail_image:'files/images/DL-Learning-1.jpg' },
        { id:2, category_id:1, eyebrow:'Digital Learning Infrastructure',
          title:'Advanced E-Learning Platform for Corporate Training',
          slide_image:'files/images/DL-Learning-1.jpg', thumbnail_image:'files/images/DL-Learning-1.jpg' },
        { id:3, category_id:1, eyebrow:'Digital Learning Infrastructure',
          title:'Blended Learning Strategy for Remote Teams',
          slide_image:'files/images/DL-Learning-1.jpg', thumbnail_image:'files/images/DL-Learning-1.jpg' },
      ]
    },
    {
      id: 2, name: 'Technology', slug: 'technology',
      slides: [
        { id:4, category_id:2, eyebrow:'Technology Solutions',
          title:'Enterprise Technology Transformation Programme',
          slide_image:'files/images/DL-Technology.jpg', thumbnail_image:'files/images/DL-Technology.jpg' },
        { id:5, category_id:2, eyebrow:'Technology Solutions',
          title:'Cloud Migration and DevOps Enablement',
          slide_image:'files/images/DL-Technology.jpg', thumbnail_image:'files/images/DL-Technology.jpg' },
        { id:6, category_id:2, eyebrow:'Technology Solutions',
          title:'AI Integration for Intelligent Business Automation',
          slide_image:'files/images/DL-Technology.jpg', thumbnail_image:'files/images/DL-Technology.jpg' },
      ]
    },
    {
      id: 3, name: 'Communication', slug: 'communication',
      slides: [
        { id:7, category_id:3, eyebrow:'Communication Strategy',
          title:'Omnichannel Communication Framework for Enterprises',
          slide_image:'files/images/DL-Communication.jpg', thumbnail_image:'files/images/DL-Communication.jpg' },
        { id:8, category_id:3, eyebrow:'Communication Strategy',
          title:'Internal Communication Redesign for Global Teams',
          slide_image:'files/images/DL-Communication.jpg', thumbnail_image:'files/images/DL-Communication.jpg' },
        { id:9, category_id:3, eyebrow:'Communication Strategy',
          title:'Customer Engagement and Feedback Loop Systems',
          slide_image:'files/images/DL-Communication.jpg', thumbnail_image:'files/images/DL-Communication.jpg' },
      ]
    },
  ];
}

/* ── Boot ── */
$(document).ready(function () {
  loadData();
  loadCategoryTable();
});
