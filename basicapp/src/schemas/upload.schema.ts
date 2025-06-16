import Joi from "joi";

export const uploadSchema = Joi.object({
  image: Joi.any().required().messages({
    "any.required": "Please select an image to upload",
  }),
  description: Joi.string().min(10).max(500).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 500 characters",
  }),
})