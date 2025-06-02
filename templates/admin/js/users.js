function toggleSubmenu(id) {
    const submenu = document.getElementById(id);
    submenu.classList.toggle('show');
    
    const arrow = submenu.previousElementSibling.querySelector('.fa-chevron-down');
    arrow.classList.toggle('fa-rotate-180');
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
}

document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('show');
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

function togglePasswordVisibility(inputId, toggleElement) {
    const input = document.getElementById(inputId);
    const icon = toggleElement.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

document.getElementById("saveUserBtn").addEventListener("click", async function () {
    const form = document.getElementById("addUserForm");
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("userEmail").value;
    const phone = document.getElementById("userPhone").value;
    const password = document.getElementById("userPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const avatarInput = document.getElementById("userAvatar");
    const avatarFile = avatarInput.files[0];

    if (password !== confirmPassword) {
        alert("Пароли не совпадают");
        return;
    }

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    if (avatarFile) {
        formData.append("avatar", avatarFile);
    }

    try {
        const response = await fetch("/users", {
            method: "POST",
            body: formData
        });
        console.log(response)

        const result = await response.json();

        if (response.ok) {
            alert(result.msg);
            const modal = bootstrap.Modal.getInstance(document.getElementById("addUserModal"));
            modal.hide();
            form.reset();
        } else {
            alert(result.detail || "Ошибка регистрации");
        }
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка отправки формы");
    }
});