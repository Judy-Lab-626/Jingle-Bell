(() => {
  const gallery = document.querySelector("#gallery");
  const count = document.querySelector("#photo-count");
  const dialog = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxTitle = document.querySelector("#lightbox-title");
  const lightboxMeta = document.querySelector("#lightbox-meta");
  const slideshowButton = document.querySelector("#slideshow-button");
  const hint = document.querySelector("#slideshow-hint");
  let photos = Array.isArray(window.PHOTOS) ? [...window.PHOTOS] : [];
  let currentIndex = 0;
  let timer = null;
  let isPlaying = false;

  document.querySelector("#year").textContent = new Date().getFullYear();

  function render() {
    gallery.innerHTML = "";
    count.textContent = `${photos.length} PHOTOS`;
    if (!photos.length) {
      document.querySelector("#empty-state").hidden = false;
      return;
    }
    document.querySelector("#empty-state").hidden = true;
    photos.forEach((photo, index) => {
      const card = document.createElement("article");
      card.className = "photo-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `查看照片：${photo.title || "未命名"}`);
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt || photo.title || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = () => { card.style.display = "none"; };
      const caption = document.createElement("div");
      caption.className = "photo-caption";
      const title = document.createElement("strong");
      title.textContent = photo.title || "Untitled";
      const meta = document.createElement("span");
      meta.textContent = photo.location || "";
      caption.append(title, meta);
      card.append(img, caption);
      card.addEventListener("click", () => openPhoto(index, false));
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPhoto(index, false); }
      });
      gallery.append(card);
    });
  }

  function showPhoto(index) {
    if (!photos.length) return;
    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt || photo.title || "";
    lightboxTitle.textContent = photo.title || "Untitled";
    lightboxMeta.textContent = [photo.location, `${currentIndex + 1} / ${photos.length}`].filter(Boolean).join(" · ");
  }

  function openPhoto(index, autoplay) {
    showPhoto(index);
    if (!dialog.open) dialog.showModal();
    if (autoplay) startSlideshow();
    else stopSlideshow();
  }

  function startSlideshow() {
    stopSlideshow();
    isPlaying = true;
    hint.hidden = false;
    slideshowButton.textContent = "Ⅱ 暂停播放";
    timer = setInterval(() => showPhoto(currentIndex + 1), 4000);
  }

  function stopSlideshow() {
    if (timer) clearInterval(timer);
    timer = null;
    isPlaying = false;
    hint.hidden = true;
    slideshowButton.textContent = "▶ 全屏播放";
  }

  function closeDialog() {
    stopSlideshow();
    if (dialog.open) dialog.close();
  }

  slideshowButton.addEventListener("click", () => {
    if (dialog.open && isPlaying) { stopSlideshow(); return; }
    openPhoto(0, true);
  });
  document.querySelector("#close-lightbox").addEventListener("click", closeDialog);
  document.querySelector("#previous-photo").addEventListener("click", () => showPhoto(currentIndex - 1));
  document.querySelector("#next-photo").addEventListener("click", () => showPhoto(currentIndex + 1));
  dialog.addEventListener("click", e => {
    if (e.target === dialog) closeDialog();
    else if (e.target === hint) isPlaying ? stopSlideshow() : startSlideshow();
  });
  dialog.addEventListener("close", stopSlideshow);
  document.addEventListener("keydown", e => {
    if (!dialog.open) return;
    if (e.key === "ArrowLeft") showPhoto(currentIndex - 1);
    if (e.key === "ArrowRight") showPhoto(currentIndex + 1);
    if (e.key === "Escape") stopSlideshow();
    if (e.key === " ") { e.preventDefault(); isPlaying ? stopSlideshow() : startSlideshow(); }
  });

  document.querySelector("#shuffle-button").addEventListener("click", () => {
    for (let i = photos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [photos[i], photos[j]] = [photos[j], photos[i]];
    }
    render();
  });

  render();
})();
