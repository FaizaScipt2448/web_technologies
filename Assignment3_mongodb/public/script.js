console.log("script loaded");

const apiUrl = "/crud/api/products";
let localProducts = [];
let editId = null;

// ✅ Pagination + Filters state
let currentPage = 1;
let currentLimit = 10;
let currentCategory = "";
let currentMinPrice = "";
let currentMaxPrice = "";

// ✅ LOAD PRODUCTS (DB + pagination + filters)
function loadProducts() {
  $("#loading").show();
  $("#paginationWrap").remove();

  const qs = new URLSearchParams();
  qs.set("page", currentPage);
  qs.set("limit", currentLimit);

  if (currentCategory) qs.set("category", currentCategory);
  if (currentMinPrice !== "") qs.set("minPrice", currentMinPrice);
  if (currentMaxPrice !== "") qs.set("maxPrice", currentMaxPrice);

  $.get(`${apiUrl}?${qs.toString()}`, function (data) {
    $("#loading").hide();

    // ✅ backend returns { items, page, totalPages, ... }
    localProducts = data.items || [];

    renderProducts(localProducts);
    renderPagination(data.page || 1, data.totalPages || 1);
  }).fail(function () {
    $("#loading").text("Error loading products.");
  });
}

// ✅ RENDER PRODUCTS
function renderProducts(list) {
  const productList = $("#productList");
  productList.empty();

  if (!list || list.length === 0) {
    productList.html("<p style='color:#666'>No products found.</p>");
    return;
  }

  $.each(list, function (i, p) {
    // p.id is added by your toJSON transform (or use p._id fallback)
    const id = p.id || p._id;

    productList.append(`
      <div class="card" data-id="${id}">
        <img src="${p.image}" alt="${p.title}">
        <div class="p">
          <div class="title">${p.title}</div>
          <div class="muted">${p.category}</div>
          <div class="price">$${p.price}</div>
          <div class="actions">
            <button class="btn warn btn-edit" data-id="${id}">Edit</button>
            <button class="btn danger btn-del" data-id="${id}">Delete</button>
          </div>
        </div>
      </div>
    `);
  });
}

// ✅ PAGINATION UI
function renderPagination(page, totalPages) {
  const html = `
    <div id="paginationWrap" style="display:flex; gap:10px; align-items:center; margin-top:14px;">
      <button class="btn" id="prevPage" ${page <= 1 ? "disabled" : ""}>Prev</button>
      <span>Page <b>${page}</b> of <b>${totalPages}</b></span>
      <button class="btn" id="nextPage" ${page >= totalPages ? "disabled" : ""}>Next</button>
    </div>
  `;
  $("#productList").after(html);
}

// ✅ CREATE / UPDATE (DB)
function handleFormSubmission(e) {
  e.preventDefault();

  const title = $("#title").val().trim();
  const price = parseFloat($("#price").val());
  const category = $("#category").val().trim();

  const image =
    $("#image").val().trim() ||
    `https://picsum.photos/seed/${Date.now()}/400/400`;

  const description = $("#description").val().trim();

  if (!title || !category || isNaN(price)) {
    showMsg("Please fill title, price and category");
    return;
  }

  const payload = { title, price, category, image, description };

  // UPDATE
  if (editId) {
    $.ajax({
      url: `${apiUrl}/${editId}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function () {
        showMsg("Updated!");
        resetForm();
        loadProducts();
      },
      error: function (xhr) {
        console.log("Update error:", xhr.responseText);
        showMsg("Update failed!");
      }
    });
    return;
  }

  // CREATE
  $.ajax({
    url: apiUrl,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload),
    success: function () {
      showMsg("Created!");
      resetForm();
      currentPage = 1; // optional: new item dekhnay ke liye page reset
      loadProducts();
    },
    error: function (xhr) {
      console.log("Create error:", xhr.responseText);
      showMsg("Create failed!");
    }
  });
}

// ✅ DELETE (DB)
function handleDelete() {
  const id = $(this).attr("data-id");
  if (!confirm("Delete this product?")) return;

  $.ajax({
    url: `${apiUrl}/${id}`,
    method: "DELETE",
    success: function () {
      showMsg("Deleted!");
      loadProducts();
    },
    error: function (xhr) {
      console.log("Delete error:", xhr.responseText);
      showMsg("Delete failed!");
    }
  });
}

// ✅ EDIT — Prefill form
function handleEdit(e) {
  e.preventDefault();
  const id = $(this).attr("data-id");

  const product = localProducts.find(p => String(p.id || p._id) === String(id));
  if (!product) return;

  $("#title").val(product.title);
  $("#price").val(product.price);
  $("#category").val(product.category);
  $("#image").val(product.image);
  $("#description").val(product.description || "");

  editId = id;
  $("#formTitle").text("Edit Product");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ✅ FILTER handlers (requires filter inputs in crud.ejs)
function applyFilters() {
  currentCategory = $("#filterCategory").val().trim();
  currentMinPrice = $("#filterMinPrice").val();
  currentMaxPrice = $("#filterMaxPrice").val();
  currentPage = 1;
  loadProducts();
}

function clearFilters() {
  $("#filterCategory").val("");
  $("#filterMinPrice").val("");
  $("#filterMaxPrice").val("");
  currentCategory = "";
  currentMinPrice = "";
  currentMaxPrice = "";
  currentPage = 1;
  loadProducts();
}

// ✅ Pagination button handlers
$(document).on("click", "#prevPage", function () {
  if (currentPage > 1) {
    currentPage--;
    loadProducts();
  }
});

$(document).on("click", "#nextPage", function () {
  currentPage++;
  loadProducts();
});

// Helpers
function resetForm() {
  $("#title").val("");
  $("#price").val("");
  $("#category").val("");
  $("#image").val("");
  $("#description").val("");
  editId = null;
  $("#formTitle").text("Create Product");
}

function showMsg(text) {
  const el = $("#msg");
  el.text(text).show();
  setTimeout(() => el.hide(), 1400);
}

// ✅ Bindings
$(document).ready(function () {
  // Initial load
  loadProducts();

  // Form submit
  $("#productForm").on("submit", handleFormSubmission);
  $("#productForm button[type='submit']").on("click", handleFormSubmission);

  // Reset
  $("#btnReset").on("click", function () { resetForm(); });

  // Edit / Delete
  $(document).on("click", ".btn-edit", handleEdit);
  $(document).on("click", ".btn-del", handleDelete);

  // ✅ LIMIT DROPDOWN (pagination)
  $(document).on("change", "#limitSelect", function () {
    currentLimit = parseInt($(this).val(), 10);
    currentPage = 1;
    loadProducts();
  });

  // ✅ FILTER BUTTONS
  $(document).on("click", "#applyFilters", applyFilters);
  $(document).on("click", "#clearFilters", clearFilters);
});

