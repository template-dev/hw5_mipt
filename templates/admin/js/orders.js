function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('show');
    mainContent.classList.toggle('show');
}

// Инициализация tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Функция для изменения статуса заказа
function changeOrderStatus(orderId, newStatus) {
    console.log(`Changing order ${orderId} status to ${newStatus}`);
    // Здесь будет AJAX запрос для изменения статуса
}

// Функция для подтверждения заказа
function confirmOrder(orderId) {
    if (confirm('Вы уверены, что хотите подтвердить этот заказ?')) {
        changeOrderStatus(orderId, 'confirmed');
    }
}

// Функция для отмены заказа
function cancelOrder(orderId) {
    if (confirm('Вы уверены, что хотите отменить этот заказ?')) {
        changeOrderStatus(orderId, 'cancelled');
    }
}

// Функция для завершения заказа
function completeOrder(orderId) {
    if (confirm('Вы уверены, что хотите завершить этот заказ?')) {
        changeOrderStatus(orderId, 'completed');
    }
}