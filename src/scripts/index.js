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

const logo = document.querySelector(".header__logo");

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
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModal);
};

// ===== Рендер карточек =====
const renderCards = (cards) => {
  placesWrap.innerHTML = "";
  cards.forEach(card => {
    const cardElement = createCardElement(card, {
      onPreviewPicture: handlePreviewPicture,
      currentUserId: currentUserId,
    });
    placesWrap.append(cardElement);
  });
};

// ===== Загрузка начальных данных (пользователь + карточки) =====
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
  submitBtn.textContent = "Сохранение...";
  updateUserInfo(profileTitleInput.value, profileDescriptionInput.value)
    .then(userData => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModal);
    })
    .catch(err => console.error("Ошибка обновления профиля:", err))
    .finally(() => {
      submitBtn.textContent = "Сохранить";
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
  submitBtn.textContent = "Сохранение...";
  updateUserAvatar(avatarInput.value)
    .then(userData => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModal);
    })
    .catch(err => console.error("Ошибка обновления аватара:", err))
    .finally(() => {
      submitBtn.textContent = "Сохранить";
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
  submitBtn.textContent = "Создание...";
  addCard(cardNameInput.value, cardLinkInput.value)
    .then(newCard => {
      const cardElement = createCardElement(newCard, {
        onPreviewPicture: handlePreviewPicture,
        currentUserId: currentUserId,
      });
      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModal);
    })
    .catch(err => console.error("Ошибка добавления карточки:", err))
    .finally(() => {
      submitBtn.textContent = "Создать";
    });
};
cardForm.addEventListener("submit", handleCardSubmit);

openCardBtn.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModal);
});

// ===== СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ (клик по логотипу) =====
const statsModal = document.querySelector(".popup_type_info");
const statsInfoList = statsModal.querySelector(".popup__info");        // <dl>
const statsUsersList = statsModal.querySelector(".popup__list");       // <ul>

const createInfoString = (label, value) => {
  const template = document.getElementById("popup-info-definition-template");
  const clone = template.content.cloneNode(true);
  clone.querySelector(".popup__info-term").textContent = label;
  clone.querySelector(".popup__info-description").textContent = value;
  return clone;
};

const handleLogoClick = () => {
  getCardList()
    .then(cards => {
      if (!cards.length) return;

      let minDate = new Date(cards[0].createdAt);
      let maxDate = new Date(cards[0].createdAt);
      const userMap = new Map(); // id -> { name, count }

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
      let maxCards = 0;
      for (const { count } of userMap.values()) {
        if (count > maxCards) maxCards = count;
      }

      // ✅ Оптимизированная очистка через innerHTML
      statsInfoList.innerHTML = '';
      statsUsersList.innerHTML = '';

      // Добавление строк статистики в <dl> (порядок соответствует макету)
      statsInfoList.append(createInfoString("Всего пользователей:", totalUsers));
      statsInfoList.append(createInfoString("Максимум карточек от одного:", maxCards));
      statsInfoList.append(createInfoString("Первая создана:", formatDate(minDate)));
      statsInfoList.append(createInfoString("Последняя создана:", formatDate(maxDate)));

      // Список пользователей (сортировка по имени для удобства)
      const userTemplate = document.getElementById("popup-info-user-preview-template");
      const sortedUsers = Array.from(userMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      
      sortedUsers.forEach(({ name }) => {
        const clone = userTemplate.content.cloneNode(true);
        clone.querySelector(".popup__list-item").textContent = name;
        statsUsersList.appendChild(clone);
      });

      openModalWindow(statsModal);
    })
    .catch(err => {
      console.error("Ошибка загрузки статистики:", err);
      alert("Не удалось загрузить статистику");
    });
};

if (logo) logo.addEventListener("click", handleLogoClick);

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

// ===== Закрытие попапов по оверлею и Escape =====
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach(popup => {
  setCloseModalWindowEventListeners(popup);
});