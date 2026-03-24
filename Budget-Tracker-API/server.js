require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // NOWE: Import Helmet
const rateLimit = require('express-rate-limit'); // NOWE: Import Rate Limit

// middlewares import
const myErrorHandler = require('./middlewares/errorHandler');
const myRequestLogger = require('./middlewares/logger');

// routes import
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const expensesRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ 1. HELMET: Zabezpieczenie nagłówków HTTP
// Automatycznie ukrywa m.in. nagłówek "X-Powered-By: Express", 
// utrudniając hakerom rozpoznanie technologii serwera.
app.use(helmet());

// 🛡️ 2. RATE LIMITER: Globalny limit zapytań (Ochrona przed DDoS)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Czas trwania: 15 minut
    max: 100, // Maksymalnie 100 zapytań z jednego adresu IP w ciągu 15 minut
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});
// Aplikujemy globalny limit do wszystkich ścieżek
app.use(globalLimiter);

// 🛡️ 3. RATE LIMITER: Restrykcyjny limit dla autoryzacji (Ochrona przed Brute Force)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // Czas trwania: 1 godzina
    max: 10, // Maksymalnie 10 prób logowania/rejestracji na godzinę
    message: { error: "Too many login/register attempts. Please try again after an hour." }
});
// Aplikujemy ten limit TYLKO do ścieżki /auth
app.use('/auth', authLimiter);


// standardowe middlewares
app.use(myRequestLogger);
app.use(cors());
app.use(express.json({
    origin: 'https://kacpibara.github.io', // Twój nowy adres front-endu
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// routing
app.use('/auth', authRoutes);
app.use('/', indexRoutes);
app.use('/expenses', expensesRoutes);

app.use(myErrorHandler);

app.listen(PORT, () => {
    console.log(`Budget API works on http://localhost:${PORT}`);
});