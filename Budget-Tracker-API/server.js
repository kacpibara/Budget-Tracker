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

// CORS NA SAMEJ GÓRZE (Zanim cokolwiek innego zablokuje zapytanie)
app.use(cors({
    origin: 'https://kacpibara.github.io', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Dodałem OPTIONS (wymagane dla preflight)
    credentials: true
}));

// PARSOWANIE JSON (Też musi być wysoko)
app.use(express.json());

// HELMET: Zabezpieczenie nagłówków HTTP
app.use(helmet());

// RATE LIMITER: Globalny limit zapytań
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use(globalLimiter);

// RATE LIMITER: Restrykcyjny limit dla autoryzacji
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 10, 
    message: { error: "Too many login/register attempts. Please try again after an hour." }
});
app.use('/auth', authLimiter);

// standardowe middlewares
app.use(myRequestLogger);

// routing
app.use('/auth', authRoutes);
app.use('/', indexRoutes);
app.use('/expenses', expensesRoutes);

app.use(myErrorHandler);

app.listen(PORT, () => {
    console.log(`Budget API works on http://localhost:${PORT}`);
});