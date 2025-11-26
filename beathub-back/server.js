// Cargar variables de entorno (claves secretas)
require('dotenv').config(); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');

const app = express();
// En server.js
const PORT = process.env.PORT || 4242; // Usa el puerto de Render o 4242 localmente

app.listen(PORT, () => {
    console.log(`Backend escuchando en el puerto ${PORT}`);
});

// 2. Definir los orígenes permitidos
const allowedOrigins = [
    'http://127.0.0.1:5500', // Para pruebas locales
    'http://localhost:4242',  // Para pruebas locales
    'https://ricckyfv.github.io' // ¡TU DOMINIO DE GITHUB PAGES!
];

// Middlewares
app.use(cors({ 
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
    credentials: true // Permite cookies y encabezados de autenticación
}));

app.use(express.json()); // Permite recibir JSON en las peticiones

// ----------------------------------------------------
// ⚠️ 1. SIMULACIÓN DE BASE DE DATOS DE PRODUCTOS (Backend)
// ----------------------------------------------------
const PRODUCTS = {
    // 💡 LAS CLAVES AHORA SON '1', '2', '3', '4' PARA COINCIDIR CON TU HTML
    '1': { 
        name: "Promo 1 - Audífonos", 
        price: 15000, // $150.00 en centavos
        image: 'http://127.0.0.1:5500/images/ph1.png'
    },
    '2': { 
        name: "Promo 2 - Audífonos", 
        price: 15000, // $150.00 en centavos
        image: 'http://127.0.0.1:5500/images/ph2.png'
    },
    '3': { 
        name: "Promo 3 - Audífonos", 
        price: 15000,
        image: 'http://127.0.0.1:5500/images/ph3.png'
    },
    '4': { 
        name: "Promo 4 - Audífonos", 
        price: 15000,
        image: 'http://127.0.0.1:5500/images/ph4.png'
    },
    '5': { 
        name: "Nuevo Producto 1 - Audífonos", 
        price: 15000, // $150.00 en centavos
        image: 'http://127.0.0.1:5500/images/ph1.png'
    },
    '6': { 
        name: "Nuevo Producto 2 - Audífonos", 
        price: 15000, // $150.00 en centavos
        image: 'http://127.0.0.1:5500/images/ph2.png'
    },
    '7': { 
        name: "Nuevo Producto 3 - Audífonos", 
        price: 15000,
        image: 'http://127.0.0.1:5500/images/ph3.png'
    },
    '8': { 
        name: "Nuevo Producto 4 - Audífonos", 
        price: 15000,
        image: 'http://127.0.0.1:5500/images/ph4.png'
    },
    '9': { 
        name: "Producto 1 - Audífonos", 
        price: 15000, // $150.00 en centavos
        image: 'http://127.0.0.1:5500/images/ph1.png'
    },
    '10': { 
        name: "Producto 2 - Audífonos", 
        price: 15000, // $150.00 en centavos
        image: 'http://127.0.0.1:5500/images/ph2.png'
    },
    '11': { 
        name: "Producto 3 - Audífonos", 
        price: 15000,
        image: 'http://127.0.0.1:5500/images/ph3.png'
    },
    '12': { 
        name: "Producto 4 - Audífonos", 
        price: 15000,
        image: 'http://127.0.0.1:5500/images/ph4.png'
    },
    // Si tienes otra sección (id="lista-2") con productos 5, 6, etc., añádelos aquí:
    // '5': { name: "Auriculares Estándar", price: 10000 }, // $100.00
    // '6': { name: "Micrófono USB", price: 8000 },        // $80.00
};
// ----------------------------------------------------
// 2. ENDPOINT PARA CREAR LA SESIÓN DE CHECKOUT
// ----------------------------------------------------
app.post('/create-checkout-session', async (req, res) => {
    try {
        const itemsFromFrontend = req.body.items;

        // Mapear los productos del frontend al formato que Stripe necesita
        const lineItems = itemsFromFrontend.map(item => {
            // 💡 Aquí el backend VALIDA y usa sus propios precios
            const productInfo = PRODUCTS[item.id];

            if (!productInfo) {
                throw new Error(`Producto no encontrado: ${item.id}`);
            }

            return {
                price_data: {
                    currency: item.currency,
                    product_data: {
                        name: productInfo.name,
                        // 💡 AÑADIMOS LA IMAGEN AQUÍ
                        images: [productInfo.image],
                    },
                    // Usamos el precio almacenado en el backend, no el del frontend
                    unit_amount: productInfo.price, 
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            // URLs a dónde redirigir después de pagar o cancelar
            success_url: 'http://127.0.0.1:5500/success.html', // ⚠️ Crea esta página
            cancel_url: 'http://127.0.0.1:5500/index.html',
        });

        // Enviar el ID de la sesión de vuelta al frontend
        res.json({ id: session.id });

    } catch (error) {
        console.error('Error al crear la sesión de checkout:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ----------------------------------------------------
// 3. INICIAR EL SERVIDOR
// ----------------------------------------------------
app.listen(PORT, () => {
    console.log(`Backend escuchando en http://localhost:${PORT}`);
});