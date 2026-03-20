const errorHandler = function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
        error: err.message,
        message: "Stupid Flanders!"
    });
};

module.exports = errorHandler;