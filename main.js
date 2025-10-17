function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

class Product {
    constructor(id, name, price, image, category, hot, description) {
      this.id = id;
      this.name = name;
      this.price = price;
      this.image = image;
      this.category = category;
      this.hot = hot;
      this.description = description;
    }

    // Render sản phẩm cho trang chủ
    render() {
      return `
        <div class="product ${this.hot ? 'hot' : ''}">
          <div class="product-image">
            <img src="${this.image}" alt="${this.name}" loading="lazy" onerror="this.onerror=null;this.src='img/apple2.jpg';">
            ${this.hot ? '<div class="product-badge">HOT</div>' : ''}
          </div>
          <div class="product-info">
           <a href="detail.html?id=${this.id}"><h4>${this.name}</h4></a>
            <div class="product-rating">
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <span class="rating-text">(4.8)</span>
            </div>
            <p class="price">${this.price.toLocaleString()}₫</p>
            <button class="add-to-cart" data-id="${this.id}">
              <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
            </button>
          </div>
        </div>
      `;
    }

    // Render sản phẩm cho trang product
    renderProductPage() {
      return `
        <div class="product-card ${this.hot ? 'hot' : ''}">
          <div class="product-image">
            <img src="${this.image}" alt="${this.name}" loading="lazy" onerror="this.onerror=null;this.src='img/apple2.jpg';">
            ${this.hot ? '<div class="product-badge">HOT</div>' : ''}
          </div>
          <div class="product-info">
            <h3 class="product-title">${this.name}</h3>
            <div class="product-rating">
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <span class="rating-text">(4.8)</span>
            </div>
            <p class="product-price">${this.price.toLocaleString()}₫</p>
            <button class="add-to-cart" data-id="${this.id}">
              <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
            </button>
          </div>
        </div>
      `;
    }

    // Render chi tiết sản phẩm
    renderDetail() {
        return `
            <div class="product-detail">
                <div class="product-detail-image">
                    <img src='${this.image}' alt='${this.name}' onerror="this.onerror=null;this.src='img/apple2.jpg';" />
                </div>
                <div class="product-detail-info">
                    <h1 class="product-detail-title">${this.name}</h1>
                    <p class="product-detail-price">${Number(this.price).toLocaleString()}₫</p>
                    <p class="product-detail-desc">${this.description || ''}</p>
                    <button id="addCartBtn" class="btn-add-cart" productId="${this.id}">
                        <i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        `;
    }
}
const productpage = document.getElementById('products-container');
// -------------------- SEARCH --------------------
const searchInput = document.getElementById('search-input');
let allProductsData = [];

// nhớ thêm <input id="search-input"> vào product.html

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filteredProducts = allProductsData.filter(p =>
            p.name.toLowerCase().includes(keyword)
        );
        renderProductPageList(filteredProducts, productpage);

    });
}
 
// -------------------- SORT --------------------
const sortDropdown = document.getElementById("sort");
console.log (sortDropdown)

if (sortDropdown && productpage) {
  sortDropdown.addEventListener("change", (e) => {
    let sorted = [...allProductsData]; // copy mảng gốc

 if (e.target.value === "Giá tăng dần") {
  sorted.sort((a, b) => Number(a.price) - Number(b.price));
} else if (e.target.value === "Giá giảm dần") {
  sorted.sort((a, b) => Number(b.price) - Number(a.price));
}


    // ⚡ Dùng renderProductPageList cho product.html
    renderProductPageList(sorted, productpage); 
  });
}




const renderProductPageList = (array, theDiv) => {
    let html = "";
    array.forEach(item => {
        const product = new Product(
            item.id,
            item.name,
            item.price,
            item.image,
            item.category,
            item.hot,
            item.description
        );
        html += product.renderProductPage(); // dùng đúng hàm
    });
    theDiv.innerHTML = html;
};
// Render sản phẩm cho trang index.html (dùng render())
const renderProduct = (array, theDiv) => {
    let html = "";
    array.forEach(item => {
        const product = new Product(
            item.id,
            item.name,
            item.price,
            item.image,
            item.category,
            item.hot,
            item.description
        );
        html += product.render(); // ⚡ ở index dùng render()
    });
    theDiv.innerHTML = html;
};




// Endpoint JSON Server (điều chỉnh port nếu bạn đổi)
const API_URL = "http://localhost:3000/products";

// Render cho trang chủ
const productHot = document.getElementById('product-hot');
const productLaptop = document.getElementById('product-laptop');
const productDienThoai = document.getElementById('product-dienthoai');

if (productHot && productLaptop && productDienThoai) {
    fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
            const dataHot = data.filter((p) => p.hot === true);
            const dataLaptop = data.filter((p) => normalizeText(p.category) === "laptop");
            const dataPhone = data.filter((p) => normalizeText(p.category) === "dien thoai" || normalizeText(p.category) === "phone");

            renderProduct(dataHot, productHot);
            renderProduct(dataLaptop, productLaptop);
            renderProduct(dataPhone, productDienThoai);
        })
        .catch((err) => {
            console.error("Không thể tải dữ liệu sản phẩm:", err);
        });
}



// Render cho trang danh sách sản phẩm (product.html)
if (productpage) {
    fetch(API_URL)
        .then((response) => response.json())
        .then((products) => {
                        renderProductPageList(products, productpage);
                        allProductsData=products;

        })
        .catch((err) => {
            console.error("Không thể tải danh sách sản phẩm:", err);
        });
}

//Trang chi tiết
const productDetailDiv = document.getElementById('detail-product');
if(productDetailDiv){
    const urlParams = new URLSearchParams(window.location.search);
    const id= urlParams.get('id');
    // alert(id);
    fetch(`http://localhost:3000/products/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const product = new Product(
              data.id,
              data.name,
              data.price,
              data.image,
              data.category,
              data.hot,
              data.description,
            )
            productDetailDiv.innerHTML=product.renderDetail();
        });
    
}
//Tao header de them vao tat ca cac trang
const header = document.createElement('header');
header.classList.add('header')
header.innerHTML=`
  <div class="header-container">
      <div class="logo">My Shop</div>
      
      <nav class="nav-links">
        <a href="#" class="nav-link">Trang chủ</a>
        <a href="product.html" class="nav-link">Sản phẩm</a>
        <a href="admin.html" class="nav-link">Admin</a>
        <a href="#" class="nav-link">Liên hệ</a>
        <button class="cart-btn">
          <i class="fas fa-shopping-cart"></i>
          <span id="cartCount" class="cart-count">0</span>
        </button>
      </nav>
    </div>
`
document.body.prepend(header);
//Tao footer de them vao tat ca cac trang
const footer = document.createElement('footer');
footer.classList.add('footer')
footer.innerHTML=`
     <div class="footer-container">
      <div class="footer-section">
        <h3>Về Chúng Tôi</h3>
        <p>My Shop - Cửa hàng công nghệ hàng đầu Việt Nam với hơn 10 năm kinh nghiệm trong lĩnh vực điện tử.</p>
      </div>
      
      <div class="footer-section">
        <h3>Sản Phẩm</h3>
        <p><a href="#">📱 Điện thoại</a></p>
        <p><a href="#">💻 Laptop</a></p>
        <p><a href="#">🎧 Phụ kiện</a></p>
        <p><a href="#">⌚ Smartwatch</a></p>
      </div>
      
      <div class="footer-section">
        <h3>Hỗ Trợ</h3>
        <p><a href="#">🛡️ Bảo hành</a></p>
        <p><a href="#">🔄 Đổi trả</a></p>
        <p><a href="#">🚚 Giao hàng</a></p>
        <p><a href="#">❓ Hướng dẫn</a></p>
      </div>
      
      <div class="footer-section">
        <h3>Liên Hệ</h3>
        <p>📧 support@myshop.com</p>
        <p>📞 1900 1234</p>
        <p>🏢 123 Đường ABC, Quận 1, TP.HCM</p>
        <p>⏰ 8:00 - 22:00 (Hàng ngày)</p>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 My Shop. Tất cả quyền được bảo lưu.</p>
    </div>
`
document.body.append(footer);
//Giỏ hàng 
class Cart{
    constructor(){
        //Khởi tạo 1 mảng lấy dữ liệu từ local storage, nếu ko có lấy mảng rỗng
        this.items= JSON.parse(localStorage.getItem('cart')) ||[];
    }
    save(){
        localStorage.setItem('cart',JSON.stringify(this.items));
    }
    addItem(product){
        //Tìm sản phẩm có thêm vào giỏ hàng trước đó hay ko 
        const existingItem= this.items.find(item=>item.id==product.id);
        //Nếu có trong giỏ hàng thì tăng số lượng
        if(existingItem){
            existingItem.quantity ++;
        }else{
            //Ko có thì đưa object product + số lượng vào giỏ hàng
            this.items.push({...product,quantity:1})
        }
        //Lưu lại giỏ hàng vào local storage
        this.save();
    }
    getTotalQuantity(){
        return this.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }
    getTotalPrice(){
        return this.items.reduce((sum, item) => sum + (Number(item.price)||0) * (Number(item.quantity)||0), 0);
    }
    updateQuantity(id, delta){
        const it = this.items.find(p=>String(p.id)===String(id));
        if(!it) return;
        it.quantity = Math.max(1, Number(it.quantity||1) + delta);
        this.save();
    }
    removeItem(id){
        this.items = this.items.filter(p=>String(p.id)!==String(id));
        this.save();
    }
    clear(){
        this.items = [];
        this.save();
    }
    render(){
        // Overlay + panel giỏ hàng
        let overlay = document.getElementById('cartOverlay');
        if(!overlay){
            overlay = document.createElement('div');
            overlay.id = 'cartOverlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(2px);display:flex;justify-content:flex-end;z-index:2000;';
            document.body.appendChild(overlay);
        }else{
            overlay.style.display='flex';
        }

        let panel = document.getElementById('cartPanel');
        if(!panel){
            panel = document.createElement('div');
            panel.id = 'cartPanel';
            panel.style.cssText = 'width:min(420px,92vw);height:100%;background:#fff;box-shadow:-8px 0 28px rgba(0,0,0,0.15);display:flex;flex-direction:column;';
            overlay.appendChild(panel);
        }

        const rows = this.items.map(item=>`
            <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <img src="${item.image}" alt="${item.name}" style="width:64px;height:64px;object-fit:cover;border-radius:8px" onerror="this.onerror=null;this.src='img/apple2.jpg';"/>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
                    <div style="color:#e53935;font-weight:700;margin-top:2px;">${Number(item.price).toLocaleString()}₫</div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <button data-action="dec" data-id="${item.id}" style="width:28px;height:28px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer">-</button>
                    <span style="min-width:22px;text-align:center">${item.quantity}</span>
                    <button data-action="inc" data-id="${item.id}" style="width:28px;height:28px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer">+</button>
                </div>
                <button data-action="remove" data-id="${item.id}" style="margin-left:8px;border:none;background:#fff;color:#e11d48;cursor:pointer">✕</button>
            </div>
        `).join('');

        panel.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid #eee;">
                <strong>Giỏ hàng (${this.getTotalQuantity()})</strong>
                <button id="cartCloseBtn" style="border:none;background:#fff;font-size:20px;cursor:pointer">✕</button>
            </div>
            <div style="padding:16px;overflow:auto;flex:1;">${rows || '<p>Giỏ hàng trống.</p>'}</div>
            <div style="padding:16px;border-top:1px solid #eee;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <span>Tạm tính</span>
                    <strong>${this.getTotalPrice().toLocaleString()}₫</strong>
                </div>
                <div style="display:flex;gap:8px;">
                    <button id="cartClearBtn" style="flex:1;padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer">Xóa tất cả</button>
                    <button id="cartCheckoutBtn" style="flex:1;padding:10px 12px;border-radius:10px;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;cursor:pointer">Thanh toán</button>
                </div>
            </div>
        `;

        panel.onclick = (ev)=>{
            const t = ev.target;
            const action = t.getAttribute('data-action');
            const id = t.getAttribute('data-id');
            if(action==='inc'){
                this.updateQuantity(id, +1);
                updateCartCount();
                this.render();
            }else if(action==='dec'){
                this.updateQuantity(id, -1);
                updateCartCount();
                this.render();
            }else if(action==='remove'){
                this.removeItem(id);
                updateCartCount();
                this.render();
            }
            if(t.id==='cartClearBtn'){
                this.clear();
                updateCartCount();
                this.render();
            }
            if(t.id==='cartCloseBtn'){
                overlay.style.display='none';
            }
        };
    }
}


// Hàm cập nhật số lượng giỏ hàng
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cart.getTotalQuantity();
    }
}

const cart = new Cart();
document.addEventListener('click', function(e) {
   
    if (e.target && e.target.id == "addCartBtn") {
        const id = e.target.getAttribute('productId');
        fetch(`http://localhost:3000/products/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const product = new Product(
                data.id,
                data.name,
                data.price,
                data.image,
                data.category,
                data.hot,
                data.description
            );
            cart.addItem(product);
            updateCartCount();
            console.log(cart);
        });
    }

   
    if (e.target && e.target.classList.contains('add-to-cart')) {
        const id = e.target.getAttribute('data-id');
        fetch(`http://localhost:3000/products/${id}`)
        .then(response => response.json())
        .then(data => {
            const product = new Product(
                data.id,
                data.name,
                data.price,
                data.image,
                data.category,
                data.hot,
                data.description
            );
            cart.addItem(product);
            updateCartCount();
        });
    }
}); 
// Cập nhật số lượng khi load trang
document.addEventListener('DOMContentLoaded', function(){
    updateCartCount();
});

// Mở giỏ hàng khi bấm biểu tượng giỏ
document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest('.cart-btn');
    if(btn){
        cart.render();
    }
});



   