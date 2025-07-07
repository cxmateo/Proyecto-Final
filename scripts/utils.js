// utilidades

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const saveCart = (cart) => {
    localStorage.setItem('ecommerceCart', JSON.stringify(cart));
};

export const saveFavorites = (favorites) => {
    localStorage.setItem('ecommerceFavorites', JSON.stringify(favorites));
};

export const saveUsers = (users) => {
    localStorage.setItem('ecommerceUsers', JSON.stringify(users));
};

export const saveCurrentUser = (currentUser) => {
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
};