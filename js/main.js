/* ============================================
   WPoets – main.js
   Tabs · Slider · Col-3 sync · CRUD Admin
   ============================================ */

const API_BASE = 'php/api.php?path=';

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function toast(msg, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast show' + (type === 'error' ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

/* ============================================
   SHOWCASE – Desktop
   ============================================ */
let allData = [];        // [{id, name, slides:[…]}, …]
let activeCatIndex = 0; // which tab/category
let activeSlide = 0;    // which slide within that category

function getCurrentSlides() {
  return allData[activeCatIndex]?.slides || [];
}

/* ── Render tabs (Col 1) ── */
function renderTabs() {
  const col = document.getElementById('colTabs');
  col.innerHTML = '';
  allData.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (i === activeCatIndex ? ' active' : '');
    btn.innerHTML = `
      <span>${cat.name}</span>
      <span class="tab-count">${cat.slides.length}</span>`;
    btn.addEventListener('click', () => {
      activeCatIndex = i;
      activeSlide = 0;
      renderTabs();
      renderSlider();
      renderMobile();
    });
    col.appendChild(btn);
  });
}

/* ── Render desktop slider (Col 2 + Col 3) ── */
function renderSlider() {
  const slides = getCurrentSlides();
  const track = document.getElementById('sliderTrack');
  const dotsEl = document.getElementById('sliderDots');
  const counter = document.getElementById('slideCounter');

  // build slides
  track.innerHTML = slides.map(s => `
    <div class="slide">
      <img class="slide-img" src="${s.slide_image}" alt="${s.title}" loading="lazy">
      <div class="slide-caption">
        <h3>${s.title}</h3>
        <p>${s.description || ''}</p>
      </div>
    </div>`).join('');

  // dots
  dotsEl.innerHTML = slides.map((_, i) =>
    `<span class="dot${i === activeSlide ? ' active' : ''}"></span>`).join('');

  // position
  track.style.transform = `translateX(-${activeSlide * 100}%)`;
  counter.textContent = slides.length
    ? `${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`
    : '–';

  // Col 3
  syncFeatureImage();
}

function syncFeatureImage() {
  const slides = getCurrentSlides();
  const img = document.getElementById('featureImg');
  if (!slides.length) { img.src = ''; return; }
  const src = slides[activeSlide]?.thumbnail_image || slides[activeSlide]?.slide_image || '';
  if (img.src !== src) {
    img.classList.add('leaving');
    setTimeout(() => {
      img.src = src;
      img.alt = slides[activeSlide]?.title || '';
      img.classList.remove('leaving');
    }, 350);
  }
}

function goToSlide(n) {
  const slides = getCurrentSlides();
  if (!slides.length) return;
  activeSlide = (n + slides.length) % slides.length;
  const track = document.getElementById('sliderTrack');
  track.style.transform = `translateX(-${activeSlide * 100}%)`;
  $$('.dot', document.getElementById('sliderDots'))
    .forEach((d, i) => d.classList.toggle('active', i === activeSlide));
  document.getElementById('slideCounter').textContent =
    `${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  syncFeatureImage();
}

/* ── Desktop controls ── */
document.getElementById('btnPrev')?.addEventListener('click', () => goToSlide(activeSlide - 1));
document.getElementById('btnNext')?.addEventListener('click', () => goToSlide(activeSlide + 1));

// Keyboard nav
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') goToSlide(activeSlide - 1);
  if (e.key === 'ArrowRight') goToSlide(activeSlide + 1);
});

/* ── Touch swipe ── */
let touchStartX = 0;
const colSlider = document.getElementById('colSlider');
colSlider?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
colSlider?.addEventListener('touchend', e => {
  const dx = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 40) goToSlide(activeSlide + (dx > 0 ? 1 : -1));
});

/* ============================================
   SHOWCASE – Mobile (Accordion)
   ============================================ */
function renderMobile() {
  const col = document.getElementById('mobileAccordion');
  if (!col) return;
  col.innerHTML = '';

  allData.forEach((cat, ci) => {
    const isActive = ci === activeCatIndex;
    const item = document.createElement('div');
    item.className = 'accordion-item';

    item.innerHTML = `
      <button class="tab-btn${isActive ? ' active' : ''}" data-ci="${ci}">
        <span>${cat.name}</span>
        <span class="tab-count">${cat.slides.length}</span>
      </button>
      <div class="accordion-panel${isActive ? ' open' : ''}">
        <div class="mobile-slider" id="mSlider-${ci}">
          ${cat.slides.map((s, si) => `
            <div class="mobile-slide${si === 0 ? ' active' : ''}"
                 style="background-image:url('${s.thumbnail_image || s.slide_image}')"
                 data-si="${si}" data-ci="${ci}">
              <div class="mobile-slide-overlay"></div>
              <div class="mobile-slide-content">
                <h3>${s.title}</h3>
                <p>${s.description || ''}</p>
              </div>
            </div>`).join('')}
          ${cat.slides.length > 1 ? `
          <div class="mobile-controls">
            <button class="ctrl-btn" data-dir="-1" data-ci="${ci}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="ctrl-btn" data-dir="1" data-ci="${ci}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>` : ''}
        </div>
      </div>`;

    // accordion toggle
    item.querySelector('.tab-btn').addEventListener('click', () => {
      activeCatIndex = ci;
      activeSlide = 0;
      renderMobile();
      renderTabs();
    });

    // mobile prev/next
    item.querySelectorAll('.mobile-controls .ctrl-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const ciBtn = parseInt(btn.dataset.ci);
        const dir = parseInt(btn.dataset.dir);
        const slides = allData[ciBtn].slides;
        const mSlider = document.getElementById(`mSlider-${ciBtn}`);
        const mSlides = $$('.mobile-slide', mSlider);
        const curIdx = mSlides.findIndex(s => s.classList.contains('active'));
        const nextIdx = (curIdx + dir + slides.length) % slides.length;
        mSlides[curIdx].classList.remove('active');
        mSlides[nextIdx].classList.add('active');
      });
    });

    col.appendChild(item);
  });
}

/* ============================================
   LOAD DATA
   ============================================ */
async function loadData() {
  try {
    allData = await apiFetch('all');
    renderTabs();
    renderSlider();
    renderMobile();
  } catch (err) {
    // Fallback demo data so the UI always works
    console.warn('API unavailable – using demo data:', err.message);
    allData = getDemoData();
    renderTabs();
    renderSlider();
    renderMobile();
  }
}

/* ============================================
   ADMIN CRUD
   ============================================ */
let editingId = null;
let editingType = null; // 'category' | 'slide'

function openModal(type, data = null) {
  editingType = type;
  editingId = data?.id || null;
  const modal = document.getElementById('crudModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  if (type === 'category') {
    title.textContent = data ? 'Edit Category' : 'New Category';
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Name</label>
        <input id="fName" class="form-control" value="${data?.name || ''}" placeholder="e.g. Architecture">
      </div>
      <div class="form-group">
        <label class="form-label">Slug</label>
        <input id="fSlug" class="form-control" value="${data?.slug || ''}" placeholder="e.g. architecture">
      </div>
      <div class="form-group">
        <label class="form-label">Sort Order</label>
        <input id="fSort" type="number" class="form-control" value="${data?.sort_order ?? 0}">
      </div>`;
  } else {
    title.textContent = data ? 'Edit Slide' : 'New Slide';
    const catOptions = allData.map(c =>
      `<option value="${c.id}"${c.id == data?.category_id ? ' selected' : ''}>${c.name}</option>`).join('');
    body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Category</label>
        <select id="fCat" class="form-control"><option value="">Choose…</option>${catOptions}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Title</label>
        <input id="fTitle" class="form-control" value="${data?.title || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea id="fDesc" class="form-control">${data?.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Slide Image URL</label>
        <input id="fImg" class="form-control" value="${data?.slide_image || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Thumbnail URL (1:1)</label>
        <input id="fThumb" class="form-control" value="${data?.thumbnail_image || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Sort Order</label>
        <input id="fSort" type="number" class="form-control" value="${data?.sort_order ?? 0}">
      </div>`;
  }

  modal.classList.add('open');

  // auto-slug from name
  document.getElementById('fName')?.addEventListener('input', e => {
    const slug = document.getElementById('fSlug');
    if (slug && !editingId) slug.value = e.target.value.toLowerCase().replace(/\s+/g, '-');
  });
}

document.getElementById('modalSave')?.addEventListener('click', async () => {
  try {
    let payload, path;
    if (editingType === 'category') {
      payload = {
        name: document.getElementById('fName').value,
        slug: document.getElementById('fSlug').value,
        sort_order: parseInt(document.getElementById('fSort').value) || 0,
      };
      path = editingId ? `categories/${editingId}` : 'categories';
    } else {
      payload = {
        category_id: document.getElementById('fCat').value,
        title: document.getElementById('fTitle').value,
        description: document.getElementById('fDesc').value,
        slide_image: document.getElementById('fImg').value,
        thumbnail_image: document.getElementById('fThumb').value,
        sort_order: parseInt(document.getElementById('fSort').value) || 0,
      };
      path = editingId ? `slides/${editingId}` : 'slides';
    }
    await apiFetch(path, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    toast(`${editingType === 'category' ? 'Category' : 'Slide'} ${editingId ? 'updated' : 'created'}`);
    closeModal();
    await loadData();
    if (editingType === 'slide') loadSlideTable();
    else loadCategoryTable();
  } catch (err) {
    toast(err.message, 'error');
  }
});

function closeModal() {
  document.getElementById('crudModal').classList.remove('open');
}
document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('crudModal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

/* ── Category table ── */
async function loadCategoryTable() {
  const tbody = document.getElementById('catTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" class="skeleton" style="height:40px;border-radius:4px"></td></tr>';
  try {
    const cats = await apiFetch('categories');
    tbody.innerHTML = cats.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.slug}</td>
        <td class="actions">
          <button class="btn btn-outline" onclick="editCategory(${c.id})">Edit</button>
          <button class="btn btn-danger" onclick="deleteCategory(${c.id})">Delete</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="4" style="color:var(--clr-muted);text-align:center;padding:20px">No categories yet</td></tr>';
  } catch { tbody.innerHTML = '<tr><td colspan="4" style="color:#c0392b">Could not load (API offline)</td></tr>'; }
}

async function editCategory(id) {
  const cat = await apiFetch(`categories/${id}`);
  openModal('category', cat);
}
async function deleteCategory(id) {
  if (!confirm('Delete this category and all its slides?')) return;
  try {
    await apiFetch(`categories/${id}`, { method: 'DELETE' });
    toast('Category deleted');
    loadCategoryTable();
    loadData();
  } catch (err) { toast(err.message, 'error'); }
}

/* ── Slide table ── */
async function loadSlideTable() {
  const tbody = document.getElementById('slideTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="skeleton" style="height:40px;border-radius:4px"></td></tr>';
  try {
    const slides = await apiFetch('slides');
    tbody.innerHTML = slides.map(s => `
      <tr>
        <td>${s.id}</td>
        <td><img src="${s.thumbnail_image || s.slide_image}" style="width:48px;height:48px;object-fit:cover;border-radius:3px"></td>
        <td>${s.title}</td>
        <td>${s.category_name}</td>
        <td class="actions">
          <button class="btn btn-outline" onclick="editSlide(${s.id})">Edit</button>
          <button class="btn btn-danger" onclick="deleteSlide(${s.id})">Delete</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="5" style="color:var(--clr-muted);text-align:center;padding:20px">No slides yet</td></tr>';
  } catch { tbody.innerHTML = '<tr><td colspan="5" style="color:#c0392b">Could not load (API offline)</td></tr>'; }
}

async function editSlide(id) {
  const slide = await apiFetch(`slides/${id}`);
  openModal('slide', slide);
}
async function deleteSlide(id) {
  if (!confirm('Delete this slide?')) return;
  try {
    await apiFetch(`slides/${id}`, { method: 'DELETE' });
    toast('Slide deleted');
    loadSlideTable();
    loadData();
  } catch (err) { toast(err.message, 'error'); }
}

/* ── Admin tab switcher ── */
$$('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.admin-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(btn.dataset.panel).classList.add('active');
    if (btn.dataset.panel === 'panelCats') loadCategoryTable();
    else loadSlideTable();
  });
});

/* ── Add buttons ── */
document.getElementById('btnAddCat')?.addEventListener('click', () => openModal('category'));
document.getElementById('btnAddSlide')?.addEventListener('click', () => openModal('slide'));

/* ============================================
   DEMO DATA (fallback when PHP/MySQL offline)
   ============================================ */
function getDemoData() {
  const imgs = [
    ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&h=500&fit=crop',
     'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=600&fit=crop'],
    ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&h=500&fit=crop',
     'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=600&fit=crop'],
    ['https://images.unsplash.com/photo-1542621334-a254cf47733d?w=900&h=500&fit=crop',
     'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600&h=600&fit=crop'],
    ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&h=500&fit=crop',
     'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop'],
    ['https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=900&h=500&fit=crop',
     'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=600&h=600&fit=crop'],
    ['https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&h=500&fit=crop',
     'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=600&fit=crop'],
  ];
  const makeSlides = (catId, base, titles, descs) =>
    titles.map((t, i) => ({
      id: base + i,
      category_id: catId,
      title: t,
      description: descs[i],
      slide_image: imgs[(base + i) % imgs.length][0],
      thumbnail_image: imgs[(base + i) % imgs.length][1],
    }));

  return [
    {
      id: 1, name: 'Architecture', slug: 'architecture',
      slides: makeSlides(1, 0,
        ['Modern Villa', 'Glass Tower', 'Wooden Retreat'],
        ['A stunning contemporary villa with clean lines.', 'Cutting-edge glass skyscraper.', 'Rustic mountain cabin.']),
    },
    {
      id: 2, name: 'Interior Design', slug: 'interior-design',
      slides: makeSlides(2, 3,
        ['Minimalist Living', 'Industrial Kitchen', 'Cozy Bedroom'],
        ['Clean, warm natural tones.', 'Exposed brick and metal accents.', 'Layered textures and soft light.']),
    },
    {
      id: 3, name: 'Landscape', slug: 'landscape',
      slides: makeSlides(3, 6,
        ['Zen Garden', 'Rooftop Terrace', 'Wildflower Meadow'],
        ['Japanese-inspired serenity.', 'Lush rooftop with city views.', 'Organic wildflower terrain.']),
    },
    {
      id: 4, name: 'Urban Planning', slug: 'urban-planning',
      slides: makeSlides(4, 9,
        ['City Hub', 'Green Corridor', 'Waterfront Plaza'],
        ['Pedestrian-first urban design.', 'Tree-lined neighborhood connector.', 'Revitalised cultural waterfront.']),
    },
  ];
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  loadCategoryTable();
});
