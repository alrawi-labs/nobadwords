export const validateEmail = (email: string) => {
  if (!email) return "emailRequired";
  if (email.length < 6) return "emailTooShort";
  if (email.length > 128) return "emailTooLong";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "emailInvalid";
  return "";
};

export const validatePassword = (password: string) => {
  if (!password) return "passwordRequired";
  if (password.length < 8) return "passwordTooShort";
  if (password.length > 32) return "passwordTooLong";
  return "";
};

export const validateFirstName = (firstName: string) => {
  if (!firstName) return "firstNameRequired";
  if (firstName.length > 32) return "generalMaxLength";
  return "";
};

export const validateLastName = (lastName: string) => {
  if (!lastName) return "lastNameRequired";
  if (lastName.length > 32) return "generalMaxLength";
  return "";
};
