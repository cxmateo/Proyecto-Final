document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const cartCountSpan = document.getElementById('cart-count');
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const emptyCartMessage = cartItemsContainer.querySelector('.empty-cart-message');
    const checkoutBtn = document.getElementById('checkout-btn');

    const favoriteCountSpan = document.getElementById('favorite-count');
    const openFavoritesBtn = document.getElementById('open-favorites');
    const closeFavoritesBtn = document.getElementById('close-favorites');
    const favoritesSidebar = document.getElementById('favorites-sidebar');
    const favoritesItemsContainer = document.getElementById('favorites-items');
    const emptyFavoritesMessage = favoritesItemsContainer.querySelector('.empty-favorites-message');
    const clearFavoritesBtn = document.getElementById('clear-favorites-btn');

    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModalBtn = document.getElementById('close-checkout-modal-btn');
    const billingFormElement = document.getElementById('billing-form-element');
    const shippingFormElement = document.getElementById('shipping-form-element');
    const backToBillingBtn = document.getElementById('back-to-billing');

    const userDisplayNameSpan = document.getElementById('user-display-name'); 
    const loginRegisterBtn = document.getElementById('login-register-btn'); 
    const logoutBtn = document.getElementById('logout-btn'); 
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const showRegisterFormBtn = document.getElementById('show-register-form');
    const showLoginFormBtn = document.getElementById('show-login-form');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const registerFormElement = document.getElementById('register-form-element');
    const loginFormElement = document.getElementById('login-form-element');

    let cart = JSON.parse(localStorage.getItem('ecommerceCart')) || [];
    let favorites = JSON.parse(localStorage.getItem('ecommerceFavorites')) || [];
    let allProducts = [];

    let users = JSON.parse(localStorage.getItem('ecommerceUsers')) || {};
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;


    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
    };

    const updateFavoriteCount = () => {
        favoriteCountSpan.textContent = favorites.length;
    };

    const saveCart = () => {
        localStorage.setItem('ecommerceCart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
    };

    const saveFavorites = () => {
        localStorage.setItem('ecommerceFavorites', JSON.stringify(favorites));
        renderFavoriteItems();
        updateFavoriteCount();
        displayProducts(allProducts); 
    };

    const saveUsers = () => {
        localStorage.setItem('ecommerceUsers', JSON.stringify(users));
    };

    const saveCurrentUser = () => {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserDisplayName(); 
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };


    const openAuthModal = () => {
        authModal.classList.add('open');
        showLoginForm(); 
    };

    const closeAuthModal = () => {
        authModal.classList.remove('open');
        loginFormElement.reset();
        registerFormElement.reset();
    };

    const showLoginForm = () => {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    };

    const showRegisterForm = () => {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const email = loginFormElement.elements['login-email'].value;
        const password = loginFormElement.elements['login-password'].value;

        if (users[email] && users[email].password === password) {
            currentUser = { email: email, name: users[email].name };
            saveCurrentUser();
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: `Has iniciado sesión como ${currentUser.name}.`,
                showConfirmButton: false,
                timer: 1500
            });
            closeAuthModal();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error de inicio de sesión',
                text: 'Email o contraseña incorrectos.',
            });
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const name = registerFormElement.elements['register-name'].value;
        const email = registerFormElement.elements['register-email'].value;
        const password = registerFormElement.elements['register-password'].value;
        const confirmPassword = registerFormElement.elements['register-confirm-password'].value;

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error de registro',
                text: 'Las contraseñas no coinciden.',
            });
            return;
        }

        if (users[email]) {
            Swal.fire({
                icon: 'error',
                title: 'Error de registro',
                text: 'Ya existe una cuenta con este email.',
            });
            return;
        }

        users[email] = { name: name, password: password };
        saveUsers();
        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
            showConfirmButton: false,
            timer: 1500
        });
        showLoginForm(); 
    };

    const handleLogout = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: "¿Estás seguro de que quieres cerrar tu sesión actual?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1a1a1a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                currentUser = null;
                saveCurrentUser(); 
                Swal.fire(
                    '¡Sesión Cerrada!',
                    'Has cerrado tu sesión exitosamente.',
                    'success'
                );
            }
        });
    };

    const updateUserDisplayName = () => {
        if (currentUser) {
            userDisplayNameSpan.textContent = currentUser.name; 
            loginRegisterBtn.style.display = 'none'; 
            logoutBtn.style.display = 'block'; 
        } else {
            userDisplayNameSpan.textContent = 'Mi usuario';
            loginRegisterBtn.style.display = 'block';
            logoutBtn.style.display = 'none';

        }
    };


    const openCart = () => {
        cartSidebar.classList.add('open');
        favoritesSidebar.classList.remove('open');
        renderCartItems();
    };

    const closeCart = () => {
        cartSidebar.classList.remove('open');
    };


    const openFavorites = () => {
        favoritesSidebar.classList.add('open');
        cartSidebar.classList.remove('open');
        renderFavoriteItems();
    };

    const closeFavorites = () => {
        favoritesSidebar.classList.remove('open');
    };


    const renderCartItems = () => {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartTotalSpan.textContent = formatCurrency(0);
            checkoutBtn.disabled = true;
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutBtn.disabled = false;
            let total = 0;

            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.dataset.id = item.id;

                const itemPrice = item.price * item.quantity;
                total += itemPrice;

                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${formatCurrency(item.price)} x ${item.quantity} = ${formatCurrency(itemPrice)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="decrease-quantity" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="increase-quantity" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });

            cartTotalSpan.textContent = formatCurrency(total);
        }
        addCartItemEventListeners();
    };

    const addCartItemEventListeners = () => {
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                const itemIndex = cart.findIndex(item => item.id === productId);

                if (itemIndex > -1) {
                    if (cart[itemIndex].quantity > 1) {
                        cart[itemIndex].quantity--;
                        saveCart();
                    } else {
                        removeItemFromCart(productId);
                    }
                }
            });
        });

        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                const itemIndex = cart.findIndex(item => item.id === productId);

                if (itemIndex > -1) {
                    cart[itemIndex].quantity++;
                    saveCart();
                }
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                removeItemFromCart(productId);
            });
        });
    };

    const removeItemFromCart = (productId) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1a1a1a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                cart = cart.filter(item => item.id !== productId);
                saveCart();
                Swal.fire(
                    '¡Eliminado!',
                    'El producto ha sido eliminado del carrito.',
                    'success'
                );
            }
        });
    };


    const renderFavoriteItems = () => {
        favoritesItemsContainer.innerHTML = '';

        if (favorites.length === 0) {
            emptyFavoritesMessage.style.display = 'block';
            clearFavoritesBtn.disabled = true;
        } else {
            emptyFavoritesMessage.style.display = 'none';
            clearFavoritesBtn.disabled = false;

            favorites.forEach(item => {
                const favoriteItemDiv = document.createElement('div');
                favoriteItemDiv.classList.add('favorite-item');
                favoriteItemDiv.dataset.id = item.id;

                const imageUrl = item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/80x80?text=No+Image';

                favoriteItemDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${item.name}">
                    <div class="favorite-item-details">
                        <h4>${item.name}</h4>
                        <p>${formatCurrency(item.price)}</p>
                    </div>
                    <div class="favorite-item-actions-buttons">
                        <button class="remove-favorite-btn" data-id="${item.id}" title="Eliminar de favoritos">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="add-to-cart-from-favorites" data-id="${item.id}" title="Añadir al carrito">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" width="16" height="16">
                                <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7c-26.3 0-45.5-25-38.6-50.4l41-152.3c8.5-31.4 37-53.3 69.5-53.3H400c13.3 0 24-10.7 24-24s-10.7-24-24-24H121.1c-13.3 0-24 10.7-24 24s10.7 24 24 24H270.7l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H69.5c-22 0-41.5-12.8-50.6-32H24C10.7 368 0 357.3 0 344s10.7-24 24-24H456c39.6 0 72.4-30.2 74.7-69.4l41-152.3c1.9-7 3-14.4 3-22.3V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V74.8L477.7 227.1C470.9 251.3 450.4 268 426.7 268H170.7c-13.3 0-24 10.7-24 24s10.7 24 24 24H426.7c8.3 0 16.5-1.5 24.2-4.5L506.7 416H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H552c13.3 0 24-10.7 24-24V344c0-26.2-11.8-50.1-32-66.2L500 216c-3.1-11.5-15.6-18.7-27.4-15.7s-18.7 15.6-15.7 27.4l15.3 56.6c-4.4 1.5-8.9 2.5-13.6 2.5H170.7c-39.6 0-72.4 30.2-74.7 69.4L54.7 480c-1.9 7-3 14.4-3 22.3V504c0 13.3 10.7 24 24 24h496c13.3 0 24-10.7 24-24V504c0-13.3-10.7-24-24-24H496c-13.3 0-24 10.7-24 24s10.7 24 24 24H520c13.3 0 24-10.7 24-24V472H400c-13.3 0-24 10.7-24 24s10.7 24 24 24H520c13.3 0 24-10.7 24-24V416H506.7L456 268H170.7zM448 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm-64 0a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM160 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm-64 0a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM224 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM288 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64z"></path>
                            </svg>
                            Añadir
                        </button>
                    </div>
                `;
                favoritesItemsContainer.appendChild(favoriteItemDiv);
            });
        }
        addFavoriteItemEventListeners();
    };

    const addFavoriteItemEventListeners = () => {
        document.querySelectorAll('.remove-favorite-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                removeFavoriteItem(productId);
            });
        });

        document.querySelectorAll('.add-to-cart-from-favorites').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                const productToAdd = allProducts.find(p => p.id === productId);

                if (productToAdd) {
                    const existingProductInCartIndex = cart.findIndex(item => item.id === productId);
                    if (existingProductInCartIndex > -1) {
                        cart[existingProductInCartIndex].quantity++;
                        Swal.fire({
                            icon: 'info',
                            title: 'Cantidad actualizada',
                            text: `Se añadió una unidad más de ${productToAdd.name} al carrito.`,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    } else {
                        cart.push({ ...productToAdd, image: productToAdd.images[0], quantity: 1 });
                        Swal.fire({
                            icon: 'success',
                            title: 'Producto Añadido',
                            text: `${productToAdd.name} ha sido agregado al carrito.`,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                    saveCart();
                    closeFavorites();
                    openCart();
                }
            });
        });
    };

    const removeFavoriteItem = (productId) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Este producto será eliminado de tus favoritos!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1a1a1a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                favorites = favorites.filter(item => item.id !== productId);
                saveFavorites();
                Swal.fire(
                    '¡Eliminado!',
                    'El producto ha sido eliminado de favoritos.',
                    'success'
                );
            }
        });
    };

    clearFavoritesBtn.addEventListener('click', () => {
        if (favorites.length > 0) {
            Swal.fire({
                title: '¿Limpiar todos los favoritos?',
                text: "¡Esto eliminará todos los productos de tu lista de favoritos!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#1a1a1a',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, limpiar!',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    favorites = [];
                    saveFavorites();
                    Swal.fire(
                        '¡Limpiados!',
                        'Tu lista de favoritos ha sido vaciada.',
                        'success'
                    );
                }
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Favoritos Vacío',
                text: 'No hay productos para limpiar.',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });


    function initializeCarousel(card) {
        const carouselImagesContainer = card.querySelector('.carousel-images');
        if (!carouselImagesContainer) return;

        const images = carouselImagesContainer.querySelectorAll('img');
        const prevBtn = card.querySelector('.carousel-control.prev');
        const nextBtn = card.querySelector('.carousel-control.next');
        const dotsContainer = card.querySelector('.carousel-indicators');
        let currentImageIndex = 0;
        let autoSlideInterval;

        if (images.length === 0) return;

        function showImage(index) {
            images.forEach(img => img.classList.remove('active'));
            if (dotsContainer) {
                dotsContainer.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
            }

            currentImageIndex = (index + images.length) % images.length;

            images[currentImageIndex].classList.add('active');
            if (dotsContainer && dotsContainer.children[currentImageIndex]) {
                dotsContainer.children[currentImageIndex].classList.add('active');
            }
        }

        function nextImage() {
            showImage(currentImageIndex + 1);
        }

        function prevImage() {
            showImage(currentImageIndex - 1);
        }

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideInterval = setInterval(nextImage, 3000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                stopAutoSlide();
                prevImage();
                startAutoSlide();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                stopAutoSlide();
                nextImage();
                startAutoSlide();
            });
        }
        if (dotsContainer) {
            dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('dot')) {
                    e.stopPropagation();
                    stopAutoSlide();
                    const slideIndex = parseInt(e.target.dataset.slide);
                    showImage(slideIndex);
                    startAutoSlide();
                }
            });
        }

        showImage(currentImageIndex);
        startAutoSlide();

        card.addEventListener('mouseenter', stopAutoSlide);
        card.addEventListener('mouseleave', startAutoSlide);
    }

    const loadProducts = async () => {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allProducts = await response.json();
            displayProducts(allProducts);
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los productos. Inténtalo de nuevo más tarde.'
            });
        }
    };

    const displayProducts = (products) => {
        productList.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const isFavorite = favorites.some(favProduct => favProduct.id === product.id);
            const favoriteButtonClass = isFavorite ? 'add-to-favorites favorite' : 'add-to-favorites';

            let carouselImagesHtml = '';
            let carouselDotsHtml = '';
            if (product.images && product.images.length > 0) {
                product.images.forEach((imagePath, index) => {
                    const activeClass = index === 0 ? 'active' : '';
                    carouselImagesHtml += `<img src="${imagePath}" alt="${product.name} Vista ${index + 1}" class="${activeClass}">`;
                    carouselDotsHtml += `<span class="dot ${activeClass}" data-slide="${index}"></span>`;
                });
            } else {
                carouselImagesHtml = `<img src="https://via.placeholder.com/200x200?text=No+Image" alt="No image available" class="active">`;
            }

            productCard.innerHTML = `
                <div class="carousel-container">
                    <div class="carousel-images">
                        ${carouselImagesHtml}
                    </div>
                    ${product.images && product.images.length > 1 ?
                        `<button class="carousel-control prev">&#10094;</button>
                        <button class="carousel-control next">&#10095;</button>` : ''
                    }
                    ${product.images && product.images.length > 1 ?
                        `<div class="carousel-indicators">
                            ${carouselDotsHtml}
                        </div>` : ''
                    }
                </div>
                <h3>${product.name}</h3>
                <p>Precio: ${formatCurrency(product.price)}</p>
                <div class="actions">
                    <button class="add-to-cart" data-id="${product.id}">
                        <svg viewBox="0 0 576 512"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7c-26.3 0-45.5-25-38.6-50.4l41-152.3c8.5-31.4 37-53.3 69.5-53.3H400c13.3 0 24-10.7 24-24s-10.7-24-24-24H121.1c-13.3 0-24 10.7-24 24s10.7 24 24 24H270.7l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H69.5c-22 0-41.5-12.8-50.6-32H24C10.7 368 0 357.3 0 344s10.7-24 24-24H456c39.6 0 72.4-30.2 74.7-69.4l41-152.3c1.9-7 3-14.4 3-22.3V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V74.8L477.7 227.1C470.9 251.3 450.4 268 426.7 268H170.7c-13.3 0-24 10.7-24 24s10.7 24 24 24H426.7c8.3 0 16.5-1.5 24.2-4.5L506.7 416H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H552c13.3 0 24-10.7 24-24V344c0-26.2-11.8-50.1-32-66.2L500 216c-3.1-11.5-15.6-18.7-27.4-15.7s-18.7 15.6-15.7 27.4l15.3 56.6c-4.4 1.5-8.9 2.5-13.6 2.5H170.7c-39.6 0-72.4 30.2-74.7 69.4L54.7 480c-1.9 7-3 14.4-3 22.3V504c0 13.3 10.7 24 24 24h496c13.3 0 24-10.7 24-24V504c0-13.3-10.7-24-24-24H496c-13.3 0-24 10.7-24 24s10.7 24 24 24H520c13.3 0 24-10.7 24-24V472H400c-13.3 0-24 10.7-24 24s10.7 24 24 24H520c13.3 0 24-10.7 24-24V416H506.7L456 268H170.7zM448 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm-64 0a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM160 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm-64 0a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM224 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM288 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64z"></path></svg>
                        Agregar al carrito
                    </button>
                    <button class="${favoriteButtonClass}" data-id="${product.id}">
                        <svg viewBox="0 0 512 512"><path d="M47.6 300.4L2.5 255.3c-2.4-2.4-3.5-5.6-3.4-8.7c.1-3.1 1.3-6.2 3.4-8.2l39.1-39.1c2-2 4.4-3 6.9-3s4.9 1 6.9 3l14.9 14.9 14.9-14.9c2-2 4.4-3 6.9-3s4.9 1 6.9 3l39.1 39.1c2.1 2 3.2 5.1 3.4 8.2s-1 6.3-3.4 8.7L97.2 300.4c-2.4 2.4-5.6 3.5-8.7 3.4c-3.1-.1-6.2-1.3-8.2-3.4L47.6 300.4zm10.7-65.7l14.9-14.9 14.9 14.9c2 2 4.4 3 6.9 3s4.9-1 6.9-3l39.1-39.1c2-2 4.4-3 6.9-3s4.9 1 6.9 3l39.1 39.1c2.1 2 3.2 5.1 3.4 8.2s-1 6.3-3.4 8.7L181.2 300.4c-2.4 2.4-5.6 3.5-8.7 3.4c-3.1-.1-6.2-1.3-8.2-3.4L58.3 234.7zm181.9-97.4l-14.9-14.9c-2-2-4.4-3-6.9-3s-4.9 1-6.9 3l-39.1 39.1c-2-2-4.4-3-6.9-3s-4.9-1-6.9-3l-39.1-39.1c-2.1-2-3.2-5.1-3.4-8.2s1-6.3 3.4-8.7L113.2 136.4c2.4-2.4 5.6-3.5 8.7-3.4c3.1 .1 6.2 1.3 8.2 3.4L208 223.1V64c0-17.7 14.3-32 32-32s32 14.3 32 32V223.1L303.2 136.4c2.4-2.4 5.6-3.5 8.7-3.4c3.1 .1 6.2 1.3 8.2 3.4l45.1 45.1c2.4 2.4 3.5 5.6 3.4 8.7s-1.3 6.2-3.4 8.2l-39.1 39.1c-2-2-4.4-3-6.9-3s-4.9-1-6.9-3L282.8 234.7l-14.9-14.9c-2-2-4.4-3-6.9-3s-4.9 1-6.9 3l-14.9 14.9zm135.4-97.4l-39.1 39.1c-2 2-4.4 3-6.9 3s-4.9-1-6.9-3l-39.1-39.1c-2.1-2-3.2-5.1-3.4-8.2s1-6.3 3.4-8.7L313.2 136.4c2.4-2.4 5.6-3.5 8.7-3.4c3.1 .1 6.2 1.3 8.2 3.4l45.1 45.1c2.4 2.4 3.5 5.6 3.4 8.7s-1.3 6.2-3.4 8.2l-39.1 39.1c-2-2-4.4-3-6.9-3s-4.9-1-6.9-3L397.6 234.7l-14.9-14.9c-2-2-4.4-3-6.9-3s-4.9 1-6.9 3l-14.9 14.9c-2 2-4.4 3-6.9 3s-4.9 1-6.9 3l-14.9 14.9c-2 2-4.4 3-6.9 3s-4.9 1-6.9 3l-14.9-14.9c-2-2-4.4-3-6.9-3s-4.9 1-6.9 3l-14.9 14.9c-2 2-4.4 3-6.9 3s-4.9 1-6.9 3l-14.9 14.9c-2 2-4.4 3-6.9 3s-4.9 1-6.9 3L181.2 234.7zm-2.4-6.4L188.7 181.2c-2.4 2.4-5.6 3.5-8.7 3.4c-3.1-.1-6.2-1.3-8.2-3.4L132.3 124.9c-2-2-4.4-3-6.9-3s-4.9 1-6.9 3l-39.1 39.1c-2-2-4.4-3-6.9-3s-4.9 1-6.9 3l-39.1-39.1c-2.1-2-3.2-5.1-3.4-8.2s1-6.3 3.4-8.7L47.6 177.3c2.4-2.4 5.6-3.5 8.7-3.4c3.1 .1 6.2 1.3 8.2 3.4l45.1 45.1c2.4 2.4 3.5 5.6 3.4 8.7s-1.3 6.2-3.4 8.2L124.9 234.7l14.9-14.9c2-2 4.4-3 6.9-3s4.9 1 6.9 3l14.9 14.9c2-2 4.4-3 6.9-3s4.9 1 6.9 3l14.9 14.9c2-2 4.4-3 6.9-3s4.9 1-6.9 3l-14.9 14.9c-2 2-4.4 3-6.9 3s-4.9-1-6.9-3l-14.9-14.9c-2-2-4.4-3-6.9-3s-4.9 1-6.9 3l-14.9 14.9c-2 2-4.4 3-6.9 3s-4.9 1-6.9 3l-14.9 14.9c-2 2-4.4 3-6.9 3s-4.9 1-6.9 3L181.2 234.7zM448 352a96 96 0 1 0 0 192 96 96 0 1 0 0-192zm0 144a48 48 0 1 1 0-96 48 48 0 1 1 0 96zM320 352c0-17.7-14.3-32-32-32H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H288c17.7 0 32-14.3 32-32z"/></svg>
                        Agregar a favoritos
                    </button>
                </div>
            `;
            productList.appendChild(productCard);

            initializeCarousel(productCard);
        });

        addEventListenersToProductButtons(products);
    };

    const addEventListenersToProductButtons = (products) => {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                const productToAdd = allProducts.find(p => p.id === productId);

                if (productToAdd) {
                    const existingProductIndex = cart.findIndex(item => item.id === productId);
                    if (existingProductIndex > -1) {
                        cart[existingProductIndex].quantity++;
                        Swal.fire({
                            icon: 'info',
                            title: 'Cantidad actualizada',
                            text: `Se añadió una unidad más de ${productToAdd.name} al carrito.`,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    } else {
                        cart.push({ ...productToAdd, image: productToAdd.images[0], quantity: 1 });
                        Swal.fire({
                            icon: 'success',
                            title: 'Producto Añadido',
                            text: `${productToAdd.name} ha sido agregado al carrito.`,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                    saveCart();
                }
            });
        });

        document.querySelectorAll('.add-to-favorites').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                const productToFavorite = allProducts.find(p => p.id === productId);

                if (productToFavorite) {
                    const isAlreadyFavorite = favorites.some(favProduct => favProduct.id === productId);

                    if (isAlreadyFavorite) {
                        favorites = favorites.filter(favProduct => favProduct.id !== productId);
                        button.classList.remove('favorite');
                        Swal.fire({
                            icon: 'info',
                            title: 'Eliminado de Favoritos',
                            text: `${productToFavorite.name} ha sido eliminado de tus favoritos.`,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    } else {
                        favorites.push(productToFavorite);
                        button.classList.add('favorite');
                        Swal.fire({
                            icon: 'success',
                            title: 'Añadido a Favoritos',
                            text: `${productToFavorite.name} ha sido añadido a tus favoritos.`,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                    saveFavorites();
                }
            });
        });
    };

    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    openFavoritesBtn.addEventListener('click', openFavorites);
    closeFavoritesBtn.addEventListener('click', closeFavorites);

checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            if (currentUser) {
                openCheckoutModal();
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Inicia Sesión para Comprar',
                    text: 'Para finalizar tu compra, primero debes iniciar sesión o registrarte.',
                    showCancelButton: true,
                    confirmButtonColor: '#1a1a1a',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ir a Iniciar Sesión',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        openAuthModal(); 
                    }
                });
            }
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Carrito Vacío',
                text: 'No tienes productos en tu carrito para finalizar la compra.',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });


    const openCheckoutModal = () => {
        checkoutModal.classList.add('open');
        showBillingForm(); 
    };

    const closeCheckoutModal = () => {
        checkoutModal.classList.remove('open');
        billingFormElement.reset(); 
        shippingFormElement.reset();
    };

    const showBillingForm = () => {
        billingFormElement.classList.add('active');
        shippingFormElement.classList.remove('active');
    };

    const showShippingForm = () => {
        shippingFormElement.classList.add('active');
        billingFormElement.classList.remove('active');
    };

    const handleBillingSubmit = (e) => {
        e.preventDefault();

        showShippingForm();
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();

        Swal.fire({
            title: 'Confirmar Compra',
            text: '¿Estás seguro de que quieres finalizar tu compra?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1a1a1a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Comprar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                cart = [];
                saveCart(); 
                closeCheckoutModal(); 

                Swal.fire(
                    '¡Compra Exitosa!',
                    'Tu pedido ha sido procesado y será enviado a la brevedad.',
                    'success'
                );
            }
        });
    };    

    loginRegisterBtn.addEventListener('click', openAuthModal); 
    closeModalBtn.addEventListener('click', closeAuthModal);
    showRegisterFormBtn.addEventListener('click', showRegisterForm);
    showLoginFormBtn.addEventListener('click', showLoginForm);
    loginFormElement.addEventListener('submit', handleLogin);
    registerFormElement.addEventListener('submit', handleRegister);
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    closeCheckoutModalBtn.addEventListener('click', closeCheckoutModal);

    billingFormElement.addEventListener('submit', handleBillingSubmit);
    shippingFormElement.addEventListener('submit', handleShippingSubmit);
    backToBillingBtn.addEventListener('click', showBillingForm);

    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            closeCheckoutModal();
        }
    });


    loadProducts();
    updateCartCount();
    updateFavoriteCount();
    renderCartItems();
    renderFavoriteItems();
    updateUserDisplayName(); 
});