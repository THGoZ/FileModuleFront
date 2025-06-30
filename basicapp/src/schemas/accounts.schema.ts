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

export const updatePasswordSchema = Joi.object({
    newPassword: Joi.string().required().min(8).label('Contraseña').invalid(Joi.ref('password')),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).label('Confirmar contraseña'),
    password: Joi.string().required().min(8).label('Contraseña actual'),
})

export const deleteUserSchema = Joi.object({
    password: Joi.string().required().min(8).label('Contraseña'),
})