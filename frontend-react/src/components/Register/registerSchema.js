import * as Yup from 'yup';

// Logica de la validación de datos para el registro de usuarios
// Ahora es una función que recibe t (función de traducción)
export const getRegisterSchema = (t) => Yup.object().shape({
  username: Yup.string()
    .required(t('validation.usernameRequired'))
    .min(3, t('validation.usernameMin')),
  email: Yup.string()
    .required(t('validation.emailRequired'))
    .email(t('validation.emailInvalid')),
  password: Yup.string()
    .required(t('validation.passwordRequired'))
    .min(8, t('validation.passwordMin'))
    .matches(/[A-Z]/, t('validation.passwordUppercase'))
    .matches(/[a-z]/, t('validation.passwordLowercase'))
    .matches(/[0-9]/, t('validation.passwordNumber'))
    .notOneOf([Yup.ref('username')], t('validation.passwordNotUsername')),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], t('validation.passwordsMustMatch'))
    .required(t('validation.confirmPasswordRequired')),
});

// Funciones helper para validación en tiempo real
// También es una función que recibe t
export const getPasswordRequirements = (t) => [
  { id: 'length', label: t('validation.reqMinChars'), test: (pwd) => pwd.length >= 8 },
  { id: 'uppercase', label: t('validation.reqUppercase'), test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', label: t('validation.reqLowercase'), test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'number', label: t('validation.reqNumber'), test: (pwd) => /[0-9]/.test(pwd) },
];
