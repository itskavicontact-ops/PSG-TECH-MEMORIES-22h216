document.addEventListener("DOMContentLoaded", () => {
  const chapters = document.querySelectorAll(".chapter");
  const navLinks = document.querySelectorAll("nav a");

  const password = prompt("Please enter the password to view the album:");
  if (password !== "22h216") {
    alert("Incorrect password. Access denied.");
    document.body.innerHTML = "<h1>Access Denied. This website is private.</h1>";
    window.stop();
  }

  // ===== Reveal each chapter as it scrolls into view =====
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in-view");
      });
    },
    { threshold: 0.15 }
  );
  chapters.forEach((chapter) => revealObserver.observe(chapter));

  // ===== Highlight nav link for chapter in view =====
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`nav a[href="#${entry.target.id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  chapters.forEach((chapter) => navObserver.observe(chapter));

  // ===== Lightbox (delegated so it works for images added later too) =====
  const lightbox = document.getElementById("lightbox");
  const stage = document.getElementById("lightboxStage");
  const closeBtn = document.getElementById("lightboxClose");

  function openLightbox(sourceEl) {
    stage.innerHTML = "";
    if (sourceEl.tagName === "IMG") {
      const img = document.createElement("img");
      img.src = sourceEl.src;
      img.alt = sourceEl.alt || "";
      stage.appendChild(img);
    } else if (sourceEl.tagName === "VIDEO") {
      const video = document.createElement("video");
      video.src = sourceEl.currentSrc || sourceEl.src;
      video.controls = true;
      video.autoplay = true;
      stage.appendChild(video);
    }
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    stage.innerHTML = "";
  }

  document.addEventListener("click", (e) => {
    const img = e.target.closest(".media-item img");
    if (img) openLightbox(img);
  });

  document.querySelectorAll(".media-item.media-video").forEach((item) => {
    const video = item.querySelector("video");
    const btn = item.querySelector(".play-btn");
    if (!video || !btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (video.paused) { video.play(); btn.style.opacity = "0"; }
      else { video.pause(); btn.style.opacity = "1"; }
    });
    video.addEventListener("click", (e) => e.stopPropagation());
    video.addEventListener("pause", () => (btn.style.opacity = "1"));
    video.addEventListener("ended", () => (btn.style.opacity = "1"));
  });

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  // ===== Batch-reveal the Travelling gallery (fixes the mobile crash) =====
  const travelFigures = document.querySelectorAll('#travel .media-item');
  const BATCH_SIZE = 12;
  let travelRevealed = 0;
  let loadMoreBtn = null;

  travelFigures.forEach((figure, index) => {
    const img = figure.querySelector('img');
    if (img) {
      img.dataset.src = img.getAttribute('src');
      img.removeAttribute('src');
    }
    if (index >= BATCH_SIZE) figure.style.display = 'none';
  });

  function revealTravelBatch() {
    const start = travelRevealed;
    const end = Math.min(start + BATCH_SIZE, travelFigures.length);
    for (let i = start; i < end; i++) {
      const figure = travelFigures[i];
      const img = figure.querySelector('img');
      figure.style.display = '';
      if (img && img.dataset.src) img.src = img.dataset.src;
    }
    travelRevealed = end;
    if (travelRevealed >= travelFigures.length && loadMoreBtn) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'All photos loaded';
    }
  }

  revealTravelBatch();

  const travelSection = document.getElementById('travel');
  if (travelSection && travelFigures.length > BATCH_SIZE) {
    loadMoreBtn = document.createElement('button');
    loadMoreBtn.textContent = 'Load more photos';
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.addEventListener('click', revealTravelBatch);
    travelSection.appendChild(loadMoreBtn);
  }
});