import { toggleLike, deleteCard as deleteCardApi } from "./api.js";

const getTemplate = () => {
  const template = document.getElementById("card-template");
  if (!template) {
    console.error("Шаблон #card-template не найден в DOM");
    return null;
  }
  const cardNode = template.content.querySelector(".card");
  if (!cardNode) {
    console.error("В шаблоне #card-template нет элемента с классом .card");
    return null;
  }
  return cardNode.cloneNode(true);
};

export const createCardElement = (cardData, { onPreviewPicture, onDeleteCard, currentUserId }) => {
  const cardElement = getTemplate();
  if (!cardElement) {
    console.error("Не удалось создать карточку – шаблон не загружен");
    return document.createElement("div");
  }

  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likesCountSpan = cardElement.querySelector(".card__like-count");
  const title = cardElement.querySelector(".card__title");

  if (!cardImage || !title || !likesCountSpan) {
    console.error("В карточке отсутствуют обязательные элементы");
    return cardElement;
  }

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  title.textContent = cardData.name;
  likesCountSpan.textContent = cardData.likes.length;

  if (likeButton) {
    const isLiked = cardData.likes.some(like => like._id === currentUserId);
    if (isLiked) likeButton.classList.add("card__like-button_is-active");
    likeButton.addEventListener("click", () => {
      const currentlyLiked = likeButton.classList.contains("card__like-button_is-active");
      toggleLike(cardData._id, currentlyLiked)
        .then((updatedCard) => {
          likeButton.classList.toggle("card__like-button_is-active");
          likesCountSpan.textContent = updatedCard.likes.length;
        })
        .catch(err => console.error("Ошибка лайка:", err));
    });
  }

  if (deleteButton) {
    if (cardData.owner._id !== currentUserId) {
      deleteButton.remove();
    } else {
      deleteButton.addEventListener("click", (evt) => {
        evt.stopPropagation();
        if (onDeleteCard) onDeleteCard(cardElement, cardData._id);
      });
    }
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: cardData.name, link: cardData.link }));
  }

  return cardElement;
};