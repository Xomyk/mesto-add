import "../pages/index.css";
import { getUserInfo, getCardList, updateUserInfo, updateUserAvatar, addCard, deleteCard as deleteCardApi } from "./components/api.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

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

// ===== DOM элементы с проверками =====
const placesWrap = document.querySelector(".places__list");
const profileFormModal = document.querySelector(".popup_type_edit");
const profileForm = profileFormModal?.querySelector(".popup__form");
const profileTitleInput = profileForm?.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm?.querySelector(".popup__input_type_description");

const cardFormModal = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModal?.querySelector(".popup__form");
const cardNameInput = cardForm?.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm?.querySelector(".popup__input_type_url");

const imageModal = document.querySelector(".popup_type_image");
const imageElement = imageModal?.querySelector(".popup__image");
const imageCaption = imageModal?.querySelector(".popup__caption");

const openProfileBtn = document.querySelector(".profile__edit-button");
const openCardBtn = document.querySelector(".profile__add-button");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModal = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModal?.querySelector(".popup__form");
const avatarInput = avatarForm?.querySelector(".popup__input");

const logo = document.querySelector(".header__logo");
const statsModal = document.querySelector(".popup_type_info");
const statsInfoList = statsModal?.querySelector(".popup__info");
const statsUsersList = statsModal?.querySelector(".popup__list");

// ===== Попап удаления карточки =====
const deleteConfirmModal = document.querySelector(".popup_type_remove-card");
const deleteConfirmForm = deleteConfirmModal?.querySelector(".popup__form");
let currentCardToDelete = null; // { cardElement, cardId }

// ===== Глобальные переменные =====
let currentUserId = null;

// ===== Функция форматирования даты =====
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ===== Обработчик открытия полноразмерного изображения =====
const handlePreviewPicture = ({ name, link }) => {
  if (imageElement && imageCaption && imageModal) {
    imageElement.src = link;
    imageElement.alt = name;
    imageCaption.textContent = name;
    openModalWindow(imageModal);
  }
};

// ===== Рендер карточек (с колбэком удаления) =====
const renderCards = (cards) => {
  if (!placesWrap) return;
  placesWrap.innerHTML = "";
  cards.forEach(card => {
    const cardElement = createCardElement(card, {
      onPreviewPicture: handlePreviewPicture,
      onDeleteCard: openDeleteConfirmModal,
      currentUserId: currentUserId,
    });
    placesWrap.append(cardElement);
  });
};

// ===== Загрузка начальных данных =====
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    if (profileTitle) profileTitle.textContent = userData.name;
    if (profileDescription) profileDescription.textContent = userData.about;
    if (profileAvatar) profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    renderCards(cards);
  })
  .catch(err => console.error("Ошибка загрузки начальных данных:", err));

// ===== Редактирование профиля =====
const handleProfileSubmit = (evt) => {
  evt.preventDefault();
  const submitBtn = profileForm?.querySelector(".popup__button");
  if (!submitBtn) return;
  submitBtn.textContent = "Сохранение...";
  updateUserInfo(profileTitleInput?.value, profileDescriptionInput?.value)
    .then(userData => {
      if (profileTitle) profileTitle.textContent = userData.name;
      if (profileDescription) profileDescription.textContent = userData.about;
      if (profileFormModal) closeModalWindow(profileFormModal);
    })
    .catch(err => console.error("Ошибка обновления профиля:", err))
    .finally(() => {
      submitBtn.textContent = "Сохранить";
    });
};
if (profileForm) profileForm.addEventListener("submit", handleProfileSubmit);

if (openProfileBtn && profileTitleInput && profileDescriptionInput && profileForm && profileFormModal) {
  openProfileBtn.addEventListener("click", () => {
    profileTitleInput.value = profileTitle?.textContent || "";
    profileDescriptionInput.value = profileDescription?.textContent || "";
    clearValidation(profileForm, validationConfig);
    openModalWindow(profileFormModal);
  });
}

// ===== Обновление аватара =====
const handleAvatarSubmit = (evt) => {
  evt.preventDefault();
  const submitBtn = avatarForm?.querySelector(".popup__button");
  if (!submitBtn) return;
  submitBtn.textContent = "Сохранение...";
  updateUserAvatar(avatarInput?.value)
    .then(userData => {
      if (profileAvatar) profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      if (avatarFormModal) closeModalWindow(avatarFormModal);
    })
    .catch(err => console.error("Ошибка обновления аватара:", err))
    .finally(() => {
      submitBtn.textContent = "Сохранить";
    });
};
if (avatarForm) avatarForm.addEventListener("submit", handleAvatarSubmit);

if (profileAvatar && avatarForm && avatarFormModal) {
  profileAvatar.addEventListener("click", () => {
    avatarForm.reset();
    clearValidation(avatarForm, validationConfig);
    openModalWindow(avatarFormModal);
  });
}

// ===== Добавление новой карточки =====
const handleCardSubmit = (evt) => {
  evt.preventDefault();
  const submitBtn = cardForm?.querySelector(".popup__button");
  if (!submitBtn) return;
  submitBtn.textContent = "Создание...";
  addCard(cardNameInput?.value, cardLinkInput?.value)
    .then(newCard => {
      const cardElement = createCardElement(newCard, {
        onPreviewPicture: handlePreviewPicture,
        onDeleteCard: openDeleteConfirmModal,
        currentUserId: currentUserId,
      });
      if (placesWrap) placesWrap.prepend(cardElement);
      if (cardFormModal) closeModalWindow(cardFormModal);
    })
    .catch(err => console.error("Ошибка добавления карточки:", err))
    .finally(() => {
      submitBtn.textContent = "Создать";
    });
};
if (cardForm) cardForm.addEventListener("submit", handleCardSubmit);

if (openCardBtn && cardForm && cardFormModal) {
  openCardBtn.addEventListener("click", () => {
    cardForm.reset();
    clearValidation(cardForm, validationConfig);
    openModalWindow(cardFormModal);
  });
}

// ===== Удаление карточки (через модальное окно) =====
const openDeleteConfirmModal = (cardElement, cardId) => {
  currentCardToDelete = { cardElement, cardId };
  openModalWindow(deleteConfirmModal);
};

const handleDeleteConfirm = (evt) => {
  evt.preventDefault();
  if (!currentCardToDelete) return;

  const submitBtn = deleteConfirmForm?.querySelector(".popup__button");
  if (submitBtn) submitBtn.textContent = "Удаление...";

  deleteCardApi(currentCardToDelete.cardId)
    .then(() => {
      currentCardToDelete.cardElement.remove();
      closeModalWindow(deleteConfirmModal);
    })
    .catch(err => console.error("Ошибка удаления карточки:", err))
    .finally(() => {
      if (submitBtn) submitBtn.textContent = "Да";
      currentCardToDelete = null;
    });
};

if (deleteConfirmForm) {
  deleteConfirmForm.addEventListener("submit", handleDeleteConfirm);
}

// ===== СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ (клик по логотипу) =====
const createInfoString = (label, value) => {
  const template = document.getElementById("popup-info-definition-template");
  if (!template) return document.createDocumentFragment();
  const clone = template.content.cloneNode(true);
  const term = clone.querySelector(".popup__info-term");
  const desc = clone.querySelector(".popup__info-description");
  if (term) term.textContent = label;
  if (desc) desc.textContent = value;
  return clone;
};

const handleLogoClick = () => {
  if (!statsInfoList || !statsUsersList) return;
  getCardList()
    .then(cards => {
      if (!cards.length) return;

      let minDate = new Date(cards[0].createdAt);
      let maxDate = new Date(cards[0].createdAt);
      const userMap = new Map();

      cards.forEach(card => {
        const createdAt = new Date(card.createdAt);
        if (createdAt < minDate) minDate = createdAt;
        if (createdAt > maxDate) maxDate = createdAt;

        const userId = card.owner._id;
        const userName = card.owner.name;
        if (userMap.has(userId)) {
          userMap.get(userId).count += 1;
        } else {
          userMap.set(userId, { name: userName, count: 1 });
        }
      });

      const totalUsers = userMap.size;
      const totalCards = cards.length;                     // ✅ добавлено
      let maxCards = 0;
      for (const { count } of userMap.values()) {
        if (count > maxCards) maxCards = count;
      }

      statsInfoList.innerHTML = '';
      statsUsersList.innerHTML = '';

      // Порядок полей строго по макету (с учетом добавленного поля):
      statsInfoList.append(createInfoString("Всего пользователей:", totalUsers));
      statsInfoList.append(createInfoString("Всего карточек:", totalCards));   // ✅ добавлено
      statsInfoList.append(createInfoString("Максимум карточек от одного:", maxCards));
      statsInfoList.append(createInfoString("Первая создана:", formatDate(minDate)));
      statsInfoList.append(createInfoString("Последняя создана:", formatDate(maxDate)));

      const userTemplate = document.getElementById("popup-info-user-preview-template");
      const sortedUsers = Array.from(userMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      
      sortedUsers.forEach(({ name }) => {
        if (userTemplate) {
          const clone = userTemplate.content.cloneNode(true);
          const listItem = clone.querySelector(".popup__list-item");
          if (listItem) listItem.textContent = name;
          statsUsersList.appendChild(clone);
        }
      });

      if (statsModal) openModalWindow(statsModal);
    })
    .catch(err => {
      console.error("Ошибка загрузки статистики:", err);
      // Вместо alert показываем сообщение внутри модального окна
      statsInfoList.innerHTML = '<p class="popup__error-message">Не удалось загрузить статистику</p>';
    });
};

if (logo && statsModal && statsInfoList && statsUsersList) {
  logo.addEventListener("click", handleLogoClick);
}

// ===== Закрытие попапов по оверлею и Escape =====
const allPopups = document.querySelectorAll(".popup");
if (allPopups.length) {
  allPopups.forEach(popup => {
    setCloseModalWindowEventListeners(popup);
  });
}