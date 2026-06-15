import { toggleLike, deleteCard as deleteCardApi } from "./api.js";

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (cardData, { onPreviewPicture, currentUserId }) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likesCountSpan = cardElement.querySelector(".card__like-count");
  const title = cardElement.querySelector(".card__title");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  title.textContent = cardData.name;

  // Устанавливаем количество лайков
  likesCountSpan.textContent = cardData.likes.length;

  // Проверяем, лайкнул ли текущий пользователь
  const isLiked = cardData.likes.some(like => like._id === currentUserId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Удаление: показываем кнопку только владельцу
  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", (evt) => {
      evt.stopPropagation();
      // Здесь лучше открыть модальное окно подтверждения,
      // но для простоты используем confirm (позже замените на модалку)
      if (confirm("Вы уверены, что хотите удалить карточку?")) {
        deleteCardApi(cardData._id)
          .then(() => {
            cardElement.remove();
          })
          .catch(err => console.error("Ошибка удаления:", err));
      }
    });
  }

  // Обработчик лайка с запросом к серверу
  likeButton.addEventListener("click", () => {
    const currentlyLiked = likeButton.classList.contains("card__like-button_is-active");
    toggleLike(cardData._id, currentlyLiked)
      .then((updatedCard) => {
        likeButton.classList.toggle("card__like-button_is-active");
        likesCountSpan.textContent = updatedCard.likes.length;
      })
      .catch(err => console.error("Ошибка лайка:", err));
  });

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: cardData.name, link: cardData.link }));
  }

  return cardElement;
};