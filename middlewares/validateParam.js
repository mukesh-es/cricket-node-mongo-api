const {requestFailed} = require('../utils/responseHandler');

const validateParam = (paramName, attachAs) => {
    return (req, res, next) => {
        const value = req.params[paramName];

        if (!value) {
            return requestFailed({
                res,
                status: 400,
                err: new Error(`${paramName} is required`)
            });
        }

        const num = parseInt(value, 10);
        if (isNaN(num) || num <= 0) {
            return requestFailed({
                res,
                status: 400,
                err: new Error(`${paramName} must be a valid positive integer`)
            });
        }

        req[attachAs] = num;
        next();
    };
};

module.exports = validateParam;