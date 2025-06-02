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
            alert(result.msg || "Товар успешно добавлен");
            const modalEl = document.getElementById("addUserModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            form.reset();
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