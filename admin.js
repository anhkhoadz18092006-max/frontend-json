// Admin page script: CRUD + search/filter
(function(){
  const API_URL = "https://my-json-server.typicode.com/anhkhoadz18092006-max/backend-json/products/";

  // Elements
  const tbody = document.getElementById('admin-tbody');
  const inputSearch = document.getElementById('admin-search');
  const selectCategory = document.getElementById('admin-filter-category');
  const btnRefresh = document.getElementById('admin-refresh');
  const btnOpenCreate = document.getElementById('btn-open-create');
  const modal = document.getElementById('admin-modal');
  const modalTitle = document.getElementById('modal-title');
  const form = document.getElementById('admin-form');
  const inpId = document.getElementById('product-id');
  const inpName = document.getElementById('product-name');
  const inpPrice = document.getElementById('product-price');
  const inpImage = document.getElementById('product-image');
  const inpImageFile = document.getElementById('product-image-file');
  const imgPreview = document.getElementById('product-image-preview');
  const inpCategory = document.getElementById('product-category');
  const inpHot = document.getElementById('product-hot');
  const inpDesc = document.getElementById('product-desc');

  let allData = [];

  function normalize(text){
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .trim();
  }

  // Product class for consistency with main.js
  class Product {
    constructor(id, name, price, image, category, hot, description){
      this.id = id;
      this.name = name;
      this.price = price;
      this.image = image;
      this.category = category;
      this.hot = hot;
      this.description = description;
    }
  }

  function openModal(mode, data){
    modal.setAttribute('aria-hidden','false');
    modal.classList.add('open');
    modalTitle.textContent = mode === 'create' ? 'Thêm sản phẩm' : 'Cập nhật sản phẩm';
    if(mode === 'create'){
      form.reset();
      inpId.value = '';
      inpHot.checked = false;
      inpImage.value = '';
      if(imgPreview){ imgPreview.style.display='none'; imgPreview.src=''; }
    }else if(mode === 'edit' && data){
      inpId.value = data.id;
      inpName.value = data.name || '';
      inpPrice.value = Number(data.price || 0);
      inpImage.value = data.image || '';
      inpCategory.value = data.category || '';
      inpHot.checked = !!data.hot;
      inpDesc.value = data.description || '';
      if(imgPreview && data.image){ imgPreview.src = data.image; imgPreview.style.display='inline-block'; }
    }
    form.dataset.mode = mode;
  }

  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }

  function renderRows(list){
    if(!tbody) return;
    tbody.innerHTML = list.map(p => `
      <tr class="product" data-id="${p.id}">
        <td>${p.id}</td>
        <td><img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='img/apple2.jpg';" style="width:56px;height:56px;object-fit:cover;border-radius:6px"/></td>
        <td>${p.name}</td>
        <td>${Number(p.price).toLocaleString()}₫</td>
        <td>${p.category}</td>
        <td>${p.hot ? '✔️' : ''}</td>
        <td style="max-width:360px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.description || ''}</td>
        <td>
          <button class="btn-small" data-action="edit" data-id="${p.id}">Sửa</button>
          <button class="btn-small btn-danger" data-action="delete" data-id="${p.id}">Xóa</button>
        </td>
      </tr>
    `).join('');
  }

  function applyFilters(){
    const q = normalize(inputSearch && inputSearch.value);
    const cat = normalize(selectCategory && selectCategory.value);
    let filtered = allData.slice();
    if(q){
      filtered = filtered.filter(p => normalize(p.name).includes(q));
    }
    if(cat){
      filtered = filtered.filter(p => normalize(p.category) === cat);
    }
    renderRows(filtered);
  }

  function load(){
    fetch(API_URL)
      .then(r => r.json())
      .then(data => {
        allData = data || [];
        applyFilters();
      })
      .catch(err => {
        console.error('Không thể tải dữ liệu:', err);
      });
  }

  function createProduct(payload){
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }

  function updateProduct(id, payload){
    return fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }

  function deleteProduct(id){
    return fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  }

  // Events
  if(inputSearch) inputSearch.addEventListener('input', applyFilters);
  if(selectCategory) selectCategory.addEventListener('change', applyFilters);
  if(btnRefresh) btnRefresh.addEventListener('click', load);
  if(btnOpenCreate) btnOpenCreate.addEventListener('click', () => openModal('create'));

  if(modal){
    modal.addEventListener('click', (e)=>{
      const close = e.target.getAttribute('data-close');
      if(close){
        closeModal();
      }
    });
  }

  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const mode = form.dataset.mode || 'create';
      const id = inpId.value;
      const payload = {
        name: inpName.value.trim(),
        price: Number(inpPrice.value || 0),
        image: inpImage.value.trim(),
        category: inpCategory.value.trim(),
        hot: !!inpHot.checked,
        description: inpDesc.value.trim()
      };

      const action = mode === 'edit' && id ? updateProduct(id, payload) : createProduct(payload);
      action.then(()=>{
        closeModal();
        load();
      }).catch(err=>{
        console.error('Lưu sản phẩm thất bại:', err);
      });
    });
  }

  // File chooser -> read as DataURL and preview
  if(inpImageFile){
    inpImageFile.addEventListener('change', (e)=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        inpImage.value = String(dataUrl || '').trim();
        if(imgPreview){ imgPreview.src = inpImage.value; imgPreview.style.display='inline-block'; }
      };
      reader.readAsDataURL(file);
    });
  }

  if(tbody){
    tbody.addEventListener('click', (e)=>{
      const btn = e.target;
      const action = btn.getAttribute && btn.getAttribute('data-action');
      const id = btn.getAttribute && btn.getAttribute('data-id');
      if(!action || !id) return;

      if(action === 'edit'){
        const item = allData.find(p => String(p.id) === String(id));
        if(item) openModal('edit', item);
      }
      if(action === 'delete'){
        if(confirm('Bạn có chắc muốn xóa sản phẩm này?')){
          deleteProduct(id).then(()=> load());
        }
      }
    });
  }

  // initial
  load();
})();


