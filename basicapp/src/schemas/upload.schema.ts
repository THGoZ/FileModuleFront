import Joi from "joi";

export const uploadSchema = Joi.object({
  image: Joi.any().required().messages({
    "any.required": "Please select an image to upload",
  }),
  file_name: Joi.string().max(100).optional().empty(''),
  description: Joi.string().min(10).max(500).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 500 characters",
  }),
  user_id: Joi.string().optional(),
})

export const documentUploadSchema = Joi.object({
  file: Joi.any().required().messages({
    "any.required": "Please select a PDF document to upload",
  }),
  description: Joi.string().min(10).max(1000).optional().empty(''),
  user_id: Joi.string().optional(),
  file_name: Joi.string().max(100).optional().empty(''),
})

export const updateDocumentSchema = Joi.object({
  file_name: Joi.string().max(100).optional().empty(''),
  description: Joi.string().min(10).max(1000).optional().empty(''),
})