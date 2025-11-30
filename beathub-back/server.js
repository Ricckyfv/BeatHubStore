// Cargar variables de entorno (claves secretas)
require('dotenv').config(); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');
// --- 1. AÑADE ESTO ARRIBA (Junto a los otros require) ---
const nodemailer = require('nodemailer');

const app = express();
// En server.js
const PORT = process.env.PORT || 4242; // Usa el puerto de Render o 4242 localmente

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

app.post('/enviar-correo', async (req, res) => {
    const { nombre, email, mensaje } = req.body;

    try {
        // Configurar el transporte (quién envía el correo)
        const transporter = nodemailer.createTransport({
            // ⚠️ CAMBIAMOS 'service: gmail' por la configuración explícita:
            host: 'smtp.gmail.com',
            port: 465, // Puerto seguro para SSL
            secure: true, // Usa SSL/TLS (el puerto 465 requiere esto)
            auth: {
                user: process.env.EMAIL_USER, // Tu correo de Gmail
                pass: process.env.EMAIL_PASS  // La contraseña de aplicación de 16 letras
            }
        });

        // Configurar el contenido del correo
        const mailOptions = {
            from: `"${nombre}" <${email}>`, // Quien lo envía (según el form)
            to: process.env.EMAIL_USER, // A quién le llega (A TI MISMO)
            subject: `Nuevo mensaje de contacto BeatHub de: ${nombre}`,
            text: `
                Has recibido un nuevo mensaje desde tu web:
                
                Nombre: ${nombre}
                Email: ${email}
                Mensaje:
                ${mensaje}
            `
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Correo enviado con éxito' });

    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ error: 'Error al enviar el correo' });
        
        // Responde al frontend con el error, pero oculta detalles sensibles.
        res.status(500).json({ error: 'Fallo interno del servidor. Revisar logs.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend escuchando en el puerto ${PORT}`);
});


// ----------------------------------------------------
// (Backend)
// ----------------------------------------------------
const PRODUCTS = {
    '1': { 
        name: "Promo 1 - Audífonos", 
        price: 15000,
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph1.png'
    },
    '2': { 
        name: "Promo 2 - Audífonos", 
        price: 15000,
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph2.png'
    },
    '3': { 
        name: "Promo 3 - Audífonos", 
        price: 15000,
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph3.png'
    },
    '4': { 
        name: "Promo 4 - Audífonos", 
        price: 15000,
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph4.png'
    },
    '5': { 
        name: "Nuevo Producto 1 - Audífonos", 
        price: 15000, 
        image: 'http://127.0.0.1:5500/images/ph1.png'
    },
    '6': { 
        name: "Nuevo Producto 2 - Audífonos", 
        price: 15000, 
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
        price: 15000, 
        image: 'http://127.0.0.1:5500/images/ph1.png'
    },
    '10': { 
        name: "Producto 2 - Audífonos", 
        price: 15000,
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
};
// ----------------------------------------------------
// ENDPOINT PARA CREAR LA SESIÓN DE CHECKOUT
// ----------------------------------------------------
app.post('/create-checkout-session', async (req, res) => {
    try {
        const itemsFromFrontend = req.body.items;

        const lineItems = itemsFromFrontend.map(item => {
            
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