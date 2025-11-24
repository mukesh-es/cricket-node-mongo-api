const {requestFailed} = require('../utils/responseHandler');

const validateParam = (params) => {
    // convert single param to array automatically
    const paramList = Array.isArray(params) ? params : [params];

    return (req, res, next) => {
        for (const paramName of paramList) {
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

            req[paramName] = num;
        }

        next();
    };
};

module.exports = validateParam;