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