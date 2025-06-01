// Toggle submenu
function toggleSubmenu(id) {
    const submenu = document.getElementById(id);
    submenu.classList.toggle('show');
    
    // Rotate arrow icon
    const arrow = submenu.previousElementSibling.querySelector('.fa-chevron-down');
    arrow.classList.toggle('fa-rotate-180');
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('show');
    }
});
// Превью загружаемого аватара
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

// Переключение видимости пароля
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

// Валидация формы
document.getElementById('saveUserBtn').addEventListener('click', function() {
    const form = document.getElementById('addUserForm');
    const password = document.getElementById('userPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Проверка валидности формы
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        document.getElementById('confirmPassword').classList.add('is-invalid');
        return;
    } else {
        document.getElementById('confirmPassword').classList.remove('is-invalid');
    }
    
    // Здесь будет код для сохранения пользователя
    // Например, AJAX-запрос к серверу
    
    // Временное сообщение об успехе
    alert('Пользователь успешно добавлен!');
    
    // Закрытие модального окна
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    modal.hide();
    
    // Сброс формы
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('avatarPreview').style.backgroundImage = 'url(https://via.placeholder.com/80)';
    
    // Здесь можно обновить таблицу пользователей
    // loadUsers();
});

// Сброс валидации при закрытии модального окна
document.getElementById('addUserModal').addEventListener('hidden.bs.modal', function () {
    const form = document.getElementById('addUserForm');
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('avatarPreview').style.backgroundImage = 'url(https://via.placeholder.com/80)';
});

function previewAvatar(input) {
  const preview = document.getElementById('avatarPreview');
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.style.backgroundImage = `url('${e.target.result}')`;
    };
    reader.readAsDataURL(file);
  }
}

function togglePasswordVisibility(id, iconElement) {
  const input = document.getElementById(id);
  const icon = iconElement.querySelector('i');
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