/*
  Точка входа – инициализация приложения, загрузка данных с сервера,
  навешивание слушателей, открытие статистики по кнопке «i» на карточке.
*/
import "../pages/index.css";
import { getUserInfo, getCardList, updateUserInfo, updateUserAvatar, addCard } from "./components/api.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// ===== DOM элементы =====
const placesWrap = document.querySelector(".places__list");

const profileFormModal = document.querySelector(".popup_type_edit");
const profileForm = profileFormModal.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModal = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModal.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModal = document.querySelector(".popup_type_image");
const imageElement = imageModal.querySelector(".popup__image");
const imageCaption = imageModal.querySelector(".popup__caption");

const openProfileBtn = document.querySelector(".profile__edit-button");
const openCardBtn = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModal = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModal.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

// ===== Элементы модального окна статистики карточки =====
const statsModal = document.querySelector(".popup_type_info");
const statsInfoList = statsModal.querySelector(".popup-info__definition-list");
const statsUsersList = statsModal.querySelector(".popup-info__users-list");
const infoDefinitionTemplate = document.querySelector("#popup-info-definition-template").content;
const infoUserTemplate = document.querySelector("#popup-info-user-preview-template").content;

// ===== Глобальные переменные =====
let currentUserId = null;

// ===== Функция форматирования даты =====
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ===== Вспомогательные функции для статистики =====
const createInfoString = (label, value) => {
  const el = infoDefinitionTemplate.cloneNode(true);
  el.querySelector(".popup__info-term").textContent = label;
  el.querySelector(".popup__info-description").textContent = value;
  return el;
};

const createUserPreview = (user) => {
  const el = infoUserTemplate.cloneNode(true);
  const avatar = el.querySelector(".popup-info__user-avatar");
  const nameSpan = el.querySelector(".popup-info__user-name");
  avatar.src = user.avatar || "./src/images/avatar.jpg";
  avatar.alt = user.name;
  nameSpan.textContent = user.name;
  return el;
};

// ===== Обработчик открытия полноразмерного изображения =====
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModal);
};

// ===== ОБРАБОТЧИК КНОПКИ «i» (статистика карточки) =====
const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      if (!cardData) throw new Error("Карточка не найдена");

      statsInfoList.innerHTML = '';
      statsUsersList.innerHTML = '';

      statsInfoList.append(
        createInfoString("Название:", cardData.name),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Количество лайков:", cardData.likes.length.toString())
      );

      cardData.likes.forEach(user => {
        statsUsersList.append(createUserPreview(user));
      });

      openModalWindow(statsModal);
    })
    .catch(err => console.error("Ошибка загрузки статистики карточки:", err));
};

// ===== Рендер карточек =====
const renderCards = (cards) => {
  placesWrap.innerHTML = "";
  cards.forEach(card => {
    const cardElement = createCardElement(card, {
      onPreviewPicture: handlePreviewPicture,
      onInfoClick: handleInfoClick,
      currentUserId,
    });
    placesWrap.append(cardElement);
  });
};

// ===== Загрузка начальных данных =====
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    renderCards(cards);
  })
  .catch(err => console.error("Ошибка загрузки начальных данных:", err));

// ===== Редактирование профиля =====
const handleProfileSubmit = (evt) => {
  evt.preventDefault();
  const submitBtn = profileForm.querySelector(".popup__button");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Сохранение...";
  submitBtn.disabled = true;

  updateUserInfo(profileTitleInput.value, profileDescriptionInput.value)
    .then(userData => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModal);
    })
    .catch(err => console.error("Ошибка обновления профиля:", err))
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
};
profileForm.addEventListener("submit", handleProfileSubmit);

openProfileBtn.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModal);
});

// ===== Обновление аватара =====
const handleAvatarSubmit = (evt) => {
  evt.preventDefault();
  const submitBtn = avatarForm.querySelector(".popup__button");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Сохранение...";
  submitBtn.disabled = true;

  updateUserAvatar(avatarInput.value)
    .then(userData => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModal);
    })
    .catch(err => console.error("Ошибка обновления аватара:", err))
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
};
avatarForm.addEventListener("submit", handleAvatarSubmit);

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModal);
});

// ===== Добавление новой карточки =====
const handleCardSubmit = (evt) => {
  evt.preventDefault();
  const submitBtn = cardForm.querySelector(".popup__button");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Создание...";
  submitBtn.disabled = true;

  addCard(cardNameInput.value, cardLinkInput.value)
    .then(newCard => {
      const cardElement = createCardElement(newCard, {
        onPreviewPicture: handlePreviewPicture,
        onInfoClick: handleInfoClick,
        currentUserId,
      });
      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModal);
      cardForm.reset();
    })
    .catch(err => console.error("Ошибка добавления карточки:", err))
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
};
cardForm.addEventListener("submit", handleCardSubmit);

openCardBtn.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModal);
});

// ===== ВАЛИДАЦИЯ ФОРМ =====
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};
enableValidation(validationConfig);

// ===== Закрытие попапов =====
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach(popup => {
  setCloseModalWindowEventListeners(popup);
});