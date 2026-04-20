"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => (req, res, next) => {
    try {
        const result = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        req.body = result.body;
        req.query = result.query;
        req.params = result.params;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const firstError = error.errors[0];
            const errorMessage = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation failed';
            return res.status(400).json({
                success: false,
                message: errorMessage,
                errors: error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.validate = validate;
