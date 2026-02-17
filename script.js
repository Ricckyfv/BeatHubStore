
// --- CONFIGURACIÓN DE SLIDERS (Swiper) ---
const swiperConfig = {
    loop: true,
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
};

new Swiper(".mySwiper-1", {
    ...swiperConfig,
    slidesPerView: 1,
    spaceBetween: 30,
    pagination: { el: ".swiper-pagination", clickable: true },
});

new Swiper(".mySwiper-2", {
    ...swiperConfig,
    slidesPerView: 3,
    spaceBetween: 30,
    breakpoints: {
        0: { slidesPerView: 1 },
        520: { slidesPerView: 2 },
        950: { slidesPerView: 3 }
    }
});

// --- VARIABLES Y SELECTORES ---
let articulosCarrito = [];
const stripe = Stripe('pk_test_51SWjkCCGPzWUA8TXKGenZGUlEY8bWKQaZnXeub3I7jwXFioRpeNZCc3f0DrAFaGQTvhdXjuNlhf6FiFgs0KTSHz400bnxkbivV');

const carrito = document.getElementById('carrito'),
      lista = document.querySelector('#lista-carrito tbody'),
      vaciarCarritoBtn = document.getElementById('vaciar-carrito'),
      contadorCarrito = document.getElementById('contador-carrito'),
      totalCarrito = document.getElementById('total-carrito'),
      procederPagoBtn = document.getElementById('proceder-pago'),
      seccionesProductos = ['#lista-1', '#lista-2', '#lista-3'];

// --- EVENT LISTENERS ---
cargarEventListeners();

function cargarEventListeners() {
    // Delegación de eventos para añadir productos
    seccionesProductos.forEach(id => {
        const seccion = document.querySelector(id);
        if(seccion) seccion.addEventListener('click', comprarElemento);
    });

    carrito.addEventListener('click', e => {
        if(e.target.classList.contains('borrar')) eliminarElemento(e);
        if(e.target.classList.contains('btn-cantidad')) modificarCantidad(e);
    });

    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    procederPagoBtn.addEventListener('click', manejarPago);
    
    document.addEventListener('DOMContentLoaded', () => {
        cargarCarritoDesdeStorage();
        verificarEstadoPago();
    });
}

// --- FUNCIONES DE NAVEGACIÓN Y PAGO ---
async function manejarPago(e) {
    e.preventDefault();
    const items = obtenerDatosDelCarritoParaStripe();

    if (items.length === 0) return alert("El carrito está vacío.");

    try {
        const response = await fetch('https://beathub-back.onrender.com/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
        });
        const session = await response.json();
        await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al conectar con la pasarela de pago.');
    }
}

function obtenerDatosDelCarritoParaStripe() {
    return articulosCarrito.map(p => ({
        id: p.id,
        name: p.titulo,
        amount: Math.round(parseFloat(p.precio.replace('$', '')) * 100),
        currency: 'usd',
        quantity: p.cantidad,
    }));
}

function verificarEstadoPago() {
    const params = new URLSearchParams(window.location.search);
    const estado = params.get('pago');

    if (estado === 'exitoso') {
        alert('¡Pago realizado con éxito!');
        vaciarCarrito();
    } else if (estado === 'cancelado') {
        dibujarCarritoHTML();
        alert('El pago fue cancelado.');
    }

    if (estado) window.history.replaceState(null, null, window.location.pathname);
}

// --- LÓGICA DEL CARRITO ---
function comprarElemento(e) {
    e.preventDefault();
    if (e.target.classList.contains('agregar-carrito')) {
        const card = e.target.closest('.product-content') || e.target.parentElement.parentElement;
        leerDatosElemento(card);
    }
}

function leerDatosElemento(elemento) {
    const info = {
        imagen: elemento.querySelector('img').src,
        titulo: elemento.querySelector('h3').textContent,
        precio: (elemento.querySelector('.price-2') || elemento.querySelector('.precio')).textContent,
        id: elemento.querySelector('a').getAttribute('data-id'),
        cantidad: 1
    };

    const existe = articulosCarrito.find(p => p.id === info.id);
    if (existe) {
        existe.cantidad++;
    } else {
        articulosCarrito.push(info);
    }
    dibujarCarritoHTML();
    mostrarToast(info.titulo);
}

function dibujarCarritoHTML() {
    limpiarHTML();

    articulosCarrito.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${p.imagen}" width="50"></td>
            <td>${p.titulo}</td>
            <td>${p.precio}</td>
            <td>
                <div class="cantidad-controles" style="display:flex; align-items:center; gap:8px">
                    <button class="btn-cantidad minus" data-id="${p.id}">-</button>
                    <span>${p.cantidad}</span>
                    <button class="btn-cantidad plus" data-id="${p.id}">+</button>
                </div>
            </td>
            <td><a href="#" class="borrar" data-id="${p.id}">X</a></td>
        `;
        lista.appendChild(row);
    });

    sincronizarStorage();
    actualizarInterfaz();
}

function modificarCantidad(e) {
    const id = e.target.dataset.id;
    const producto = articulosCarrito.find(p => p.id === id);
    
    if (e.target.classList.contains('plus')) producto.cantidad++;
    else if (producto.cantidad > 1) producto.cantidad--;
    
    dibujarCarritoHTML();
}

function eliminarElemento(e) {
    e.preventDefault();
    const id = e.target.dataset.id;
    articulosCarrito = articulosCarrito.filter(p => p.id !== id);
    dibujarCarritoHTML();
}

function vaciarCarrito() {
    articulosCarrito = [];
    localStorage.removeItem('carrito');
    dibujarCarritoHTML();
}

// --- UTILIDADES ---
function actualizarInterfaz() {
    // Contador
    const totalItems = articulosCarrito.reduce((acc, p) => acc + p.cantidad, 0);
    contadorCarrito.textContent = totalItems;
    contadorCarrito.style.display = totalItems > 0 ? 'block' : 'none';

    // Total
    const total = articulosCarrito.reduce((acc, p) => acc + (parseFloat(p.precio.replace('$', '')) * p.cantidad), 0);
    totalCarrito.innerHTML = total > 0 ? `Total: $${total.toFixed(2)}` : '';
}

function sincronizarStorage() {
    localStorage.setItem('carrito', JSON.stringify(articulosCarrito));
}

function cargarCarritoDesdeStorage() {
    const storage = localStorage.getItem('carrito');
    if (storage) {
        try {
            articulosCarrito = JSON.parse(storage);
            dibujarCarritoHTML();
        } catch (e) {
            articulosCarrito = [];
        }
    }
}

function limpiarHTML() {
    while (lista.firstChild) lista.removeChild(lista.firstChild);
}

function mostrarToast(nombre) {
    const toast = document.getElementById('toast');
    toast.textContent = `¡${nombre} añadido!`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}