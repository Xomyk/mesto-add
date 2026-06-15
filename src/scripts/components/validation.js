// Функция показа ошибки
export const showInputError = (formElement, inputElement, errorMessage, config) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (errorElement) {
    inputElement.classList.add(config.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(config.errorClass);
  }
};

// Функция скрытия ошибки
export const hideInputError = (formElement, inputElement, config) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  if (errorElement) {
    inputElement.classList.remove(config.inputErrorClass);
    errorElement.textContent = '';
    errorElement.classList.remove(config.errorClass);
  }
};

// Проверка валидности поля (универсальная, без кастомной логики)
export const checkInputValidity = (formElement, inputElement, config) => {
  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, config);
  } else {
    // Берём сообщение браузера, основанное на HTML5-атрибутах (pattern, required, title и др.)
    const errorMessage = inputElement.validationMessage;
    showInputError(formElement, inputElement, errorMessage, config);
  }
};

// Проверка наличия невалидного поля в форме
export const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => !inputElement.validity.valid);
};

// Деактивация кнопки
export const disableSubmitButton = (buttonElement, config) => {
  buttonElement.classList.add(config.inactiveButtonClass);
  buttonElement.disabled = true;
};

// Активация кнопки
export const enableSubmitButton = (buttonElement, config) => {
  buttonElement.classList.remove(config.inactiveButtonClass);
  buttonElement.disabled = false;
};

// Переключение состояния кнопки
export const toggleButtonState = (inputList, buttonElement, config) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, config);
  } else {
    enableSubmitButton(buttonElement, config);
  }
};

// Установка слушателей на поля формы
export const setEventListeners = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
  toggleButtonState(inputList, buttonElement, config);
};

// Очистка ошибок валидации формы
export const clearValidation = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);
  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
  });
  disableSubmitButton(buttonElement, config);
};

// Активация валидации для всех форм
export const enableValidation = (config) => {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  formList.forEach((formElement) => {
    setEventListeners(formElement, config);
  });
};