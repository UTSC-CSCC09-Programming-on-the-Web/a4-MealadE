let apiService = (function () {
  "use strict";
  let module = {};

  const API_BASE_URL = "/api";

  /*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author (derived from User relationship)
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author (derived from User relationship)
        - (String) content
        - (Date) date
  */

  function handleResponse(response) {
    console.log("API Response:", response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  module.addImage = function (formData) {
    console.log("Adding new image:", formData);
    return fetch(`${API_BASE_URL}/images`, {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then(handleResponse);
  };

  module.deleteImage = function (imageId) {
    console.log("Deleting image:", imageId);
    return fetch(`${API_BASE_URL}/images/${imageId}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => true);
  };

  module.getImages = function (page = 1, limit = 10, userId = null) {
    console.log(
      "Fetching images - Page:",
      page,
      "Limit:",
      limit,
      "UserId:",
      userId,
    );
    let url = `${API_BASE_URL}/images?page=${page}&limit=${limit}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    return fetch(url, {
      credentials: "include",
    }).then(handleResponse);
  };

  module.getUserGallery = function (userId, page = 1, limit = 10) {
    console.log(
      "Fetching user gallery - UserId:",
      userId,
      "Page:",
      page,
      "Limit:",
      limit,
    );
    return fetch(
      `${API_BASE_URL}/users/${userId}/gallery?page=${page}&limit=${limit}`,
      {
        credentials: "include",
      },
    ).then(handleResponse);
  };

  module.getImage = function (imageId) {
    console.log("Fetching single image:", imageId);
    return fetch(`${API_BASE_URL}/images/${imageId}`, {
      credentials: "include",
    }).then(handleResponse);
  };

  module.addComment = function (imageId, content) {
    console.log("Adding comment - Image:", imageId, "Content:", content);
    return fetch(`${API_BASE_URL}/images/${imageId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ content }),
    }).then(handleResponse);
  };

  module.getComments = function (imageId, page = 1, limit = 10) {
    console.log(
      "Fetching comments - Image:",
      imageId,
      "Page:",
      page,
      "Limit:",
      limit,
    );
    return fetch(
      `${API_BASE_URL}/images/${imageId}/comments?page=${page}&limit=${limit}`,
      {
        credentials: "include",
      },
    ).then(handleResponse);
  };

  module.deleteComment = function (imageId, commentId) {
    console.log("Deleting comment - Image:", imageId, "Comment:", commentId);
    return fetch(`${API_BASE_URL}/images/${imageId}/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => true);
  };

  module.getUsers = function (page = 1, limit = 10) {
    console.log("Fetching users - Page:", page, "Limit:", limit);
    return fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
      credentials: "include",
    }).then(handleResponse);
  };

  return module;
})();
