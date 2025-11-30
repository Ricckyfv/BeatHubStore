// --- Inicialización de Swiper (Sliders) ---

// Slider del Header
let swiper1 = new Swiper(".mySwiper-1", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});

// Slider de Productos
let swiper2 = new Swiper(".mySwiper-2", {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    breakpoints: {
        0: {
            slidesPerView: 1,
        },
        520: {
            slidesPerView: 2,
        },
        950: {
            slidesPerView: 3,
        }
    }
});


const carrito = document.getElementById('carrito');
const elementos1 = document.getElementById('lista-1'); // Sección Promociones
const elementos2 = document.getElementById('lista-2'); // Sección Nuevos Productos
const elementos3 = document.getElementById('lista-3'); // Sección Productos
const lista = document.querySelector('#lista-carrito tbody'); 
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const totalCarrito = document.getElementById('total-carrito');
const procederPagoBtn = document.getElementById('proceder-pago');

const stripe = Stripe('pk_test_51SWjkCCGPzWUA8TXKGenZGUlEY8bWKQaZnXeub3I7jwXFioRpeNZCc3f0DrAFaGQTvhdXjuNlhf6FiFgs0KTSHz400bnxkbivV');

cargarEventListeners();

function cargarEventListeners() {

    elementos1.addEventListener('click', comprarElemento);
    elementos2.addEventListener('click', comprarElemento);
    elementos3.addEventListener('click', comprarElemento);


    carrito.addEventListener('click', eliminarElemento);


    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);


    document.addEventListener('DOMContentLoaded', cargarCarritoDesdeStorage);


    procederPagoBtn.addEventListener('click', manejarPago);
}

function manejarPago(e) {
    e.preventDefault();

    const productosParaPago = obtenerDatosDelCarritoParaStripe(); 

    if (productosParaPago.length === 0) {
        alert("El carrito está vacío. Añade productos para pagar.");
        return;
    }
    
    fetch('https://beathub-back.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: productosParaPago }),
    })
    .then(response => response.json())
    .then(session => {
        return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(result => {
        
        if (result.error) {
            alert(result.error.message);
        }
    })
    .catch(error => {
        console.error('Error al iniciar el pago:', error);
        alert('Hubo un error al intentar iniciar la pasarela de pago.');
    });
}

function obtenerDatosDelCarritoParaStripe() {

    const filas = document.querySelectorAll('#lista-carrito tbody tr');
    const items = [];

    filas.forEach(fila => {
       
        const id = fila.getAttribute('data-product-id');
        
        if (!id) {
            console.error('Fila de carrito sin ID de producto. Skipped.');
            return; 
        }

        const titulo = fila.children[1].textContent;
        const precioTexto = fila.children[2].textContent;
        const precioCentavos = Math.round(parseFloat(precioTexto.replace('$', '')) * 100);

        items.push({
            id: id,
            name: titulo,
            amount: precioCentavos, 
            currency: 'usd', 
            quantity: 1, 
        });
    });

    return items;
}

function actualizarContador() {
    const totalItems = lista.children.length; 
    contadorCarrito.textContent = totalItems;

    if (totalItems > 0) {
        contadorCarrito.style.display = 'block'; 
    } else {
        contadorCarrito.style.display = 'none'; 
    }
}

function calcularTotal() {
    let total = 0;
    
    const filasCarrito = document.querySelectorAll('#lista-carrito tbody tr');

    filasCarrito.forEach(function(fila) {
        const precioTexto = fila.children[2].textContent; 
        
        const precio = parseFloat(precioTexto.replace('$', ''));
        
        total += precio;
    });

    const totalFormateado = `$${total.toFixed(2)}`;
    
    totalCarrito.innerHTML = `Total: ${totalFormateado}`;
    
    if (total === 0) {
        totalCarrito.innerHTML = '';
    }
}

function cargarCarritoDesdeStorage() {
    const carritoGuardado = localStorage.getItem('carrito');

    if (carritoGuardado) {

        document.querySelector('#lista-carrito tbody').innerHTML = carritoGuardado;
        
        actualizarContador(); 

        calcularTotal();
    }
}

function sincronizarStorage() {

    const contenidoCarrito = document.querySelector('#lista-carrito tbody').innerHTML;
    
    localStorage.setItem('carrito', contenidoCarrito);

}

function comprarElemento(e) {
    e.preventDefault();

    if(e.target.classList.contains('agregar-carrito')) {
        const elemento = e.target.parentElement.parentElement;
        leerDatosElemento(elemento);
    }
}

function leerDatosElemento(elemento) {
    const infoElemento = {
        imagen: elemento.querySelector('img').src,
        titulo: elemento.querySelector('h3').textContent,
        precio: elemento.querySelector('.price-2') ? elemento.querySelector('.price-2').textContent : elemento.querySelector('.precio').textContent,
        id: elemento.querySelector('a').getAttribute('data-id')
    }
    insertarCarrito(infoElemento);
}

function insertarCarrito(elemento) {
    const row = document.createElement('tr');

    row.setAttribute('data-product-id', elemento.id);

    row.innerHTML = `
        <td>
            <img src="${elemento.imagen}" width=100>
        </td>
        <td>
            ${elemento.titulo}
        </td>
        <td>
            ${elemento.precio}
        </td>
        <td>
            <a href="#" class="borrar" data-id="${elemento.id}">X</a>
        </td>
    `;
    lista.appendChild(row);

    actualizarContador();

    sincronizarStorage();

    calcularTotal();
}

function eliminarElemento(e) {
    e.preventDefault();
    let elemento, elementoId;
    
    if(e.target.classList.contains('borrar')) {
        e.target.parentElement.parentElement.remove();
        elemento = e.target.parentElement.parentElement;
        elementoId = elemento.querySelector('a').getAttribute('data-id');

        actualizarContador();

        sincronizarStorage();

        calcularTotal();
    }
}

function vaciarCarrito() {
    while(lista.firstChild) {
        lista.removeChild(lista.firstChild);
    }
    
    actualizarContador();

    sincronizarStorage();

    calcularTotal();

    return false;
}

function verificarEstadoPago() {
    const urlParams = new URLSearchParams(window.location.search);
    const estadoPago = urlParams.get('pago');

    if (estadoPago === 'exitoso') {
        alert('¡Pago realizado con éxito! Gracias por tu compra.');
        vaciarCarrito();
    } else if (estadoPago === 'cancelado') {
        alert('El pago fue cancelado. Puedes intentar nuevamente.');
    }

    if(estadoPago) {
        window.history.replaceState(null, null, window.location.pathname);
    }
}