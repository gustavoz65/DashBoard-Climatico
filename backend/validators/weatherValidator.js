// backend/validators/weatherValidator.js
const Joi = require("joi");

const weatherSchema = {
  city: Joi.object({
    city: Joi.string().min(2).max(100).required().messages({
      "string.min": "Nome da cidade deve ter pelo menos 2 caracteres",
      "string.max": "Nome da cidade deve ter no máximo 100 caracteres",
      "any.required": "Nome da cidade é obrigatório",
    }),
  }),

  state: Joi.object({
    state: Joi.string().valid("MT", "Mato Grosso").required().messages({
      "any.only": "Estado deve ser MT ou Mato Grosso",
      "any.required": "Estado é obrigatório",
    }),
  }),

  history: Joi.object({
    startDate: Joi.date().iso().required().messages({
      "date.format": "Data inicial deve estar no formato ISO",
      "any.required": "Data inicial é obrigatória",
    }),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).required().messages({
      "date.format": "Data final deve estar no formato ISO",
      "date.min": "Data final deve ser posterior à data inicial",
      "any.required": "Data final é obrigatória",
    }),
  }),

  forecast: Joi.object({
    days: Joi.number().integer().min(1).max(16).default(7).messages({
      "number.min": "Número de dias deve ser pelo menos 1",
      "number.max": "Número de dias não pode exceder 16",
    }),
  }),
};

module.exports = { weatherSchema };
