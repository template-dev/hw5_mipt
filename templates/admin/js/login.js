function togglePassword() {
    const password = document.getElementById('password');
    const icon = document.querySelector('.password-toggle i');
    
    if (password.type === 'password') {
        password.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        password.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

document.getElementById('authForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        alert('Авторизация успешна!');
    } else {
        alert('Пожалуйста, заполните все поля!');
    }
});

document.getElementById('authForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: new URLSearchParams({ login, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert("Ошибка: " + (errorData.detail || "Ошибка входа"));
            return;
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        alert('Успешный вход!');
        // window.location.href = '/dashboard'; // переход на защищённую страницу
    } catch (err) {
        alert('Произошла ошибка: ' + err.message);
    }
});
