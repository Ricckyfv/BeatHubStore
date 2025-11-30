
require('dotenv').config(); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');

const nodemailer = require('nodemailer');

const app = express();

const PORT = process.env.PORT || 4242;

const allowedOrigins = [
    'http://127.0.0.1:5500', 
    'http://localhost:4242', 
    'https://ricckyfv.github.io' 
];

// Middlewares
app.use(cors({ 
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true // Permite cookies y encabezados de autenticación
}));

app.use(express.json()); // Permite recibir JSON en las peticiones

app.post('/enviar-correo', async (req, res) => {
    const { nombre, email, mensaje } = req.body;

    try {
        // Configurar el transporte (quién envía el correo)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, 
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS  
            }
        });

        // Configurar el contenido del correo
        const mailOptions = {
            from: `"${nombre}" <${email}>`, // Quien lo envía (según el form)
            to: process.env.EMAIL_USER, // A quién le llega (A MI MISMO)
            subject: `Nuevo mensaje de contacto BeatHub de: ${nombre}`,
            text: `
                Has recibido un nuevo mensaje desde tu web:
                
                Nombre: ${nombre}
                Email: ${email}
                Mensaje:
                ${mensaje}
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Correo enviado con éxito' });

    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ error: 'Error al enviar el correo' });
        
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
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph1.png'
    },
    '6': { 
        name: "Nuevo Producto 2 - Audífonos", 
        price: 15000, 
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph2.png'
    },
    '7': { 
        name: "Nuevo Producto 3 - Audífonos", 
        price: 15000,
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph3.png'
    },
    '8': { 
        name: "Nuevo Producto 4 - Audífonos", 
        price: 15000,
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph4.png'
    },
    '9': { 
        name: "Producto 1 - Audífonos", 
        price: 15000, 
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph1.png'
    },
    '10': { 
        name: "Producto 2 - Audífonos", 
        price: 15000,
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph2.png'
    },
    '11': { 
        name: "Producto 3 - Audífonos", 
        price: 15000,
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph3.png'
    },
    '12': { 
        name: "Producto 4 - Audífonos", 
        price: 15000,
        image: 'https://ricckyfv.github.io/BeatHubStore/images/ph4.png'
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
                        images: [productInfo.image],
                    },

                    unit_amount: productInfo.price, 
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',

            success_url: 'http://127.0.0.1:5500/success.html',
            cancel_url: 'http://127.0.0.1:5500/index.html',
        });

        res.json({ id: session.id });

    } catch (error) {
        console.error('Error al crear la sesión de checkout:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ----------------------------------------------------
// INICIAR EL SERVIDOR
// ----------------------------------------------------
app.listen(PORT, () => {
    console.log(`Backend escuchando en http://localhost:${PORT}`);
});