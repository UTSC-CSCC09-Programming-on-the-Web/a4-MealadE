/* global apiService, meact, authService */
"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const [currentPage, getCurrentPage, setCurrentPage] = meact.useState(1);
  const [currentCommentPage, getCurrentCommentPage, setCurrentCommentPage] =
    meact.useState(1);
  const [totalPages, getTotalPages, setTotalPages] = meact.useState(1);
  const [currentImageId, getCurrentImageId, setCurrentImageId] =
    meact.useState(null);
  const [currentImageIndex, getCurrentImageIndex, setCurrentImageIndex] =
    meact.useState(0);
  const [currentImages, getCurrentImages, setCurrentImages] = meact.useState(
    [],
  );
  const [isLoading, getIsLoading, setIsLoading] = meact.useState(false);
  const [isCommentsLoading, getIsCommentsLoading, setIsCommentsLoading] =
    meact.useState(false);
  const [errorMessage, getErrorMessage, setErrorMessage] = meact.useState("");
  const [showAddForm, getShowAddForm, setShowAddForm] = meact.useState(false);
  const [comments, getComments, setComments] = meact.useState([]);
  const [totalImages, getTotalImages, setTotalImages] = meact.useState(0);
  const [currentUser, getCurrentUser, setCurrentUser] = meact.useState(null);
  const [isAuthenticated, getIsAuthenticated, setIsAuthenticated] =
    meact.useState(false);

  const [galleries, getGalleries, setGalleries] = meact.useState([]);
  const [currentGalleryPage, getCurrentGalleryPage, setCurrentGalleryPage] =
    meact.useState(1);
  const [totalGalleryPages, getTotalGalleryPages, setTotalGalleryPages] =
    meact.useState(1);
  const [selectedUserId, getSelectedUserId, setSelectedUserId] =
    meact.useState(null);
  const [isGalleriesLoading, getIsGalleriesLoading, setIsGalleriesLoading] =
    meact.useState(false);

  const [currentView, getCurrentView, setCurrentView] =
    meact.useState("gallery");

  const toggleAddImageBtn = document.querySelector("#toggleAddImage");
  const addImageForm = document.querySelector("#addImageForm");
  const imageDisplay = document.querySelector("#imageDisplay");
  const imageContainer = document.querySelector("#imageContainer");
  const loadingIndicator = document.querySelector("#loadingIndicator");
  const errorMessageEl = document.querySelector("#errorMessage");
  const commentForm = document.querySelector("#commentForm");
  const commentList = document.querySelector("#commentList");
  const commentsLoading = document.querySelector("#commentsLoading");
  const prevCommentsBtn = document.querySelector("#prevComments");
  const nextCommentsBtn = document.querySelector("#nextComments");
  const imageCountSpan = document.querySelector("#imageCount");

  const galleryList = document.querySelector("#galleryList");
  const galleryTitle = document.querySelector("#galleryTitle");
  const galleryOwner = document.querySelector("#galleryOwner");
  const prevGalleriesBtn = document.querySelector("#prevGalleries");
  const nextGalleriesBtn = document.querySelector("#nextGalleries");

  const navAllGalleriesBtn = document.getElementById("navAllGalleries");
  const navCurrentGalleryBtn = document.getElementById("navCurrentGallery");
  const galleryBrowserSection = document.getElementById("galleryBrowser");
  const galleryViewSection = document.getElementById("galleryView");
  const userInfo = document.getElementById("userInfo");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  async function checkAuthState() {
    try {
      const user = await authService.checkAuth();
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      console.log(
        "Auth state updated:",
        user ? "Authenticated" : "Not authenticated",
      );
    } catch (error) {
      console.error("Auth check failed:", error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  }

  function renderLoadingState() {
    if (getIsLoading()) {
      loadingIndicator.style.display = "block";
      loadingIndicator.innerHTML = `<div class="loading-spinner"></div>`;
    } else {
      loadingIndicator.style.display = "none";
    }
  }

  function renderErrorState() {
    const error = getErrorMessage();
    if (error) {
      errorMessageEl.textContent = error;
      errorMessageEl.style.display = "block";
    } else {
      errorMessageEl.style.display = "none";
    }
  }

  function renderAddForm() {
    const shouldShow = getShowAddForm() && getIsAuthenticated();
    addImageForm.style.display = shouldShow ? "block" : "none";
  }

  function renderImageGallery() {
    const images = getCurrentImages();
    const currentIndex = getCurrentImageIndex();
    const currentId = getCurrentImageId();
    const user = getCurrentUser();
    const isAuth = getIsAuthenticated();

    if (images.length === 0) {
      imageContainer.style.display = "none";
      commentForm.style.display = "none";
      document.querySelector("#commentSection").style.display = "none";

      const existingMessage = imageDisplay.querySelector(
        "p:not(#displayAuthor)",
      );
      if (existingMessage) {
        existingMessage.remove();
      }

      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No images yet. Add one to get started!";
      imageDisplay.appendChild(emptyMessage);
      return;
    }

    const existingMessage = imageDisplay.querySelector("p:not(#displayAuthor)");
    if (existingMessage) {
      existingMessage.remove();
    }

    if (currentId && images[currentIndex]) {
      const image = images[currentIndex];
      imageContainer.style.display = "block";

      commentForm.style.display = isAuth ? "block" : "none";

      const commentSection = document.querySelector("#commentSection");
      commentSection.style.display = "block";

      const img = document.querySelector("#currentImage");
      if (img) {
        img.src = `/uploads/${image.filename}`;
        img.alt = image.title;
      }

      const displayTitle = document.querySelector("#displayTitle");
      const displayAuthor = document.querySelector("#displayAuthor");

      if (displayTitle) displayTitle.textContent = image.title;
      if (displayAuthor) {
        displayAuthor.textContent = `By ${image.User ? image.User.username : "Unknown"}`;
      }

      renderNavigationButtons();
      renderImageCount();
    }
  }

  function renderNavigationButtons() {
    const prevButton = document.querySelector("#prevImage");
    const nextButton = document.querySelector("#nextImage");
    const deleteButton = document.querySelector("#deleteImage");
    const images = getCurrentImages();
    const currentIndex = getCurrentImageIndex();
    const page = getCurrentPage();
    const total = getTotalImages();
    const user = getCurrentUser();

    const totalImages = (page - 1) * 10 + images.length;
    const currentImageNumber = (page - 1) * 10 + currentIndex + 1;

    if (prevButton) prevButton.disabled = currentImageNumber === 1;
    if (nextButton) nextButton.disabled = currentImageNumber === totalImages;

    if (deleteButton && images[currentIndex]) {
      const image = images[currentIndex];
      const canDelete = user && image.UserId === user.id;
      deleteButton.style.display = canDelete ? "inline-block" : "none";
    }
  }

  function renderImageCount() {
    const images = getCurrentImages();
    const currentIndex = getCurrentImageIndex();
    const page = getCurrentPage();
    const total = getTotalImages();

    const totalImages = (page - 1) * 10 + images.length;
    const currentImageNumber = (page - 1) * 10 + currentIndex + 1;

    const imageCountContainer = document.querySelector("#imageCount");
    if (imageCountContainer) {
      imageCountContainer.innerHTML = `
        <div>Image ${currentImageNumber} of ${totalImages}</div>
        <div>Total Images in Gallery: ${total}</div>
      `;
    }
  }

  function renderComments() {
    const commentData = getComments();
    const currentCommentPage = getCurrentCommentPage();
    const totalPages = getTotalPages();
    const user = getCurrentUser();
    const isAuth = getIsAuthenticated();

    if (getIsCommentsLoading()) {
      commentsLoading.style.display = "block";
      commentsLoading.innerHTML = `<div class="loading-spinner"></div>`;
    } else {
      commentsLoading.style.display = "none";
    }

    commentList.innerHTML = "";

    if (!isAuth) {
      commentList.innerHTML = `
        <li class="auth-message">
          <div class="auth-message-content">
            <i class="auth-icon">🔒</i>
            <p>Must be signed in to view comments</p>
            <a href="/login.html" class="auth-link">Sign in here</a>
          </div>
        </li>
      `;

      if (prevCommentsBtn) prevCommentsBtn.classList.add("hidden");
      if (nextCommentsBtn) nextCommentsBtn.classList.add("hidden");
      return;
    }

    if (prevCommentsBtn) prevCommentsBtn.classList.remove("hidden");
    if (nextCommentsBtn) nextCommentsBtn.classList.remove("hidden");

    if (commentData.length === 0) {
      commentList.innerHTML =
        "<li>No comments yet. Be the first to comment!</li>";
    } else {
      commentData.forEach((comment) => {
        const li = document.createElement("li");
        const canDelete =
          user &&
          (comment.UserId === user.id ||
            (comment.Image && comment.Image.UserId === user.id));

        li.innerHTML = `
          <strong>${comment.User ? comment.User.username : "Unknown"}</strong> <em>${new Date(comment.createdAt).toLocaleDateString()}</em>
          <p>${comment.content}</p>
          ${canDelete ? `<button class="delete-comment" data-comment-id="${comment.id}">Delete</button>` : ""}
        `;
        commentList.appendChild(li);
      });

      document.querySelectorAll(".delete-comment").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-comment-id");
          deleteComment(id);
        });
      });
    }

    if (commentData.length === 0 || totalPages <= 1) {
      if (prevCommentsBtn) prevCommentsBtn.disabled = true;
      if (nextCommentsBtn) nextCommentsBtn.disabled = true;
    } else {
      if (prevCommentsBtn) prevCommentsBtn.disabled = currentCommentPage === 1;
      if (nextCommentsBtn)
        nextCommentsBtn.disabled = currentCommentPage === totalPages;
    }
  }

  meact.useEffect(() => {
    renderLoadingState();
  }, [isLoading]);

  meact.useEffect(() => {
    renderErrorState();
  }, [errorMessage]);

  meact.useEffect(() => {
    renderAddForm();
  }, [showAddForm, isAuthenticated]);

  meact.useEffect(() => {
    renderImageGallery();
  }, [
    currentImages,
    currentImageIndex,
    currentImageId,
    isAuthenticated,
    currentUser,
  ]);

  meact.useEffect(() => {
    renderComments();
  }, [
    comments,
    currentCommentPage,
    totalPages,
    isCommentsLoading,
    currentUser,
  ]);

  meact.useEffect(() => {
    renderGalleries();
  }, [
    galleries,
    currentGalleryPage,
    totalGalleryPages,
    isGalleriesLoading,
    selectedUserId,
  ]);

  meact.useEffect(() => {
    renderGalleryInfo();
  }, [selectedUserId, galleries, currentUser, isAuthenticated]);

  function loadImages() {
    console.log("Loading images - Page:", getCurrentPage());
    setIsLoading(true);
    setErrorMessage("");

    const selectedUserId = getSelectedUserId();
    apiService
      .getImages(getCurrentPage(), 10, selectedUserId)
      .then((response) => {
        console.log("Images loaded:", response);
        const { data, total, page, totalPages: pages } = response;
        setCurrentPage(page);
        setTotalPages(pages);
        setCurrentImages(data);
        setTotalImages(total);

        if (data.length > 0) {
          setCurrentImageIndex(0);
          setCurrentImageId(data[0].id);
        } else {
          setCurrentImageId(null);
        }
      })
      .catch((error) => {
        setCurrentImages([]);
        setCurrentImageId(null);
        setErrorMessage("Failed to load images: " + error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function loadComments() {
    const currentId = getCurrentImageId();
    const currentCommentPage = getCurrentCommentPage();
    const isAuth = getIsAuthenticated();

    if (!currentId) return;

    if (!isAuth) {
      setComments([]);
      return;
    }

    console.log(
      "Loading comments - Image:",
      currentId,
      "Page:",
      currentCommentPage,
    );
    setIsCommentsLoading(true);

    apiService
      .getComments(currentId, currentCommentPage)
      .then((response) => {
        console.log("Comments loaded:", response);
        const { data, page, totalPages: pages } = response;
        setCurrentCommentPage(page);
        setTotalPages(pages);
        setComments(data);
      })
      .catch((error) => {
        setErrorMessage("Failed to load comments: " + error.message);
      })
      .finally(() => {
        setIsCommentsLoading(false);
      });
  }

  function deleteComment(commentId) {
    setIsCommentsLoading(true);

    apiService
      .deleteComment(getCurrentImageId(), commentId)
      .then(() => {
        setTimeout(() => {
          const currentPage = getCurrentCommentPage();

          if (currentPage > 1 && getComments().length === 1) {
            setCurrentCommentPage(currentPage - 1);
          }
          loadComments();
        }, 0);
      })
      .catch((error) => {
        setErrorMessage("Failed to delete comment: " + error.message);
      })
      .finally(() => {
        setIsCommentsLoading(false);
      });
  }

  function loadGalleries() {
    console.log("Loading galleries - Page:", getCurrentGalleryPage());
    setIsGalleriesLoading(true);
    setErrorMessage("");

    apiService
      .getUsers(getCurrentGalleryPage())
      .then((response) => {
        console.log("Galleries loaded:", response);
        const { data, total, page, totalPages: pages } = response;
        setCurrentGalleryPage(page);
        setTotalGalleryPages(pages);
        setGalleries(data);
      })
      .catch((error) => {
        setGalleries([]);
        setErrorMessage("Failed to load galleries: " + error.message);
      })
      .finally(() => {
        setIsGalleriesLoading(false);
      });
  }

  function loadUserGallery(userId) {
    console.log("Loading user gallery - UserId:", userId);
    setSelectedUserId(userId);
    setCurrentPage(1);
    setCurrentImageIndex(0);
    setCurrentImageId(null);

    setIsLoading(true);
    setErrorMessage("");

    apiService
      .getImages(getCurrentPage(), 10, userId)
      .then((response) => {
        console.log("User gallery loaded:", response);
        const { data, total, page, totalPages: pages } = response;
        setCurrentPage(page);
        setTotalPages(pages);
        setCurrentImages(data);
        setTotalImages(total);

        if (data.length > 0) {
          setCurrentImageIndex(0);
          setCurrentImageId(data[0].id);
        } else {
          setCurrentImageId(null);
        }
      })
      .catch((error) => {
        setCurrentImages([]);
        setCurrentImageId(null);
        setErrorMessage("Failed to load user gallery: " + error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function renderGalleries() {
    const galleriesData = getGalleries();
    const currentGalleryPage = getCurrentGalleryPage();
    const totalGalleryPages = getTotalGalleryPages();
    const selectedUserId = getSelectedUserId();

    if (getIsGalleriesLoading()) {
      galleryList.innerHTML = `<div class="loading-spinner"></div>`;
    } else {
      galleryList.innerHTML = "";

      if (galleriesData.length === 0) {
        galleryList.innerHTML += "<p>No galleries found.</p>";
      } else {
        galleriesData.forEach((gallery) => {
          const div = document.createElement("div");
          div.className = `gallery-item ${gallery.id === selectedUserId ? "active" : ""}`;
          div.innerHTML = `
            <h4>${gallery.username}</h4>
            <p class=\"image-count\">${gallery.imageCount} images</p>
            ${gallery.hasImages ? "<p>Click to browse</p>" : "<p>No images yet</p>"}
          `;
          div.addEventListener("click", () => {
            setSelectedUserId(gallery.id);
            setCurrentPage(1);
            showGalleryView();
            loadImages();
          });
          galleryList.appendChild(div);
        });
      }
    }

    if (galleriesData.length === 0 || totalGalleryPages <= 1) {
      if (prevGalleriesBtn) prevGalleriesBtn.disabled = true;
      if (nextGalleriesBtn) nextGalleriesBtn.disabled = true;
    } else {
      if (prevGalleriesBtn)
        prevGalleriesBtn.disabled = currentGalleryPage === 1;
      if (nextGalleriesBtn)
        nextGalleriesBtn.disabled = currentGalleryPage === totalGalleryPages;
    }
  }

  function renderGalleryInfo() {
    const selectedUserId = getSelectedUserId();
    const galleriesData = getGalleries();
    const currentUser = getCurrentUser();
    if (selectedUserId) {
      const selectedGallery = galleriesData.find(
        (g) => g.id === selectedUserId,
      );
      if (selectedGallery) {
        galleryTitle.textContent = `${selectedGallery.username}'s Gallery`;
        galleryOwner.textContent = `Owned by ${selectedGallery.username}`;

        const canAddImages = currentUser && selectedUserId === currentUser.id;
        toggleAddImageBtn.style.display = canAddImages
          ? "inline-block"
          : "none";
      }
    } else {
      galleryTitle.textContent = "";
      galleryOwner.textContent = "";
      toggleAddImageBtn.style.display = "none";
    }
  }

  toggleAddImageBtn.addEventListener("click", () => {
    if (!getIsAuthenticated()) {
      setErrorMessage("Please log in to add images");
      return;
    }
    setShowAddForm(!getShowAddForm());
  });

  addImageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fileInput = document.querySelector("#imageFile");
    const titleInput = document.querySelector("#imageTitle");
    const file = fileInput.files[0];

    if (!file) {
      setErrorMessage("Please select an image file");
      return;
    }

    if (!titleInput.value) {
      setErrorMessage("Please fill in the title");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", titleInput.value);

    apiService
      .addImage(formData)
      .then(() => {
        setCurrentPage(1);
        loadImages();
        loadGalleries();
        addImageForm.reset();
        setShowAddForm(false);
      })
      .catch((error) => {
        setErrorMessage("Failed to upload image: " + error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  });

  const nextImageBtn = document.querySelector("#nextImage");
  if (nextImageBtn) {
    nextImageBtn.addEventListener("click", () => {
      console.log("Next image clicked");
      const currentIndex = getCurrentImageIndex();
      const currentPage = getCurrentPage();
      const totalPages = getTotalPages();
      const images = getCurrentImages();

      if (currentIndex < images.length - 1) {
        setCurrentImageIndex(currentIndex + 1);
        setCurrentImageId(images[currentIndex + 1].id);
      } else if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
        loadImages();
      }
    });
  }

  const prevImageBtn = document.querySelector("#prevImage");
  if (prevImageBtn) {
    prevImageBtn.addEventListener("click", () => {
      console.log("Previous image clicked");
      const currentIndex = getCurrentImageIndex();
      const currentPage = getCurrentPage();
      const images = getCurrentImages();

      if (currentIndex > 0) {
        setCurrentImageIndex(currentIndex - 1);
        setCurrentImageId(images[currentIndex - 1].id);
      } else if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
        loadImages();
      }
    });
  }

  const deleteImageBtn = document.querySelector("#deleteImage");
  if (deleteImageBtn) {
    deleteImageBtn.addEventListener("click", () => {
      console.log("Delete image clicked - Image:", getCurrentImageId());
      if (!getCurrentImageId()) return;

      setIsLoading(true);

      apiService
        .deleteImage(getCurrentImageId())
        .then(() => {
          console.log("Image deleted successfully");
          const currentIndex = getCurrentImageIndex();
          const currentPage = getCurrentPage();
          const images = getCurrentImages();

          if (currentIndex === images.length - 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setCurrentImageIndex(0);
          } else if (currentIndex > 0) {
            setCurrentImageIndex(currentIndex - 1);
          }

          loadImages();
          loadGalleries();
        })
        .catch((error) => {
          setErrorMessage("Failed to delete image: " + error.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  }

  if (commentForm) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Comment form submitted");

      if (!getCurrentImageId()) {
        setErrorMessage("Please select an image before adding a comment");
        return;
      }

      if (!getIsAuthenticated()) {
        setErrorMessage("Please log in to add comments");
        return;
      }

      const content = document.querySelector("#commentText").value;

      if (!content) {
        setErrorMessage("Please fill in the comment");
        return;
      }

      setIsCommentsLoading(true);

      apiService
        .addComment(getCurrentImageId(), content)
        .then(() => {
          console.log("Comment added successfully");
          commentForm.reset();
          loadComments();
        })
        .catch((error) => {
          if (error.message.includes("404")) {
            setErrorMessage(
              "No image selected. Please select an image before adding a comment.",
            );
          } else {
            setErrorMessage("Failed to add comment: " + error.message);
          }
        })
        .finally(() => {
          setIsCommentsLoading(false);
        });
    });
  }

  if (prevCommentsBtn) {
    prevCommentsBtn.addEventListener("click", () => {
      console.log("Previous comments clicked");
      const currentCommentPage = getCurrentCommentPage();
      if (currentCommentPage > 1) {
        setCurrentCommentPage(currentCommentPage - 1);
        loadComments();
      }
    });
  }

  if (nextCommentsBtn) {
    nextCommentsBtn.addEventListener("click", () => {
      console.log("Next comments clicked");
      const currentCommentPage = getCurrentCommentPage();
      const totalPages = getTotalPages();
      if (currentCommentPage < totalPages) {
        setCurrentCommentPage(currentCommentPage + 1);
        loadComments();
      }
    });
  }

  if (prevGalleriesBtn) {
    prevGalleriesBtn.addEventListener("click", () => {
      console.log("Previous galleries clicked");
      const currentGalleryPage = getCurrentGalleryPage();
      if (currentGalleryPage > 1) {
        setCurrentGalleryPage(currentGalleryPage - 1);
        loadGalleries();
      }
    });
  }

  if (nextGalleriesBtn) {
    nextGalleriesBtn.addEventListener("click", () => {
      console.log("Next galleries clicked");
      const currentGalleryPage = getCurrentGalleryPage();
      const totalGalleryPages = getTotalGalleryPages();
      if (currentGalleryPage < totalGalleryPages) {
        setCurrentGalleryPage(currentGalleryPage + 1);
        loadGalleries();
      }
    });
  }

  if (navAllGalleriesBtn) {
    navAllGalleriesBtn.addEventListener("click", () => {
      showGalleryBrowser();
    });
  }

  if (navCurrentGalleryBtn) {
    navCurrentGalleryBtn.addEventListener("click", () => {
      if (getIsAuthenticated() && getCurrentUser()) {
        setSelectedUserId(getCurrentUser().id);
        setCurrentPage(1);
        showGalleryView();
        loadImages();
      } else {
        const galleriesData = getGalleries();
        if (galleriesData.length > 0) {
          setSelectedUserId(galleriesData[0].id);
          setCurrentPage(1);
          showGalleryView();
          loadImages();
        } else {
          showGalleryBrowser();
          galleryList.innerHTML = "<p>No galleries available yet!</p>";
        }
      }
    });
  }

  function updateAuthUI() {
    const user = getCurrentUser();
    if (user) {
      userInfo.textContent = `Logged in as ${user.username}`;
      userInfo.style.display = "";
      logoutBtn.style.display = "";
      loginBtn.style.display = "none";
    } else {
      userInfo.textContent = "";
      userInfo.style.display = "none";
      logoutBtn.style.display = "none";
      loginBtn.style.display = "";
    }
  }

  if (loginBtn) loginBtn.onclick = () => (window.location.href = "login.html");
  if (logoutBtn)
    logoutBtn.onclick = async () => {
      await authService.logout();
      window.location.reload();
    };

  meact.useEffect(() => {
    updateAuthUI();
  }, [currentUser, isAuthenticated]);

  meact.useEffect(() => {
    if (getCurrentImageId()) {
      setCurrentCommentPage(1);
      loadComments();
    }
  }, [currentImageId]);

  meact.useEffect(() => {
    checkAuthState();
  }, []);

  console.log("DOM loaded - Initializing application");
  checkAuthState().then(() => {
    loadGalleries();
    loadImages();
  });

  function showGalleryBrowser() {
    setCurrentView("browser");
    galleryBrowserSection.style.display = "";
    galleryViewSection.style.display = "none";
    navAllGalleriesBtn.classList.add("active");
    navCurrentGalleryBtn.classList.remove("active");
  }

  function showGalleryView() {
    setCurrentView("gallery");
    galleryBrowserSection.style.display = "none";
    galleryViewSection.style.display = "";
    navAllGalleriesBtn.classList.remove("active");
    navCurrentGalleryBtn.classList.add("active");
  }

  showGalleryView();

  function showDefaultGallery() {
    if (getIsAuthenticated() && getCurrentUser()) {
      setSelectedUserId(getCurrentUser().id);
      setCurrentPage(1);
      showGalleryView();
      loadImages();
    } else {
      showGalleryBrowser();
    }
  }

  meact.useEffect(() => {
    if (isAuthenticated && currentUser) {
      showDefaultGallery();
    }
  }, [isAuthenticated, currentUser]);

  showDefaultGallery();
});
