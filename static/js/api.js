"use strict";

const apiService = {
  async getImages(page = 1) {
    const response = await fetch(`/api/images?page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async addImage(formData) {
    const response = await fetch("/api/images", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async deleteImage(id) {
    const response = await fetch(`/api/images/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async getComments(imageId, page = 1) {
    const response = await fetch(
      `/api/images/${imageId}/comments?page=${page}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async addComment(imageId, author, content) {
    const response = await fetch(`/api/images/${imageId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ author, content }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async deleteComment(imageId, commentId) {
    const response = await fetch(
      `/api/images/${imageId}/comments/${commentId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },
};
