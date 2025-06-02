document.getElementById("saveUserBtn").addEventListener("click", async function () {
    const form = document.getElementById("addUserForm");
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const name = document.getElementById("name").value;
    const description = document.getElementById("userNotes").value;
    const price = document.getElementById("price").value;
    const imageInput = document.getElementById("userAvatar");
    const imageFile = imageInput.files[0];

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);

    if (imageFile) {
        formData.append("image_path", imageFile);
    }

    try {
        const response = await fetch("/products", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            const modalEl = document.getElementById("addUserModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            form.reset();
            location.reload();
        } else {
            alert(result.detail || "Ошибка добавления товара");
        }
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка отправки формы");
    }
});

document.getElementById('userAvatar').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.match('image.*')) {
            alert('Пожалуйста, выберите изображение (JPG, PNG)');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('Размер файла не должен превышать 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('avatarPreview').style.backgroundImage = `url(${event.target.result})`;
        };
        reader.readAsDataURL(file);
    }
});

let currentProductId = null;

function showDeleteModal(productId) {
    currentProductId = productId;
    const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    modal.show();
}

document.getElementById('confirmDeleteBtn').addEventListener('click', async function() {
    if (!currentProductId) return;
    
    const deleteBtn = document.getElementById('confirmDeleteBtn');
    const originalBtnText = deleteBtn.innerHTML;
    
    try {
        deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Удаление...';
        deleteBtn.disabled = true;

        const response = await fetch(`/products/${currentProductId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка при удалении товара');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        modal.hide();
        
        location.reload();
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert(error.message);
    } finally {
        deleteBtn.innerHTML = originalBtnText;
        deleteBtn.disabled = false;
    }
});

document.querySelectorAll('.delete-product-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const productId = this.getAttribute('data-product-id');
        showDeleteModal(productId);
    });
});

document.getElementById('editProductImage').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('editProductImagePreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

async function openEditModal(productId) {
  document.getElementById('editProductName').value = product.name;
  document.getElementById('editProductDescription').value = product.description;
  document.getElementById('editProductPrice').value = product.price;
  document.getElementById("editProductImagePreview").src = product.image_path
    ? `/${product.image_path}`
    : "../../static/admin/img/default.png";

  const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
  modal.show();
}

document.querySelectorAll('.edit-product-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const productId = this.getAttribute('data-product-id');
    openEditModal(productId);
  });
});

async function openEditModal(productId) {
  const response = await fetch(`/products/${productId}`);
  if (!response.ok) {
    alert("Ошибка при загрузке товара");
    return;
  }

  const product = await response.json();

  document.getElementById("editProductId").value = product.id;
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editProductDescription").value = product.description || "";
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductImagePreview").src = product.image_path || "";

  const modal = new bootstrap.Modal(document.getElementById("editProductModal"));
  modal.show();
}

document.getElementById("editProductForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const saveChangesBtn = document.querySelector('.saveChangesBtn');
    const originalBtnText = saveChangesBtn.innerHTML;

    const form = e.target;
    const formData = new FormData(form);
    const productId = formData.get("id");

    saveChangesBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Сохранение...';
    saveChangesBtn.disabled = true;

    const response = await fetch(`/products/${productId}`, {
        method: "PUT",
        body: formData,
    });

    if (response.ok) {
        saveChangesBtn.disabled = false;
        saveChangesBtn.innerHTML = originalBtnText;
        location.reload();
    } else {
        const error = await response.json();
        alert("Ошибка: " + error.detail);
    }
});
