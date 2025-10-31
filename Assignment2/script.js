console.log("script loaded");

const apiUrl = "https://fakestoreapi.com/products";
let localProducts = [];
let editId = null;

// READ — load once from API
function loadProducts() {
  $("#loading").show();
  $.get(apiUrl, function (data) {
    $("#loading").hide();
    localProducts = data;
    renderProducts(localProducts);
  }).fail(function () {
    $("#loading").text("Error loading products.");
  });
}

// Render cards
function renderProducts(list) {
  const productList = $("#productList");
  productList.empty();

  $.each(list, function (i, p) {
    productList.append(`
      <div class="card" data-id="${p.id}">
        <img src="${p.image}" alt="${p.title}">
        <div class="p">
          <div class="title">${p.title}</div>
          <div class="muted">${p.category}</div>
          <div class="price">$${p.price}</div>
          <div class="actions">
            <button class="btn warn btn-edit" data-id="${p.id}">Edit</button>
            <button class="btn danger btn-del" data-id="${p.id}">Delete</button>
          </div>
        </div>
      </div>
    `);
  });
}

// CREATE or UPDATE (local-only)
function handleFormSubmission(e) {
  e.preventDefault();

  const title = $("#title").val().trim();
  const price = parseFloat($("#price").val());
  const category = $("#category").val().trim();
  const image = $("#image").val().trim() || "https://via.placeholder.com/300x300?text=Product";
  const description = $("#description").val().trim();

  if (!title || !category || isNaN(price)) {
    showMsg("Please fill title, price and category");
    return;
  }

  if (editId !== null) {
    // UPDATE
    for (let i = 0; i < localProducts.length; i++) {
      if (String(localProducts[i].id) === String(editId)) {
        localProducts[i] = {
          ...localProducts[i],
          title,
          price,
          category,
          image,
          description
        };
        break;
      }
    }
    renderProducts(localProducts);
    showMsg("Updated!");
    resetForm();
    editId = null;
    $("#formTitle").text("Create Product");
    $("#btnSave").text("Save");
    return;
  }

  // CREATE
  const newId = Date.now();
  const newProduct = { id: newId, title, price, category, image, description };
  localProducts.unshift(newProduct);
  renderProducts(localProducts);
  showMsg("Created!");
  resetForm();
}

// DELETE
function handleDelete() {
  const id = $(this).attr("data-id");
  if (!confirm("Delete this product?")) return;
  localProducts = localProducts.filter(p => String(p.id) !== String(id));
  renderProducts(localProducts);
  showMsg("Deleted!");
}

// EDIT — Prefill form
function handleEdit(e) {
  e.preventDefault();
  const id = $(this).attr("data-id");
  const product = localProducts.find(p => String(p.id) === String(id));
  if (!product) return;

  $("#title").val(product.title);
  $("#price").val(product.price);
  $("#category").val(product.category);
  $("#image").val(product.image);
  $("#description").val(product.description || "");

  editId = id;
  $("#formTitle").text("Edit Product (ID: " + id + ")");
  $("#btnSave").text("Update");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Helpers
function resetForm() {
  $("#title").val("");
  $("#price").val("");
  $("#category").val("");
  $("#image").val("");
  $("#description").val("");
  editId = null;
  $("#formTitle").text("Create Product");
  $("#btnSave").text("Save");
}

function showMsg(text) {
  const el = $("#msg");
  el.text(text).show();
  setTimeout(() => el.hide(), 1400);
}

// Bindings
$(document).ready(function () {
  loadProducts();

  // Submit via form
  $("#productForm").on("submit", handleFormSubmission);

  // Also allow clicking Save (in case form is changed later)
  $("#btnSave").on("click", handleFormSubmission);

  $("#btnReset").on("click", function () { resetForm(); });

  // Edit / Delete (event delegation)
  $(document).on("click", ".btn-edit", handleEdit);
  $(document).on("click", ".btn-del", handleDelete);
});
