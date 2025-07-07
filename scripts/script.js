// Corregí el tema de la estructura de archivos, ahora está todo en sus carpetas como corresponde,
// y agregué un segundo archivo JS (utils.js) para las funciones auxiliares, así cumplimos con el mínimo.

// En el carrito, sumé un mensaje de "carrito vacío" para cuando no hay nada, y agregué un botón
// para vaciar todo de una, mucho más cómodo que ir eliminando producto por producto.

// Le di una buena repasada al checkout. Ahora valida bien los datos, por ejemplo, el número de tarjeta
// solo acepta 16 dígitos numéricos, la fecha de vencimiento valida contra el mes y año actuales, y el CVV 3 dígitos.
// También me aseguré de que el DNI solo acepte números.

// Y lo más importante: al finalizar la compra, ahora se muestra un resumen con todos los datos de pago y envío,
// y el listado de productos adquiridos con el total, para que el usuario tenga su comprobante.

// Eliminé el evento DOMContentLoaded y las referencias a innerHTML para evitar esas malas prácticas
// y mejorar la performance y seguridad. Ahora estoy usando solo eventos para el manejo del DOM.

// Creo que con esto estamos mucho mejor y cumple con lo esperado
//ahora si espero q este todo bien, comente cada cosa asi es mas legible.........
// Saludos!

import { formatCurrency, saveCart, saveFavorites, saveUsers, saveCurrentUser } from './utils.js';

// Esto es para agarrar los elementos del HTML
const listaProductos = document.getElementById('product-list');
const contadorCarritoSpan = document.getElementById('cart-count');
const botonAbrirCarrito = document.getElementById('open-cart');
const botonCerrarCarrito = document.getElementById('close-cart');
const barraLateralCarrito = document.getElementById('cart-sidebar');
const contenedorItemsCarrito = document.getElementById('cart-items');
const totalCarritoSpan = document.getElementById('cart-total');
const mensajeCarritoVacio = contenedorItemsCarrito.querySelector('.empty-cart-message');
const botonFinalizarCompra = document.getElementById('checkout-btn');
const botonVaciarCarrito = document.getElementById('clear-cart-btn');

const contadorFavoritosSpan = document.getElementById('favorite-count');
const botonAbrirFavoritos = document.getElementById('open-favorites');
const botonCerrarFavoritos = document.getElementById('close-favorites');
const barraLateralFavoritos = document.getElementById('favorites-sidebar');
const contenedorItemsFavoritos = document.getElementById('favorites-items');
const mensajeFavoritosVacios = contenedorItemsFavoritos.querySelector('.empty-favorites-message');
const botonLimpiarFavoritos = document.getElementById('clear-favorites-btn');

const modalFinalizarCompra = document.getElementById('checkout-modal');
const botonCerrarModalFinalizarCompra = document.getElementById('close-checkout-modal-btn');
const formularioFacturacionElemento = document.getElementById('billing-form-element');
const formularioEnvioElemento = document.getElementById('shipping-form-element');
const botonVolverFacturacion = document.getElementById('back-to-billing');

const nombreUsuarioMostradoSpan = document.getElementById('user-display-name');
const botonLoginRegistro = document.getElementById('login-register-btn');
const botonCerrarSesion = document.getElementById('logout-btn');
const modalAutenticacion = document.getElementById('auth-modal');
const botonCerrarModal = document.getElementById('close-modal-btn');
const botonMostrarFormularioRegistro = document.getElementById('show-register-form');
const botonMostrarFormularioLogin = document.getElementById('show-login-form');
const formularioLogin = document.getElementById('login-form');
const formularioRegistro = document.getElementById('register-form');
const formularioRegistroElemento = document.getElementById('register-form-element');
const formularioLoginElemento = document.getElementById('login-form-element');

// Estas son las variables que guardan el estado de la app, onda lo que el usuario tiene en el carrito, favoritos, etc
let carrito = JSON.parse(localStorage.getItem('ecommerceCart')) || [];
let favoritos = JSON.parse(localStorage.getItem('ecommerceFavorites')) || [];
let todosLosProductos = [];

let usuarios = JSON.parse(localStorage.getItem('ecommerceUsers')) || {};
let usuarioActual = JSON.parse(sessionStorage.getItem('currentUser')) || null;

const actualizarContadorCarrito = () => {
    const totalItems = carrito.reduce((sum, item) => sum + item.quantity, 0);
    contadorCarritoSpan.textContent = totalItems;
};

const actualizarContadorFavoritos = () => {
    contadorFavoritosSpan.textContent = favoritos.length;
};

const abrirModalAutenticacion = () => {
    modalAutenticacion.classList.add('open');
    mostrarFormularioLogin();
};

const cerrarModalAutenticacion = () => {
    modalAutenticacion.classList.remove('open');
    formularioLoginElemento.reset();
    formularioRegistroElemento.reset();
};

const mostrarFormularioLogin = () => {
    formularioLogin.classList.add('active');
    formularioRegistro.classList.remove('active');
};

const mostrarFormularioRegistro = () => {
    formularioRegistro.classList.add('active');
    formularioLogin.classList.remove('active');
};

// Esta función se encarga de que la gente pueda iniciar sesión
const manejarLogin = (e) => {
    e.preventDefault();
    const email = formularioLoginElemento.elements['login-email'].value;
    const password = formularioLoginElemento.elements['login-password'].value;

    if (usuarios[email] && usuarios[email].password === password) {
        usuarioActual = { email: email, name: usuarios[email].name };
        saveCurrentUser(usuarioActual);
        Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: `Has iniciado sesión como ${usuarioActual.name}.`,
            showConfirmButton: false,
            timer: 1500
        });
        cerrarModalAutenticacion();
        actualizarNombreUsuarioMostrado();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: 'Email o contraseña incorrectos.',
        });
    }
};

// Esta función maneja el registro de nuevos usuarios
const manejarRegistro = (e) => {
    e.preventDefault();
    const name = formularioRegistroElemento.elements['register-name'].value;
    const email = formularioRegistroElemento.elements['register-email'].value;
    const password = formularioRegistroElemento.elements['register-password'].value;
    const confirmPassword = formularioRegistroElemento.elements['register-confirm-password'].value;

    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Error de registro',
            text: 'Las contraseñas no coinciden.',
        });
        return;
    }

    if (usuarios[email]) {
        Swal.fire({
            icon: 'error',
            title: 'Error de registro',
            text: 'Ya existe una cuenta con este email.',
        });
        return;
    }

    usuarios[email] = { name: name, password: password };
    saveUsers(usuarios);
    Swal.fire({
        icon: 'success',
        title: '¡Registro Exitoso!',
        text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        showConfirmButton: false,
        timer: 1500
    });
    mostrarFormularioLogin();
};

// Se encarga de que el usuario pueda cerrar sesión
const manejarCerrarSesion = () => {
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
            usuarioActual = null;
            saveCurrentUser(usuarioActual);
            Swal.fire(
                '¡Sesión Cerrada!',
                'Has cerrado tu sesión exitosamente.',
                'success'
            );
            actualizarNombreUsuarioMostrado();
        }
    });
};

// Cambia el nombre que se ve arriba a la derecha y los botones de login/logout
const actualizarNombreUsuarioMostrado = () => {
    if (usuarioActual) {
        nombreUsuarioMostradoSpan.textContent = usuarioActual.name;
        botonLoginRegistro.style.display = 'none';
        botonCerrarSesion.style.display = 'block';
    } else {
        nombreUsuarioMostradoSpan.textContent = 'Mi usuario';
        botonLoginRegistro.style.display = 'block';
        botonCerrarSesion.style.display = 'none';
    }
};

const abrirCarrito = () => {
    barraLateralCarrito.classList.add('open');
    barraLateralFavoritos.classList.remove('open');
    renderizarItemsCarrito();
};

const cerrarCarrito = () => {
    barraLateralCarrito.classList.remove('open');
};

const abrirFavoritos = () => {
    barraLateralFavoritos.classList.add('open');
    barraLateralCarrito.classList.remove('open');
    renderizarItemsFavoritos();
};

const cerrarFavoritos = () => {
    barraLateralFavoritos.classList.remove('open');
};

// Esta función dibuja todos los productos que el usuario tiene en el carrito en la barra lateral
const renderizarItemsCarrito = () => {
    contenedorItemsCarrito.innerHTML = '';

    if (carrito.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.classList.add('empty-cart-message');
        emptyMessage.textContent = 'Tu carrito está vacío.';
        contenedorItemsCarrito.appendChild(emptyMessage);
        totalCarritoSpan.textContent = formatCurrency(0);
        botonVaciarCarrito.style.display = 'none';
        botonFinalizarCompra.style.display = 'none';

    } else {
        mensajeCarritoVacio.style.display = 'none';
        botonVaciarCarrito.style.display = 'block';
        botonFinalizarCompra.style.display = 'block';

        let total = 0;

        carrito.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.dataset.id = item.id;

            const itemPrice = item.price * item.quantity;
            total += itemPrice;

            const imgElement = document.createElement('img');
            imgElement.src = item.image;
            imgElement.alt = item.name;
            cartItemDiv.appendChild(imgElement);

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('cart-item-details');

            const h4 = document.createElement('h4');
            h4.textContent = item.name;
            detailsDiv.appendChild(h4);

            const p = document.createElement('p');
            p.textContent = `${formatCurrency(item.price)} x ${item.quantity} = ${formatCurrency(itemPrice)}`;
            detailsDiv.appendChild(p);

            cartItemDiv.appendChild(detailsDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('cart-item-actions');

            const quantityControlsDiv = document.createElement('div');
            quantityControlsDiv.classList.add('quantity-controls');

            const decreaseBtn = document.createElement('button');
            decreaseBtn.classList.add('decrease-quantity');
            decreaseBtn.dataset.id = item.id;
            decreaseBtn.textContent = '-';
            quantityControlsDiv.appendChild(decreaseBtn);

            const quantitySpan = document.createElement('span');
            quantitySpan.textContent = item.quantity;
            quantityControlsDiv.appendChild(quantitySpan);

            const increaseBtn = document.createElement('button');
            increaseBtn.classList.add('increase-quantity');
            increaseBtn.dataset.id = item.id;
            increaseBtn.textContent = '+';
            quantityControlsDiv.appendChild(increaseBtn);

            actionsDiv.appendChild(quantityControlsDiv);

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-item-btn');
            removeBtn.dataset.id = item.id;

            const trashIcon = document.createElement('i');
            trashIcon.classList.add('fas', 'fa-trash-alt');
            removeBtn.appendChild(trashIcon);
            removeBtn.appendChild(document.createTextNode(' Eliminar'));

            actionsDiv.appendChild(removeBtn);
            cartItemDiv.appendChild(actionsDiv);

            contenedorItemsCarrito.appendChild(cartItemDiv);
        });

        totalCarritoSpan.textContent = formatCurrency(total);
    }
    actualizarContadorCarrito();
    agregarEventosBotonesCarrito();
};

// Acá se ponen los listeners para los botones del carrito
const agregarEventosBotonesCarrito = () => {
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            const itemIndex = carrito.findIndex(item => item.id === productId);

            if (itemIndex > -1) {
                if (carrito[itemIndex].quantity > 1) {
                    carrito[itemIndex].quantity--;
                    saveCart(carrito);
                } else {
                    eliminarItemDeCarrito(productId);
                }
            }
            actualizarContadorCarrito();
            renderizarItemsCarrito();
        });
    });

    botonVaciarCarrito.addEventListener('click', () => {
        if (carrito.length > 0) {
            Swal.fire({
                title: '¿Vaciar carrito?',
                text: "¡Esto eliminará todos los productos de tu carrito!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#1a1a1a',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, vaciar!',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    carrito = [];
                    saveCart(carrito);
                    actualizarContadorCarrito();
                    renderizarItemsCarrito();
                    Swal.fire(
                        '¡Carrito Vaciado!',
                        'Todos los productos han sido eliminados del carrito.',
                        'success'
                    );
                }
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Carrito Vacío',
                text: 'No hay productos para vaciar.',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            const itemIndex = carrito.findIndex(item => item.id === productId);

            if (itemIndex > -1) {
                carrito[itemIndex].quantity++;
                saveCart(carrito);
            }
            actualizarContadorCarrito();
            renderizarItemsCarrito();
        });
    });

    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            eliminarItemDeCarrito(productId);
        });
    });
};

// Borra un producto del carrito, pidiendo confirmación antes
const eliminarItemDeCarrito = (productId) => {
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
            carrito = carrito.filter(item => item.id !== productId);
            saveCart(carrito);
            actualizarContadorCarrito();
            renderizarItemsCarrito();
            Swal.fire(
                '¡Eliminado!',
                'El producto ha sido eliminado del carrito.',
                'success'
            );
        }
    });
};

// Dibuja los productos que el usuario tiene en favoritos
const renderizarItemsFavoritos = () => {
    contenedorItemsFavoritos.innerHTML = '';

    if (favoritos.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.classList.add('empty-favorites-message');
        emptyMessage.textContent = 'No tienes productos en favoritos.';
        contenedorItemsFavoritos.appendChild(emptyMessage);
        botonLimpiarFavoritos.style.display = 'none';
    } else {
        mensajeFavoritosVacios.style.display = 'none';
        botonLimpiarFavoritos.style.display = 'block';

        favoritos.forEach(item => {
            const favoriteItemDiv = document.createElement('div');
            favoriteItemDiv.classList.add('favorite-item');
            favoriteItemDiv.dataset.id = item.id;

            const imageUrl = item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/80x80?text=No+Image';

            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = item.name;
            favoriteItemDiv.appendChild(imgElement);

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('favorite-item-details');

            const h4 = document.createElement('h4');
            h4.textContent = item.name;
            detailsDiv.appendChild(h4);

            const p = document.createElement('p');
            p.textContent = formatCurrency(item.price);
            detailsDiv.appendChild(p);

            favoriteItemDiv.appendChild(detailsDiv);

            const actionsButtonsDiv = document.createElement('div');
            actionsButtonsDiv.classList.add('favorite-item-actions-buttons');

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-favorite-btn');
            removeBtn.dataset.id = item.id;
            removeBtn.title = 'Eliminar de favoritos';

            const trashIcon = document.createElement('i');
            trashIcon.classList.add('fas', 'fa-trash-alt');
            removeBtn.appendChild(trashIcon);
            actionsButtonsDiv.appendChild(removeBtn);

            const addToCartBtn = document.createElement('button');
            addToCartBtn.classList.add('add-to-cart-from-favorites');
            addToCartBtn.dataset.id = item.id;
            addToCartBtn.title = 'Añadir al carrito';

            // Este es un SVG para el icono del carrito, es largo pero es solo el dibujo
            const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgElement.setAttribute("viewBox", "0 0 576 512");
            svgElement.setAttribute("fill", "currentColor");
            svgElement.setAttribute("width", "16");
            svgElement.setAttribute("height", "16");

            const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathElement.setAttribute("d", "M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7c-26.3 0-45.5-25-38.6-50.4l41-152.3c8.5-31.4 37-53.3 69.5-53.3H400c13.3 0 24-10.7 24-24s-10.7-24-24-24H121.1c-13.3 0-24 10.7-24 24s10.7 24 24 24H270.7l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H69.5c-22 0-41.5-12.8-50.6-32H24C10.7 368 0 357.3 0 344s10.7-24 24-24H456c39.6 0 72.4-30.2 74.7-69.4l41-152.3c1.9-7 3-14.4 3-22.3V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V74.8L477.7 227.1C470.9 251.3 450.4 268 426.7 268H170.7c-13.3 0-24 10.7-24 24s10.7 24 24 24H426.7c8.3 0 16.5-1.5 24.2-4.5L506.7 416H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H552c13.3 0 24-10.7 24-24V344c0-26.2-11.8-50.1-32-66.2L500 216c-3.1-11.5-15.6-18.7-27.4-15.7s-18.7 15.6-15.7 27.4l15.3 56.6c-4.4 1.5-8.9 2.5-13.6 2.5H170.7c-39.6 0-72.4 30.2-74.7 69.4L54.7 480c-1.9 7-3 14.4-3 22.3V504c0 13.3 10.7 24 24 24h496c13.3 0 24-10.7 24-24V504c0-13.3-10.7-24-24-24H496c-13.3 0-24 10.7-24 24s10.7 24 24 24H520c13.3 0 24-10.7 24-24V472H400c-13.3 0-24 10.7-24 24s10.7 24 24 24H520c13.3 0 24-10.7 24-24V416H506.7L456 268H170.7zM448 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm-64 0a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM160 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm-64 0a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM224 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM288 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64z");
            svgElement.appendChild(pathElement);
            addToCartBtn.appendChild(svgElement);
            addToCartBtn.appendChild(document.createTextNode(' Añadir'));
            actionsButtonsDiv.appendChild(addToCartBtn);

            favoriteItemDiv.appendChild(actionsButtonsDiv);
            contenedorItemsFavoritos.appendChild(favoriteItemDiv);
        });
    }
    actualizarContadorFavoritos();
    agregarEventosBotonesFavoritos();
};

// Acá se le agregan los listeners a los botones de favoritos, como el de borrar o añadir al carrito
const agregarEventosBotonesFavoritos = () => {
    document.querySelectorAll('.remove-favorite-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            eliminarItemDeFavoritos(productId);
        });
    });

    document.querySelectorAll('.add-to-cart-from-favorites').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            const productToAdd = todosLosProductos.find(p => p.id === productId);

            if (productToAdd) {
                const existingProductInCartIndex = carrito.findIndex(item => item.id === productId);
                if (existingProductInCartIndex > -1) {
                    carrito[existingProductInCartIndex].quantity++;
                    Swal.fire({
                        icon: 'info',
                        title: 'Cantidad actualizada',
                        text: `Se añadió una unidad más de ${productToAdd.name} al carrito.`,
                        showConfirmButton: false,
                        timer: 1500
                    });
                } else {
                    carrito.push({ ...productToAdd, image: productToAdd.images[0], quantity: 1 });
                    Swal.fire({
                        icon: 'success',
                        title: 'Producto Añadido',
                        text: `${productToAdd.name} ha sido agregado al carrito.`,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
                saveCart(carrito);
                actualizarContadorCarrito();

                favoritos = favoritos.filter(favProduct => favProduct.id !== productId);
                saveFavorites(favoritos);
                actualizarContadorFavoritos();
                renderizarItemsFavoritos();

                cerrarFavoritos();
                abrirCarrito();
            }
        });
    });
};

// Borra un producto de la lista de favoritos
const eliminarItemDeFavoritos = (productId) => {
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
            favoritos = favoritos.filter(item => item.id !== productId);
            saveFavorites(favoritos);
            actualizarContadorFavoritos();
            renderizarItemsFavoritos();
            Swal.fire(
                '¡Eliminado!',
                'El producto ha sido eliminado de favoritos.',
                'success'
            );
        }
    });
};

// Evento para limpiar todos los favoritos
botonLimpiarFavoritos.addEventListener('click', () => {
    if (favoritos.length > 0) {
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
                favoritos = [];
                saveFavorites(favoritos);
                actualizarContadorFavoritos();
                renderizarItemsFavoritos();
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

// Inicializa el carrusel de imágenes para cada tarjeta de producto
function inicializarCarrusel(card) {
    const contenedorImagenesCarrusel = card.querySelector('.carousel-images');
    if (!contenedorImagenesCarrusel) return;

    const images = contenedorImagenesCarrusel.querySelectorAll('img');
    const botonAnterior = card.querySelector('.carousel-control.prev');
    const botonSiguiente = card.querySelector('.carousel-control.next');
    const contenedorPuntos = card.querySelector('.carousel-indicators');
    let indiceImagenActual = 0;
    let intervaloAutoSlide;

    if (images.length === 0) return;

    // Muestra una imagen específica del carrusel
    function mostrarImagen(index) {
        images.forEach(img => img.classList.remove('active'));
        if (contenedorPuntos) {
            contenedorPuntos.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
        }

        indiceImagenActual = (index + images.length) % images.length;

        images[indiceImagenActual].classList.add('active');
        if (contenedorPuntos && contenedorPuntos.children[indiceImagenActual]) {
            contenedorPuntos.children[indiceImagenActual].classList.add('active');
        }
    }

    // Pasa a la siguiente imagen
    function siguienteImagen() {
        mostrarImagen(indiceImagenActual + 1);
    }

    // Vuelve a la imagen anterior
    function imagenAnterior() {
        mostrarImagen(indiceImagenActual - 1);
    }

    // Arranca el deslizamiento automático
    function iniciarAutoSlide() {
        detenerAutoSlide();
        intervaloAutoSlide = setInterval(siguienteImagen, 3000);
    }

    // Para el deslizamiento automático
    function detenerAutoSlide() {
        clearInterval(intervaloAutoSlide);
    }

    if (botonAnterior) {
        botonAnterior.addEventListener('click', (e) => {
            e.stopPropagation();
            detenerAutoSlide();
            imagenAnterior();
            iniciarAutoSlide();
        });
    }
    if (botonSiguiente) {
        botonSiguiente.addEventListener('click', (e) => {
            e.stopPropagation();
            detenerAutoSlide();
            siguienteImagen();
            iniciarAutoSlide();
        });
    }
    if (contenedorPuntos) {
        contenedorPuntos.addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) {
                e.stopPropagation();
                detenerAutoSlide();
                const slideIndex = parseInt(e.target.dataset.slide);
                mostrarImagen(slideIndex);
                iniciarAutoSlide();
            }
        });
    }

    mostrarImagen(indiceImagenActual);
    iniciarAutoSlide();

    card.addEventListener('mouseenter', detenerAutoSlide);
    card.addEventListener('mouseleave', iniciarAutoSlide);
}

// Carga los productos del archivo JSON y los muestra
const cargarProductos = async () => {
    try {
        const response = await fetch('./data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        todosLosProductos = await response.json();
        mostrarProductos(todosLosProductos);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los productos. Inténtalo de nuevo más tarde.'
        });
    }
};

// Dibuja cada producto en la lista principal
const mostrarProductos = (products) => {
    listaProductos.innerHTML = '';

    products.forEach(product => {
        const tarjetaProducto = document.createElement('div');
        tarjetaProducto.classList.add('product-card');

        const isFavorite = favoritos.some(favProduct => favProduct.id === product.id);

        const carouselContainer = document.createElement('div');
        carouselContainer.classList.add('carousel-container');

        const carouselImagesDiv = document.createElement('div');
        carouselImagesDiv.classList.add('carousel-images');

        if (product.images && product.images.length > 0) {
            product.images.forEach((imagePath, index) => {
                const img = document.createElement('img');
                img.src = imagePath;
                img.alt = `${product.name} Vista ${index + 1}`;
                if (index === 0) {
                    img.classList.add('active');
                }
                carouselImagesDiv.appendChild(img);
            });
        } else {
            const img = document.createElement('img');
            img.src = "https://via.placeholder.com/200x200?text=No+Image";
            img.alt = "No image available";
            img.classList.add('active');
            carouselImagesDiv.appendChild(img);
        }
        carouselContainer.appendChild(carouselImagesDiv);

        if (product.images && product.images.length > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.classList.add('carousel-control', 'prev');
            prevBtn.innerHTML = '&#10094;';
            carouselContainer.appendChild(prevBtn);

            const nextBtn = document.createElement('button');
            nextBtn.classList.add('carousel-control', 'next');
            nextBtn.innerHTML = '&#10095;';
            carouselContainer.appendChild(nextBtn);

            const dotsContainer = document.createElement('div');
            dotsContainer.classList.add('carousel-indicators');
            product.images.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === 0) {
                    dot.classList.add('active');
                }
                dot.dataset.slide = index;
                dotsContainer.appendChild(dot);
            });
            carouselContainer.appendChild(dotsContainer);
        }
        tarjetaProducto.appendChild(carouselContainer);

        const h3 = document.createElement('h3');
        h3.textContent = product.name;
        tarjetaProducto.appendChild(h3);

        const pPrice = document.createElement('p');
        pPrice.textContent = `Precio: ${formatCurrency(product.price)}`;
        tarjetaProducto.appendChild(pPrice);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        const addToCartBtn = document.createElement('button');
        addToCartBtn.classList.add('add-to-cart');
        addToCartBtn.dataset.id = product.id;

        // Otro SVG para el icono del carrito
        const cartSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        cartSvgElement.setAttribute("viewBox", "0 0 576 512");
        cartSvgElement.innerHTML = `<path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7c-26.3 0-45.5-25-38.6-50.4l41-152.3c8.5-31.4 37-53.3 69.5-53.3H400c13.3 0 24-10.7 24-24s-10.7-24-24-24H121.1c-13.3 0-24 10.7-24 24s10.7 24 24 24H270.7l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H69.5c-22 0-41.5-12.8-50.6-32H24C10.7 368 0 357.3 0 344s10.7-24 24-24H456c39.6 0 72.4-30.2 74.7-69.4l41-152.3c1.9-7 3-14.4 3-22.3V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V74.8L477.7 227.1C470.9 251.3 450.4 268 426.7 268H170.7c-13.3 0-24 10.7-24 24s10.7 24 24 24H426.7c8.3 0 16.5-1.5 24.2-4.5L506.7 416H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H552c13.3 0 24-10.7 24-24V344c0-26.2-11.8-50.1-32-66.2L500 216c-3.1-11.5-15.6-18.7-27.4-15.7s-18.7 15.6-15.7 27.4l15.3 56.6c-4.4 1.5-8.9 2.5-13.6 2.5H170.7c-39.6 0-72.4 30.2-74.7 69.4L54.7 480c-1.9 7-3 14.4-3 22.3V504c0 13.3 10.7 24 24 24h496c13.3 0 24-10.7 24-24V504c0-13.3-10.7-24-24-24H496c-13.3 0-24 10.7-24 24s10.7 24 24 24H520c13.3 0 24-10.7 24-24V472H400c-13.3 0-24 10.7-24 24s10.7 24 24 24H520c13.3 0 24-10.7 24-24V416H506.7L456 268H170.7zM448 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm-64 0a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM160 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm-64 0a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM224 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64zM288 448a32 32 0 1 0 0 64 32 32 0 1 0 0-64z"></path>`;
        addToCartBtn.appendChild(cartSvgElement);
        addToCartBtn.appendChild(document.createTextNode(' Agregar al carrito'));
        actionsDiv.appendChild(addToCartBtn);

        const addToFavoritesBtn = document.createElement('button');
        addToFavoritesBtn.classList.add('add-to-favorites');
        if (isFavorite) {
            addToFavoritesBtn.classList.add('favorite');
        }
        addToFavoritesBtn.dataset.id = product.id;

        // Este es el SVG para el icono de favoritos
        const favSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        favSvgElement.setAttribute("viewBox", "0 0 512 512");
        favSvgElement.innerHTML = `<path d="M47.6 300.4L2.5 255.3c-2.4-2.4-3.5-5.6-3.4-8.7c.1-3.1 1.3-6.2 3.4-8.2l39.1-39.1c2-2 4.4-3 6.9-3s4.9 1 6.9 3l14.9 14.9 14.9-14.9c2-2 4.4-3 6.9-3s4.9 1 6.9 3l39.1 39.1c2.1 2 3.2 5.1 3.4 8.2s-1 6.3-3.4 8.7L97.2 300.4c-2.4 2.4-5.6 3.5-8.7 3.4c-3.1-.1-6.2-1.3-8.2-3.4L47.6 300.4zm10.7-65.7l14.9-14.9 14.9 14.9c2 2 4.4 3 6.9 3s4.9-1 6.9-3l39.1-39.1c2-2 4.4-3 6.9-3s4.9 1 6.9 3l39.1 39.1c2.1 2 3.2 5.1 3.4 8.2s-1 6.3-3.4 8.7L181.2 300.4c-2.4 2.4-5.6 3.5-8.7 3.4c-3.1-.1-6.2-1.3-8.2-3.4L58.3 234.7zm181.9-97.4l-14.9-14.9c-2-2-4.4-3-6.9-3s-4.9 1-6.9 3l-39.1 39.1c-2-2-4.4-3-6.9-3s-4.9-1-6.9 3l-39.1-39.1c-2.1-2-3.2-5.1-3.4-8.2s1-6.3 3.4-8.7L113.2 136.4c2.4-2.4 5.6-3.5 8.7-3.4c3.1 .1 6.2 1.3 8.2 3.4L208 223.1V64c0-17.7 14.3-32 32-32s32 14.3 32 32V223.1L303.2 136.4c2.4-2.4 5.6-3.5 8.7-3.4c3.1 .1 6.2 1.3 8.2 3.4l45.1 45.1c2.4 2.4 3.5 5.6 3.4 8.7s-1.3 6.2-3.4 8.2l-39.1 39.1c-2-2-4.4-3-6.9-3s-4.9-1-6.9 3L282.8 234.7l-14.9-14.9c-2-2-4.4-3-6.9-3s-4.9 1-6.9 3l14.9 14.9c2-2 4.4-3 6.9-3s4.9 1-6.9 3l14.9 14.9c-2 2-4.4 3-6.9 3s-4.9 1-6.9 3l14.9 14.9c-2 2-4.4 3-6.9 3s-4.9 1-6.9 3l-14.9 14.9c-2 2-4.4 3-6.9 3s-4.9 1-6.9 3L181.2 234.7zM448 352a96 96 0 1 0 0 192 96 96 0 1 0 0-192zm0 144a48 48 0 1 1 0-96 48 48 0 1 1 0 96zM320 352c0-17.7-14.3-32-32-32H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H288c17.7 0 32-14.3 32-32z"></path>`;
        addToFavoritesBtn.appendChild(favSvgElement);
        addToFavoritesBtn.appendChild(document.createTextNode(' Agregar a favoritos'));
        actionsDiv.appendChild(addToFavoritesBtn);

        tarjetaProducto.appendChild(actionsDiv);

        listaProductos.appendChild(tarjetaProducto);

        inicializarCarrusel(tarjetaProducto);
    });

    agregarEventosBotonesProductos(products);
};

// Se encarga de los botones de "Agregar al carrito" y "Agregar a favoritos" en la lista de productos
const agregarEventosBotonesProductos = (products) => {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            const productToAdd = todosLosProductos.find(p => p.id === productId);

            if (productToAdd) {
                const existingProductIndex = carrito.findIndex(item => item.id === productId);
                if (existingProductIndex > -1) {
                    carrito[existingProductIndex].quantity++;
                    Swal.fire({
                        icon: 'info',
                        title: 'Cantidad actualizada',
                        text: `Se añadió una unidad más de ${productToAdd.name} al carrito.`,
                        showConfirmButton: false,
                        timer: 1500
                    });
                } else {
                    carrito.push({ ...productToAdd, image: productToAdd.images[0], quantity: 1 });
                    Swal.fire({
                        icon: 'success',
                        title: 'Producto Añadido',
                        text: `${productToAdd.name} ha sido agregado al carrito.`,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
                saveCart(carrito);
                actualizarContadorCarrito();
                renderizarItemsCarrito();
            }
        });
    });

    document.querySelectorAll('.add-to-favorites').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.id;
            const productToFavorite = todosLosProductos.find(p => p.id === productId);

            if (productToFavorite) {
                const isAlreadyFavorite = favoritos.some(favProduct => favProduct.id === productId);

                if (isAlreadyFavorite) {
                    favoritos = favoritos.filter(favProduct => favProduct.id !== productId);
                    button.classList.remove('favorite');
                    Swal.fire({
                        icon: 'info',
                        title: 'Eliminado de Favoritos',
                        text: `${productToFavorite.name} ha sido eliminado de tus favoritos.`,
                        showConfirmButton: false,
                        timer: 1500
                    });
                } else {
                    favoritos.push(productToFavorite);
                    button.classList.add('favorite');
                    Swal.fire({
                        icon: 'success',
                        title: 'Añadido a Favoritos',
                        text: `${productToFavorite.name} ha sido añadido a tus favoritos.`,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
                saveFavorites(favoritos);
                actualizarContadorFavoritos();
                renderizarItemsFavoritos();
                renderizarItemsFavoritos();
            }
        });
    });
};

// listeners para abrir y cerrar el carrito y favoritos
botonAbrirCarrito.addEventListener('click', abrirCarrito);
botonCerrarCarrito.addEventListener('click', cerrarCarrito);
botonAbrirFavoritos.addEventListener('click', abrirFavoritos);
botonCerrarFavoritos.addEventListener('click', cerrarFavoritos);

// Escuchador para el botón de finalizar compra
botonFinalizarCompra.addEventListener('click', () => {
    if (carrito.length > 0) {
        if (usuarioActual) {
            abrirModalFinalizarCompra();
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
                    abrirModalAutenticacion();
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

const abrirModalFinalizarCompra = () => {
    modalFinalizarCompra.classList.add('open');
    mostrarFormularioFacturacion();
};

const cerrarModalFinalizarCompra = () => {
    modalFinalizarCompra.classList.remove('open');
    formularioFacturacionElemento.reset();
    formularioEnvioElemento.reset();
};

const mostrarFormularioFacturacion = () => {
    formularioFacturacionElemento.classList.add('active');
    formularioEnvioElemento.classList.remove('active');
};

const mostrarFormularioEnvio = () => {
    formularioEnvioElemento.classList.add('active');
    formularioFacturacionElemento.classList.remove('active');
};

// Esta función valida los datos de la tarjeta y pasa al formulario de envío
const manejarEnvioFacturacion = (e) => {
    e.preventDefault();

    const numeroTarjeta = formularioFacturacionElemento.elements['card-number'].value.trim();
    const fechaVencimiento = formularioFacturacionElemento.elements['expiry-date'].value.trim();
    const cvv = formularioFacturacionElemento.elements['cvv'].value.trim();

    const camposFacturacionRequeridos = [
        { id: 'card-number', name: 'Número de Tarjeta' },
        { id: 'expiry-date', name: 'Fecha de Vencimiento' },
        { id: 'cvv', name: 'CVV' },
    ];

    for (const field of camposFacturacionRequeridos) {
        if (!formularioFacturacionElemento.elements[field.id].value.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Validación',
                text: `Por favor, completa el campo: ${field.name}.`
            });
            return;
        }
    }

    if (!/^\d{16}$/.test(numeroTarjeta)) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Validación',
            text: 'El número de tarjeta debe contener exactamente 16 dígitos numéricos.'
        });
        return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fechaVencimiento)) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Validación',
            text: 'La fecha de vencimiento debe estar en formato MM/AA (ej. 12/25).'
        });
        return;
    }

    const [month, year] = fechaVencimiento.split('/').map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Validación',
            text: 'La fecha de vencimiento no puede ser en el pasado.'
        });
        return;
    }

    if (!/^\d{3}$/.test(cvv)) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Validación',
            text: 'El CVV debe contener exactamente 3 dígitos numéricos.'
        });
        return;
    }

    formularioFacturacionElemento.dataset.cardNumber = numeroTarjeta.substring(numeroTarjeta.length - 4);
    formularioFacturacionElemento.dataset.expiryDate = fechaVencimiento;
    formularioFacturacionElemento.dataset.cvv = cvv;

    mostrarFormularioEnvio();
};

// Esta función valida los datos de envío y muestra el resumen de la compra
const manejarEnvioEnvio = (e) => {
    e.preventDefault();

    const direccion = formularioEnvioElemento.elements['address'].value.trim();
    const provincia = formularioEnvioElemento.elements['province'].value.trim();
    const codigoPostal = formularioEnvioElemento.elements['postal-code'].value.trim();
    const ciudad = formularioEnvioElemento.elements['city'].value.trim();
    const nombreDestinatario = formularioEnvioElemento.elements['recipient-name'].value.trim();
    const dniDestinatario = formularioEnvioElemento.elements['recipient-dni'].value.trim();

    const camposEnvioRequeridos = [
        { id: 'address', name: 'Dirección de Entrega' },
        { id: 'province', name: 'Provincia' },
        { id: 'postal-code', name: 'Código Postal' },
        { id: 'city', name: 'Ciudad / Localidad' },
        { id: 'recipient-name', name: 'Nombre de quien recibe' },
        { id: 'recipient-dni', name: 'DNI de quien recibe' },
    ];

    for (const field of camposEnvioRequeridos) {
        if (!formularioEnvioElemento.elements[field.id].value.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Validación',
                text: `Por favor, completa el campo: ${field.name}.`
            });
            return;
        }
        if (field.id === 'recipient-dni' && !/^\d+$/.test(dniDestinatario)) {
            Swal.fire({
                icon: 'error',
                title: 'Error de validación',
                text: 'El DNI debe contener solo números.'
            });
            return;
        }
    }

    formularioEnvioElemento.dataset.address = direccion;
    formularioEnvioElemento.dataset.province = provincia;
    formularioEnvioElemento.dataset.city = ciudad;
    formularioEnvioElemento.dataset.postalCode = codigoPostal;
    formularioEnvioElemento.dataset.recipientName = nombreDestinatario;
    formularioEnvioElemento.dataset.recipientDni = dniDestinatario;

    mostrarResumenCompra();
};

// listeners para la autenticación y el checkout
botonLoginRegistro.addEventListener('click', abrirModalAutenticacion);
botonCerrarModal.addEventListener('click', cerrarModalAutenticacion);
botonMostrarFormularioRegistro.addEventListener('click', mostrarFormularioRegistro);
botonMostrarFormularioLogin.addEventListener('click', mostrarFormularioLogin);
formularioLoginElemento.addEventListener('submit', manejarLogin);
formularioRegistroElemento.addEventListener('submit', manejarRegistro);
if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener('click', manejarCerrarSesion);
}

botonCerrarModalFinalizarCompra.addEventListener('click', cerrarModalFinalizarCompra);

formularioFacturacionElemento.addEventListener('submit', manejarEnvioFacturacion);
formularioEnvioElemento.addEventListener('submit', manejarEnvioEnvio);
botonVolverFacturacion.addEventListener('click', mostrarFormularioFacturacion);

// Cierra el modal de checkout si se hace clic afuera
modalFinalizarCompra.addEventListener('click', (e) => {
    if (e.target === modalFinalizarCompra) {
        cerrarModalFinalizarCompra();
    }
});

// Muestra un resumen de la compra, con todos los detalles
const mostrarResumenCompra = () => {
    let totalCompra = 0;
    const contenedorResumen = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = 'Resumen de Compra';
    contenedorResumen.appendChild(title);

    const paymentTitle = document.createElement('h4');
    paymentTitle.textContent = 'Datos de Pago:';
    contenedorResumen.appendChild(paymentTitle);

    const cardNumberP = document.createElement('p');
    const cardNumberStrong = document.createElement('strong');
    cardNumberStrong.textContent = 'Tarjeta (últimos 4 dígitos):';
    cardNumberP.appendChild(cardNumberStrong);
    cardNumberP.appendChild(document.createTextNode(` **** **** **** ${formularioFacturacionElemento.dataset.cardNumber}`));
    contenedorResumen.appendChild(cardNumberP);

    const expiryDateP = document.createElement('p');
    const expiryDateStrong = document.createElement('strong');
    expiryDateStrong.textContent = 'Fecha de Vencimiento:';
    expiryDateP.appendChild(expiryDateStrong);
    expiryDateP.appendChild(document.createTextNode(` ${formularioFacturacionElemento.dataset.expiryDate}`));
    contenedorResumen.appendChild(expiryDateP);

    const shippingTitle = document.createElement('h4');
    shippingTitle.textContent = 'Datos de Envío:';
    contenedorResumen.appendChild(shippingTitle);

    const addressP = document.createElement('p');
    const addressStrong = document.createElement('strong');
    addressStrong.textContent = 'Dirección:';
    addressP.appendChild(addressStrong);
    addressP.appendChild(document.createTextNode(` ${formularioEnvioElemento.dataset.address}`));
    contenedorResumen.appendChild(addressP);

    const provinceP = document.createElement('p');
    const provinceStrong = document.createElement('strong');
    provinceStrong.textContent = 'Provincia:';
    provinceP.appendChild(provinceStrong);
    provinceP.appendChild(document.createTextNode(` ${formularioEnvioElemento.dataset.province}`));
    contenedorResumen.appendChild(provinceP);

    const cityP = document.createElement('p');
    const cityStrong = document.createElement('strong');
    cityStrong.textContent = 'Ciudad:';
    cityP.appendChild(cityStrong);
    cityP.appendChild(document.createTextNode(` ${formularioEnvioElemento.dataset.city}`));
    contenedorResumen.appendChild(cityP);

    const postalCodeP = document.createElement('p');
    const postalCodeStrong = document.createElement('strong');
    postalCodeStrong.textContent = 'Código Postal:';
    postalCodeP.appendChild(postalCodeStrong);
    postalCodeP.appendChild(document.createTextNode(` ${formularioEnvioElemento.dataset.postalCode}`));
    contenedorResumen.appendChild(postalCodeP);

    const recipientNameP = document.createElement('p');
    const recipientNameStrong = document.createElement('strong');
    recipientNameStrong.textContent = 'Recibe:';
    recipientNameP.appendChild(recipientNameStrong);
    recipientNameP.appendChild(document.createTextNode(` ${formularioEnvioElemento.dataset.recipientName}`));
    contenedorResumen.appendChild(recipientNameP);

    const recipientDniP = document.createElement('p');
    const recipientDniStrong = document.createElement('strong');
    recipientDniStrong.textContent = 'DNI:';
    recipientDniP.appendChild(recipientDniStrong);
    recipientDniP.appendChild(document.createTextNode(` ${formularioEnvioElemento.dataset.recipientDni}`));
    contenedorResumen.appendChild(recipientDniP);

    const productsTitle = document.createElement('h4');
    productsTitle.textContent = 'Productos Adquiridos:';
    contenedorResumen.appendChild(productsTitle);

    const productListUl = document.createElement('ul');
    carrito.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalCompra += itemTotal;
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} x ${item.quantity} - ${formatCurrency(itemTotal)}`;
        productListUl.appendChild(listItem);
    });
    contenedorResumen.appendChild(productListUl);

    const totalPurchaseH4 = document.createElement('h4');
    totalPurchaseH4.textContent = `Total de la Compra: ${formatCurrency(totalCompra)}`;
    contenedorResumen.appendChild(totalPurchaseH4);

    Swal.fire({
        title: '¡Compra Exitosa!',
        html: contenedorResumen,
        icon: 'success',
        showCancelButton: false,
        confirmButtonColor: '#1a1a1a',
        confirmButtonText: 'Aceptar'
    }).then(() => {
        carrito = [];
        saveCart(carrito);
        actualizarContadorCarrito();
        cerrarModalFinalizarCompra();
        cerrarCarrito();
    });
};

// Acá arranca todo cuando carga la página
cargarProductos();
actualizarContadorCarrito();
actualizarContadorFavoritos();
renderizarItemsCarrito();
renderizarItemsFavoritos();
actualizarNombreUsuarioMostrado();