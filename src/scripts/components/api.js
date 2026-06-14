const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "6754474d-5b84-47e5-9e34-4ed66ebc5fbc",
    "Content-Type": "application/json",
  },
};

const checkResponse = (res) => {
  if (res.ok) return res.json();
  return Promise.reject(`Ошибка: ${res.status}`);
};

// Пользователь
export const getUserInfo = () =>
  fetch(`${config.baseUrl}/users/me`, { headers: config.headers }).then(checkResponse);

export const updateUserInfo = (name, about) =>
  fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ name, about }),
  }).then(checkResponse);

export const updateUserAvatar = (avatar) =>
  fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ avatar }),
  }).then(checkResponse);

// Карточки
export const getCardList = () =>
  fetch(`${config.baseUrl}/cards`, { headers: config.headers }).then(checkResponse);

export const addCard = (name, link) =>
  fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({ name, link }),
  }).then(checkResponse);

export const deleteCardApi = (cardId) =>
  fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(checkResponse);

export const likeCardApi = (cardId) =>
  fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: "PUT",
    headers: config.headers,
  }).then(checkResponse);

export const unlikeCardApi = (cardId) =>
  fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(checkResponse);

// Универсальная функция для переключения лайка
export const toggleLike = (cardId, isLiked) => {
  const method = isLiked ? unlikeCardApi : likeCardApi;
  return method(cardId);
};