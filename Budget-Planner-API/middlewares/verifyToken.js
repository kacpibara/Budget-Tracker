const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // Pobieranie nagłówka Authorization
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ error: "Access denied! No token provided." });
    }

    // berear format: BEREAR token_here
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ error: "Access denied! Invalid token format." });
    }

    // weryfikacja tokenu przy pomocy zmiennej z .env
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized! Token is invalid or expired." });
        }
        
        // Token poprawny ? Wyciagamy userid do dalszych endpointow
        req.userId = decoded.id; 
        next();
    });
};

module.exports = verifyToken;