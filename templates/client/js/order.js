document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.order-parent__form');

    // Подставляем данные в cost-инпуты
    let basketItems = [];
    let deliveryCost = 250.00;

    try {
        const basketRaw = localStorage.getItem('basket');
        if (basketRaw) {
            basketItems = JSON.parse(basketRaw);
        }
    } catch (e) {
        console.error("Ошибка при чтении данных из localStorage:", e);
    }

    let totalQuantity = 0;
    let subtotal = 0.00;

    for (const item of basketItems) {
        const qty = parseInt(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        totalQuantity += qty;
        subtotal += price * qty;
    }

    const total = subtotal + deliveryCost;

    // Обновляем значения
    document.getElementById('productQuantity').value = totalQuantity;
    document.getElementById('deliveryCost').value = deliveryCost.toFixed(2);
    document.getElementById('subtotalCost').value = subtotal.toFixed(2);
    document.getElementById('totalCost').value = total.toFixed(2);

    // Обработка отправки формы
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Остановить обычную отправку

        const formData = new FormData(form);

        const orderData = {
            customer_name: formData.get('first_name'),
            customer_surname: formData.get('last_name'),
            customer_email: formData.get('email'),
            customer_phone: formData.get('tel'),
            delivery_country: formData.get('country'),
            delivery_city: formData.get('city'),
            delivery_street: formData.get('street'),
            delivery_building: formData.get('building'),
            items: basketItems.map(item => ({
                product_id: parseInt(item.id),
                quantity: parseInt(item.quantity)
            }))
        };

        fetch('/order/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(async response => {
            const responseText = await response.text();

            if (response.ok) {
                alert('Order submitted successfully!');
                localStorage.removeItem('basket');
                window.location.href = '/';
            } else {
                console.error('Server error response:', response.status, responseText);
                alert(`Failed to submit order: ${response.status}\n${responseText}`);
            }
        })
        .catch(error => {
            console.error('Error submitting order:', error);
            alert('Network or server error occurred');
        });
    });
});
