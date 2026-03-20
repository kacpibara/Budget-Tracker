const myRequestLogger = function(req, res, next) {
    console.log(`Logged ${req.method} ${req.url}`);
    next();
}

module.exports = myRequestLogger;