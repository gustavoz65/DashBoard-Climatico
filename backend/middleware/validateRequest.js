const logger = require("../utils/logger");

const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      logger.warn("Validation failed", {
        url: req.originalUrl,
        errors,
      });

      return res.status(400).json({
        success: false,
        error: {
          message: "Dados inválidos",
          details: errors,
        },
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = validateRequest;
