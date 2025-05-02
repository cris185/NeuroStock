import * as Yup from 'yup';

// Logica de la validación de datos para el registro de usuarios
export const registerSchema = Yup.object().shape({
  username: Yup.string()
    .required('The username is required')
    .min(3, 'The username must be at least 3 characters'),
  email: Yup.string()
    .required('The email is required')
    .email('Email not valid'),
  password: Yup.string()
    .required('The password is required')
    .min(8, 'The password must be at least 8 characters')
    .notOneOf([Yup.ref('username')], 'The username cannot be the same as the password')
    .matches(/^(?!.*1234).*/, 'Don\'t use 1234 in the password'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'The passwords must match')
    .required('Must confirm the password'),
});
