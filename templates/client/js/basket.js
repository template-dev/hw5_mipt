document.addEventListener('DOMContentLoaded', function () {
    const basketLink = document.querySelector('.basket__link');
    const modal = document.querySelector('.modal');
    const modalCloseBtn = document.querySelector('.modal__close');
    const basketCountSpan = document.querySelector('.basket-count');
    const basketCountMini = document.querySelector('.basket__count');
    const buyButtons = document.querySelectorAll('.bulb__button-buy');
    const buyButtonsIndex = document.querySelectorAll('.bulb__button-buy-index');

    const subtotalInput = document.querySelector('input[name="subtotal"]');
    const deliveryInput = document.querySelector('input[name="delivery"]');
    const totalInput = document.querySelector('input[name="total"]');

    function updateBasketCount() {
        const basket = JSON.parse(localStorage.getItem('basket')) || [];
        const totalCount = basket.reduce((sum, item) => sum + item.quantity, 0);

        if (basketCountSpan) basketCountSpan.textContent = totalCount;
        if (basketCountMini) basketCountMini.textContent = totalCount;
    }

    function updateTotals() {
        const basket = JSON.parse(localStorage.getItem('basket')) || [];
        const subtotal = basket.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const delivery = deliveryInput ? parseFloat(deliveryInput.value) || 0 : 0;
        const total = subtotal + delivery;

        if (subtotalInput) subtotalInput.value = subtotal.toFixed(2);
        if (totalInput) totalInput.value = total.toFixed(2);
    }

    function renderBasketItems() {
        const basketTableBody = document.querySelector('.basket__table tbody');
        if (!basketTableBody) return;

        basketTableBody.innerHTML = '';
        let basket = JSON.parse(localStorage.getItem('basket')) || [];

        basket.forEach(item => {
            if (!item || typeof item.price !== 'number') return;

            const itemTotal = (item.price * item.quantity).toFixed(2);
            const row = document.createElement('tr');
            row.classList.add('basket__item');

            row.innerHTML = `
                <td><img src="${item.image}" width="100" alt="${item.name}"></td>
                <td><a href="/products/${item.id}" style="color: #000;">${item.name}</a></td>
                <td>${item.description}</td>
                <td>${item.price.toFixed(2)} RUB</td>
                <td>
                    <div class="basket__quantity">
                        <input type="number" name="quantity_number" min="1" value="${item.quantity}" required>
                        <button class="basket__remove-item-button">
                            <svg width="24px" height="24px" viewBox="0 0 24 24" fill="#ff2c2c" xmlns="http://www.w3.org/2000/svg" stroke="#ff2c2c">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"/>
                            </svg>
                        </button>
                    </div>
                </td>
                <td>${itemTotal} RUB</td>
            `;

            row.querySelector('.basket__remove-item-button').addEventListener('click', () => {
                basket = basket.filter(b => b.id !== item.id);
                localStorage.setItem('basket', JSON.stringify(basket));
                updateBasketCount();
                renderBasketItems();
                updateTotals();
            });

            row.querySelector('input[type="number"]').addEventListener('input', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (!isNaN(newQuantity) && newQuantity > 0) {
                    const targetItem = basket.find(b => b.id === item.id);
                    if (targetItem) {
                        targetItem.quantity = newQuantity;
                        localStorage.setItem('basket', JSON.stringify(basket));
                        updateBasketCount();
                        renderBasketItems();
                        updateTotals();
                    }
                }
            });

            basketTableBody.appendChild(row);
        });

        updateTotals(); // Вызов после рендера
    }

    buyButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productWrapper = this.closest('.product__wrapper');
            if (!productWrapper) return;

            const productTitle = document.querySelector('h1[data-product-id]');
            const productId = productTitle?.getAttribute('data-product-id');
            const productName = productTitle?.getAttribute('data-product-name') || 'Product';
            const productDescription = productWrapper.querySelector('[data-product-description]')?.textContent || '';
            const priceAttr = productWrapper.querySelector('[data-product-price]')?.getAttribute('data-product-price');
            const productPrice = priceAttr ? parseFloat(priceAttr) : null;
            const productImage = productWrapper.querySelector('img')?.getAttribute('src') || '';

            let quantity = 1;
            const quantityInput = this.previousElementSibling;
            if (quantityInput && quantityInput.classList.contains('quantity-input')) {
                quantity = parseInt(quantityInput.value) || 1;
            }

            if (!productId || !productPrice) {
                alert('Ошибка: невозможно добавить товар (неполные данные).');
                return;
            }

            let basket = JSON.parse(localStorage.getItem('basket')) || [];
            const existingIndex = basket.findIndex(item => item.id === productId);

            if (existingIndex !== -1) {
                basket[existingIndex].quantity += quantity;
            } else {
                basket.push({
                    id: productId,
                    name: productName,
                    description: productDescription,
                    price: productPrice,
                    quantity: quantity,
                    image: productImage
                });
            }

            localStorage.setItem('basket', JSON.stringify(basket));
            updateBasketCount();
            updateTotals();
            alert('Товар добавлен в корзину!');
        });
    });

    buyButtonsIndex.forEach(button => {
        button.addEventListener('click', function () {
            const item = this.closest('.light-bulbs__item');
            if (!item) return;

            // Данные берём из элементов внутри item:
            const productLink = item.querySelector('a[data-product-id]');
            const productId = productLink?.getAttribute('data-product-id');

            const productNameElem = item.querySelector('.bulb__name[data-product-name]');
            const productName = productNameElem?.getAttribute('data-product-name') || 'Product';

            const productDescriptionElem = item.querySelector('.bulb__description[data-product-description]');
            const productDescription = productDescriptionElem?.getAttribute('data-product-description') || '';

            const priceElem = item.querySelector('.bulb__price[data-product-price]');
            const productPrice = priceElem ? parseFloat(priceElem.getAttribute('data-product-price')) : null;

            const productImageElem = productLink.querySelector('img[data-product-img]');
            const productImage = productImageElem?.getAttribute('data-product-img') || '';

            // Количество из input.quantity-input (он у тебя скрыт, но может быть виден — считаем)
            let quantity = 1;
            const quantityInput = item.querySelector('input.quantity-input');
            if (quantityInput) {
                quantity = parseInt(quantityInput.value) || 1;
            }

            if (!productId || productPrice === null) {
                alert('Ошибка: невозможно добавить товар (неполные данные).');
                return;
            }

            let basket = JSON.parse(localStorage.getItem('basket')) || [];
            const existingIndex = basket.findIndex(item => item.id === productId);

            if (existingIndex !== -1) {
                basket[existingIndex].quantity += quantity;
            } else {
                basket.push({
                    id: productId,
                    name: productName,
                    description: productDescription,
                    price: productPrice,
                    quantity: quantity,
                    image: productImage
                });
            }

            localStorage.setItem('basket', JSON.stringify(basket));
            updateBasketCount();
            updateTotals();
            alert('Товар добавлен в корзину!');
        });
    });

    if (basketLink) {
        basketLink.addEventListener('click', function (e) {
            const basket = JSON.parse(localStorage.getItem('basket')) || [];
            if (basket.length === 0) {
                e.preventDefault();
                if (modal) {
                    modal.style.display = 'flex';
                }
            }
        });
    }

    if (modalCloseBtn && modal) {
        modalCloseBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    const checkoutLink = document.getElementById('checkoutLink');
    const modalInfo = document.querySelector('.modal__info');
    const modalInfoCloseBtn = modalInfo?.querySelector('.modal__close-button');

    if (checkoutLink) {
        checkoutLink.addEventListener('click', function (e) {
            const basket = JSON.parse(localStorage.getItem('basket')) || [];
            if (basket.length === 0) {
                e.preventDefault();
                if (modalInfo) {
                    modalInfo.style.display = 'flex';
                }
            }
        });
    }

    if (modalInfo && modalInfoCloseBtn) {
        modalInfoCloseBtn.addEventListener('click', () => {
            modalInfo.style.display = 'none';
        });
    }

    updateBasketCount();
    renderBasketItems();
    updateTotals();
});
