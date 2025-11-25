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
const elementos2 = document.getElementById('lista-2'); // Sección Productos
const lista = document.querySelector('#lista-carrito tbody');
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
// 💡 NUEVA REFERENCIA
const contadorCarrito = document.getElementById('contador-carrito');
// 💡 NUEVA REFERENCIA
const totalCarrito = document.getElementById('total-carrito');
// 💡 NUEVA REFERENCIA
const procederPagoBtn = document.getElementById('proceder-pago');

// ⚠️ REEMPLAZA 'TU_CLAVE_PUBLICA_DE_STRIPE' CON TU CLAVE REAL DE PRUEBA
// Esta clave comienza con 'pk_test_...'
const stripe = Stripe('pk_test_51SWjkCCGPzWUA8TXKGenZGUlEY8bWKQaZnXeub3I7jwXFioRpeNZCc3f0DrAFaGQTvhdXjuNlhf6FiFgs0KTSHz400bnxkbivV');

cargarEventListeners();

function cargarEventListeners() {
    // Dispara cuando se presiona "Agregar Carrito" en las secciones
    elementos1.addEventListener('click', comprarElemento);
    elementos2.addEventListener('click', comprarElemento);

    // Cuando se elimina un curso del carrito
    carrito.addEventListener('click', eliminarElemento);

    // Al vaciar el carrito
    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);

    // 💡 PASO 3: Cargar los productos de localStorage al cargar la página
    document.addEventListener('DOMContentLoaded', cargarCarritoDesdeStorage);

    // 💡 NUEVO LISTENER PARA EL PAGO
    procederPagoBtn.addEventListener('click', manejarPago);
}

function manejarPago(e) {
    e.preventDefault();

    // 1. Recopilar los productos del carrito (necesitas una función para esto)
    const productosParaPago = obtenerDatosDelCarritoParaStripe(); 

    if (productosParaPago.length === 0) {
        alert("El carrito está vacío. Añade productos para pagar.");
        return;
    }
    
    //http://localhost:4242/create-checkout-session
    // ⚠️ ATENCIÓN: Esta parte requiere un backend real (servidor)
    fetch('https://beathub-back.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: productosParaPago }),
    })
    .then(response => response.json())
    .then(session => {
        // 2. Usar el ID de la sesión para redirigir a Stripe Checkout
        return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(result => {
        // Manejar errores de redirección
        if (result.error) {
            alert(result.error.message);
        }
    })
    .catch(error => {
        console.error('Error al iniciar el pago:', error);
        alert('Hubo un error al intentar iniciar la pasarela de pago.');
    });
}

// ⚠️ ESTA FUNCIÓN DEBE SER CREADA POR TI PARA EXTRAER LOS DATOS DEL CARRITO
// Y CONSTRUIR UN ARRAY DE OBJETOS QUE STRIPE PUEDA ENTENDER.
function obtenerDatosDelCarritoParaStripe() {
    // Implementación mínima:
    const filas = document.querySelectorAll('#lista-carrito tbody tr');
    const items = [];

    filas.forEach(fila => {
        // 💡 1. EXTRAER EL ID DEL ATRIBUTO 'data-product-id' DE LA FILA
        const id = fila.getAttribute('data-product-id');
        
        // Si por alguna razón la fila no tiene ID, saltamos (esto no debería pasar con productos nuevos)
        if (!id) {
            console.error('Fila de carrito sin ID de producto. Skipped.');
            return; 
        }

        const titulo = fila.children[1].textContent;
        const precioTexto = fila.children[2].textContent;
        const precioCentavos = Math.round(parseFloat(precioTexto.replace('$', '')) * 100);

        items.push({
            // 💡 2. AÑADIR EL ID AL OBJETO ENVIADO AL BACKEND
            id: id,
            name: titulo,
            amount: precioCentavos, 
            currency: 'usd', 
            quantity: 1, // Asumimos 1 por ahora (si no tienes selector de cantidad)
        });
    });

    return items;
}

function actualizarContador() {
    // Cuenta el número de filas (elementos) en el cuerpo de la tabla
    const totalItems = lista.children.length; 
    contadorCarrito.textContent = totalItems;

    if (totalItems > 0) {
        contadorCarrito.style.display = 'block'; // Muestra la burbuja
    } else {
        contadorCarrito.style.display = 'none'; // La oculta
    }
}

// --- NUEVA FUNCIÓN EN TU JAVASCRIPT ---

function calcularTotal() {
    let total = 0;
    
    // Obtener todas las filas de productos en el carrito
    const filasCarrito = document.querySelectorAll('#lista-carrito tbody tr');

    // Iterar sobre cada fila
    filasCarrito.forEach(function(fila) {
        // Asumo que el precio está en la tercera celda (td) de la fila:
        // th[0]=Imagen, th[1]=Nombre, th[2]=Precio, th[3]=Botón Borrar
        
        // 1. Obtener el texto del precio (ej. "$150")
        const precioTexto = fila.children[2].textContent; 
        
        // 2. Limpiar el texto (quitar el '$') y convertirlo a número flotante
        const precio = parseFloat(precioTexto.replace('$', ''));
        
        // NOTA: Si implementaste el control de cantidad, aquí deberías 
        // multiplicar el precio por la cantidad. (Por ahora, asumimos cantidad = 1)
        
        total += precio;
    });

    // Formatear el total (ej. a dos decimales)
    const totalFormateado = `$${total.toFixed(2)}`;
    
    // Mostrar el total en el HTML
    totalCarrito.innerHTML = `Total: ${totalFormateado}`;
    
    // Si el carrito está vacío, limpia el texto
    if (total === 0) {
        totalCarrito.innerHTML = '';
    }
}

function cargarCarritoDesdeStorage() {
    const carritoGuardado = localStorage.getItem('carrito');

    // 1. Si hay algo guardado...
    if (carritoGuardado) {
        // 2. Inyectar el HTML guardado en el cuerpo de la tabla del carrito.
        document.querySelector('#lista-carrito tbody').innerHTML = carritoGuardado;
        
        // 3. Actualizar el contador de la burbuja (si lo tienes implementado)
        actualizarContador(); 

        // 💡 LLAMADA AQUÍ
        calcularTotal();
    }
}

// --- NUEVA FUNCIÓN EN TU JAVASCRIPT ---

function sincronizarStorage() {
    // 1. Convertir el contenido de la tabla del carrito (lista) a un array de objetos.
    // NOTA: Asumo que en tu lista ya tienes el HTML de cada producto.
    // Para simplificar, vamos a guardar el HTML interno del carrito.
    
    // Si tu carrito (la tabla) tiene un ID 'lista-carrito' y un tbody:
    const contenidoCarrito = document.querySelector('#lista-carrito tbody').innerHTML;
    
    // 2. Guardar el HTML del carrito en localStorage bajo la clave 'carrito'.
    // Los datos se guardan como cadenas de texto (strings).
    localStorage.setItem('carrito', contenidoCarrito);

    // *************************************************************
    // Si tu lógica de carrito original guardaba objetos JSON:
    /*
    const productosEnCarrito = [];
    // Aquí deberías iterar sobre las filas de la tabla para construir un array de productos
    // con sus IDs, nombres y precios, y luego:
    localStorage.setItem('carrito', JSON.stringify(productosEnCarrito));
    */
    // *************************************************************
}

function comprarElemento(e) {
    e.preventDefault();
    // Verifica si el elemento clickeado tiene la clase 'agregar-carrito'
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

    // 💡 AJUSTE CLAVE: Añadir el ID del producto a la fila
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

    // 💡 LLAMADA AQUÍ
    actualizarContador();

    // 💡 PASO 2: Sincronizar el carrito con localStorage
    sincronizarStorage();

    // 💡 LLAMADA AQUÍ
    calcularTotal();
}

function eliminarElemento(e) {
    e.preventDefault();
    let elemento, elementoId;
    
    if(e.target.classList.contains('borrar')) {
        e.target.parentElement.parentElement.remove();
        elemento = e.target.parentElement.parentElement;
        elementoId = elemento.querySelector('a').getAttribute('data-id');

        // 💡 LLAMADA AQUÍ
        actualizarContador();

        // 💡 PASO 2: Sincronizar el carrito con localStorage
        sincronizarStorage();

        // 💡 LLAMADA AQUÍ
        calcularTotal();
    }
}

function vaciarCarrito() {
    while(lista.firstChild) {
        lista.removeChild(lista.firstChild);
    }

    // 💡 LLAMADA AQUÍ
    actualizarContador();

    // 💡 PASO 2: Sincronizar el carrito con localStorage
    sincronizarStorage();

    // 💡 LLAMADA AQUÍ
    calcularTotal();

    return false;
}
