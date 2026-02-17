// // --- Inicialización de Swiper (Sliders) ---

// // Slider del Header
// let swiper1 = new Swiper(".mySwiper-1", {
//     slidesPerView: 1,
//     spaceBetween: 30,
//     loop: true,
//     pagination: {
//         el: ".swiper-pagination",
//         clickable: true,
//     },
//     navigation: {
//         nextEl: ".swiper-button-next",
//         prevEl: ".swiper-button-prev",
//     },
// });

// // Slider de Productos
// let swiper2 = new Swiper(".mySwiper-2", {
//     slidesPerView: 3,
//     spaceBetween: 30,
//     loop: true,
//     navigation: {
//         nextEl: ".swiper-button-next",
//         prevEl: ".swiper-button-prev",
//     },
//     breakpoints: {
//         0: {
//             slidesPerView: 1,
//         },
//         520: {
//             slidesPerView: 2,
//         },
//         950: {
//             slidesPerView: 3,
//         }
//     }
// });

// let articulosCarrito = []; // Array global para los productos


// const carrito = document.getElementById('carrito');
// const elementos1 = document.getElementById('lista-1'); // Sección Promociones
// const elementos2 = document.getElementById('lista-2'); // Sección Nuevos Productos
// const elementos3 = document.getElementById('lista-3'); // Sección Productos
// const lista = document.querySelector('#lista-carrito tbody'); 
// const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
// const contadorCarrito = document.getElementById('contador-carrito');
// const totalCarrito = document.getElementById('total-carrito');
// const procederPagoBtn = document.getElementById('proceder-pago');

// const stripe = Stripe('pk_test_51SWjkCCGPzWUA8TXKGenZGUlEY8bWKQaZnXeub3I7jwXFioRpeNZCc3f0DrAFaGQTvhdXjuNlhf6FiFgs0KTSHz400bnxkbivV');

// cargarEventListeners();

// function cargarEventListeners() {

//     elementos1.addEventListener('click', comprarElemento);
//     elementos2.addEventListener('click', comprarElemento);
//     elementos3.addEventListener('click', comprarElemento);


//     carrito.addEventListener('click', eliminarElemento);
//     carrito.addEventListener('click', modificarCantidad);

//     vaciarCarritoBtn.addEventListener('click', vaciarCarrito);

//     //document.addEventListener('DOMContentLoaded', cargarCarritoDesdeStorage);
//     document.addEventListener('DOMContentLoaded', () => {
//     cargarCarritoDesdeStorage();
//     verificarEstadoPago();
// });

//     procederPagoBtn.addEventListener('click', manejarPago);
// }

// function manejarPago(e) {
//     e.preventDefault();

//     const productosParaPago = obtenerDatosDelCarritoParaStripe(); 

//     if (productosParaPago.length === 0) {
//         alert("El carrito está vacío. Añade productos para pagar.");
//         return;
//     }
    
//     fetch('https://beathub-back.onrender.com/create-checkout-session', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ items: productosParaPago }),
//     })
//     .then(response => response.json())
//     .then(session => {
//         return stripe.redirectToCheckout({ sessionId: session.id });
//     })
//     .then(result => {
        
//         if (result.error) {
//             alert(result.error.message);
//         }
//     })
//     .catch(error => {
//         console.error('Error al iniciar el pago:', error);
//         alert('Hubo un error al intentar iniciar la pasarela de pago.');
//     });
// }

// function obtenerDatosDelCarritoParaStripe() {

//     // Usamos el array global en lugar de document.querySelectorAll
//     return articulosCarrito.map(producto => {
//         // Limpiamos el precio y lo pasamos a centavos (Stripe lo requiere así)
//         const precioNumero = parseFloat(producto.precio.replace('$', ''));
//         const precioCentavos = Math.round(precioNumero * 100);

//         return {
//             id: producto.id,
//             name: producto.titulo,
//             amount: precioCentavos, 
//             currency: 'usd', 
//             quantity: producto.cantidad, // ¡Ahora enviamos la cantidad real!
//         };
//     });

//     // const filas = document.querySelectorAll('#lista-carrito tbody tr');
//     // const items = [];

//     // filas.forEach(fila => {
       
//     //     const id = fila.getAttribute('data-product-id');
        
//     //     if (!id) {
//     //         console.error('Fila de carrito sin ID de producto. Skipped.');
//     //         return; 
//     //     }

//     //     const titulo = fila.children[1].textContent;
//     //     const precioTexto = fila.children[2].textContent;
//     //     const precioCentavos = Math.round(parseFloat(precioTexto.replace('$', '')) * 100);

//     //     items.push({
//     //         id: id,
//     //         name: titulo,
//     //         amount: precioCentavos, 
//     //         currency: 'usd', 
//     //         quantity: 1, 
//     //     });
//     // });

//     // return items;
// }

// function actualizarContador() {
//     const totalItems = lista.children.length; 
//     contadorCarrito.textContent = totalItems;

//     if (totalItems > 0) {
//         contadorCarrito.style.display = 'block'; 
//     } else {
//         contadorCarrito.style.display = 'none'; 
//     }
// }

// function calcularTotal() {
//     let total = 0;
    
//     // const filasCarrito = document.querySelectorAll('#lista-carrito tbody tr');

//     // filasCarrito.forEach(function(fila) {
//     //     const precioTexto = fila.children[2].textContent; 
        
//     //     const precio = parseFloat(precioTexto.replace('$', ''));
        
//     //     total += precio;
//     // });
//     // Si usas el array articulosCarrito (que es lo ideal ahora):

//     articulosCarrito.forEach(producto => {
//         const precio = parseFloat(producto.precio.replace('$', ''));
//         total += precio * producto.cantidad;
//     });

//     // ¡VALIDACIÓN CRÍTICA!
//     if (!totalCarrito) {
//         console.warn("No se encontró el elemento #total-carrito en el HTML");
//         return;
//     }

//     const totalFormateado = `$${total.toFixed(2)}`;
    
//     totalCarrito.innerHTML = `Total: ${totalFormateado}`;
    
//     if (total === 0) {
//         totalCarrito.innerHTML = '';
//     }
// }

// function cargarCarritoDesdeStorage() {

//     const carritoGuardado = localStorage.getItem('carrito');

//     if (!carritoGuardado) {
//         articulosCarrito = [];
//         return;
//     }

//     try {
//         const datos = JSON.parse(carritoGuardado);
//         if (Array.isArray(datos)) {
//             articulosCarrito = datos;
//             dibujarCarritoHTML();
//         }
//     } catch (e) {
//         console.error("Error al cargar storage:", e);
//         articulosCarrito = [];
//         localStorage.removeItem('carrito'); // Borramos si los datos están corruptos
//     }
//     // const carritoGuardado = localStorage.getItem('carrito');

//     // if (carritoGuardado) {

//     //     document.querySelector('#lista-carrito tbody').innerHTML = carritoGuardado;
        
//     //     actualizarContador(); 

//     //     calcularTotal();
//     // }
// }

// function sincronizarStorage() {

//     // Guardamos el ARRAY, no el HTML. Es mucho más eficiente.
//     localStorage.setItem('carrito', JSON.stringify(articulosCarrito));

//     // const contenidoCarrito = document.querySelector('#lista-carrito tbody').innerHTML;
    
//     // localStorage.setItem('carrito', contenidoCarrito);

// }



// function comprarElemento(e) {
//     e.preventDefault();

//     if(e.target.classList.contains('agregar-carrito')) {
//         const elemento = e.target.parentElement.parentElement;
//         leerDatosElemento(elemento);
//     }
// }

// function mostrarToast(nombreProducto) {
//     const toast = document.getElementById('toast');
//     toast.textContent = `¡${nombreProducto} añadido al carrito!`;
    
//     toast.classList.add('show');

//     // Desaparece después de 3 segundos
//     setTimeout(() => {
//         toast.classList.remove('show');
//     }, 3000);
// }

// function dibujarCarritoHTML() {
//     limpiarHTML();

//     articulosCarrito.forEach(producto => {
//         const { imagen, titulo, precio, cantidad, id } = producto;
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td><img src="${imagen}" class="img-carrito-tabla"></td>
//             <td>${titulo}</td>
//             <td>${precio}</td>
//             <td class="cantidad-controles">
//                 <button class="btn-cantidad minus" data-id="${id}">-</button>
//                 <span>${cantidad}</span>
//                 <button class="btn-cantidad plus" data-id="${id}">+</button>
//             </td>
//             <td>
//                 <a href="#" class="borrar" data-id="${id}">X</a>
//             </td>
//         `;
//         lista.appendChild(row);
//     });

//     actualizarContador();
//     sincronizarStorage();
//     calcularTotal();
// }


// function leerDatosElemento(elemento) {
//     const infoElemento = {
//         imagen: elemento.querySelector('img').src,
//         titulo: elemento.querySelector('h3').textContent,
//         precio: elemento.querySelector('.price-2') ? elemento.querySelector('.price-2').textContent : elemento.querySelector('.precio').textContent,
//         id: elemento.querySelector('a').getAttribute('data-id'),
//         cantidad: 1
//     }

//     // Revisar si ya existe en el carrito
//     const existe = articulosCarrito.some( prod => prod.id === infoElemento.id );
    
//     if(existe) {
//         // Actualizamos la cantidad
//         const productos = articulosCarrito.map( prod => {
//             if(prod.id === infoElemento.id) {
//                 prod.cantidad++;
//                 return prod;
//             } else {
//                 return prod;
//             }
//         });
//         articulosCarrito = [...productos];
//     } else {
       
//         articulosCarrito = [...articulosCarrito, infoElemento];
//     }

//     dibujarCarritoHTML();
//     mostrarToast(infoElemento.titulo);
// }

// function modificarCantidad(e) {
//     if(e.target.classList.contains('btn-cantidad')) {
//         const productoId = e.target.getAttribute('data-id');
        
//         articulosCarrito = articulosCarrito.map(producto => {
//             if(producto.id === productoId) {
//                 if(e.target.classList.contains('plus')) {
//                     producto.cantidad++;
//                 } else if(e.target.classList.contains('minus') && producto.cantidad > 1) {
//                     producto.cantidad--;
//                 }
//                 return producto;
//             }
//             return producto;
//         });

//         dibujarCarritoHTML();
//     }
// }

// function eliminarElemento(e) {

//     e.preventDefault();
    
//     if(e.target.classList.contains('borrar')) {
//         const productoId = e.target.getAttribute('data-id');
        
//         // Filtramos el array para quitar el producto con ese ID
//         articulosCarrito = articulosCarrito.filter(producto => producto.id !== productoId);

//         // Volvemos a dibujar para que todo se actualice (contador, total, storage)
//         dibujarCarritoHTML();
//     }
    
// }

// function limpiarHTML() {
//     while(lista.firstChild) {
//         lista.removeChild(lista.firstChild);
//     }
// }

// function vaciarCarrito() {

//     articulosCarrito = []; // Vaciamos el array "fuente de la verdad"
    
//     limpiarHTML(); // Borramos la tabla visual

//     // 2. ¡CRÍTICO! Borramos el rastro en el almacenamiento local
//     localStorage.removeItem('carrito');
    
//     actualizarContador();
//     // sincronizarStorage();
//     calcularTotal();

//     return false;
// }

// function verificarEstadoPago() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const estadoPago = urlParams.get('pago');

//     if (estadoPago === 'exitoso') {
//         alert('¡Pago realizado con éxito! Gracias por tu compra.');
//         vaciarCarrito();
//     } else if (estadoPago === 'cancelado') {
//         dibujarCarritoHTML();
//         alert('El pago fue cancelado. Puedes intentar nuevamente.');
//     }

//     if(estadoPago) {
//         window.history.replaceState(null, null, window.location.pathname);
//     }
// }

// verificarEstadoPago();

// // ----------------------------------------------------

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