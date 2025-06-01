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
document.getElementById('avatarUpload').addEventListener('change', function(e) {
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
            document.getElementById('profileAvatar').src = event.target.result;
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

// Валидация формы профиля
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (this.checkValidity()) {
        // Здесь будет код для сохранения профиля
        alert('Изменения профиля сохранены!');
        this.classList.remove('was-validated');
    } else {
        this.classList.add('was-validated');
    }
});

// Валидация формы безопасности
document.getElementById('securityForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        document.getElementById('confirmPassword').classList.add('is-invalid');
        return;
    } else {
        document.getElementById('confirmPassword').classList.remove('is-invalid');
    }
    
    if (this.checkValidity()) {
        // Здесь будет код для сохранения настроек безопасности
        alert('Настройки безопасности обновлены!');
        this.classList.remove('was-validated');
    } else {
        this.classList.add('was-validated');
    }
});