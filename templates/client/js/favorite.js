document.addEventListener('DOMContentLoaded', () => {
    const favoriteButtons = document.querySelectorAll('.bulb__button-favorite');
    let favoritesCountElement = document.querySelector('.header__nav-item a[href="/favorites"] .count');
    
    // Fallback selector if primary doesn't work
    if (!favoritesCountElement) {
        favoritesCountElement = document.querySelector('.count'); // Try simpler selector
    }

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    updateFavoritesCount();

    favoriteButtons.forEach(button => {
        const id = button.getAttribute('data-id');
        if (favorites.includes(id)) {
            button.classList.add('bulb__button-favorite--active'); // Fixed class name to match your CSS
        }

        button.addEventListener('click', () => {
            toggleFavorite(id, button);
        });
    });

    function toggleFavorite(id, button) {
        const index = favorites.indexOf(id);
        if (index !== -1) {
            favorites.splice(index, 1);
            button.classList.remove('bulb__button-favorite--active');
        } else {
            favorites.push(id);
            button.classList.add('bulb__button-favorite--active');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesCount();
    }

    function updateFavoritesCount() {
        if (favoritesCountElement) {
            favoritesCountElement.textContent = favorites.length;
        } else {
            console.warn('Favorites count element not found');
        }
    }
});