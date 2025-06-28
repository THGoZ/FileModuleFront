import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().required().label('Nombre'),
    email: Joi.string().email({ tlds: { allow: false } }).label('Correo electronico'),
    password: Joi.string().required().min(8).label('Contraseña'),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).label('Confirmar contraseña'),
});

export const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).label('Correo electronico'),
    password: Joi.string().required().min(8).label('Contraseña'),
});

export const updateUserSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).label('Correo electronico'),
    name: Joi.string().required().label('Nombre'),
});