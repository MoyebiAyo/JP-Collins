/* ============================================================
   JPCOLLINS — Global interactions
   ============================================================ */
(function () {
  "use strict";

  /* ----------  Sticky header  ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----------  Mobile menu  ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    const setMenu = (open) => {
      toggle.classList.toggle("open", open);
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  /* ----------  Reveal on scroll  ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ----------  Animated counters  ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          const dur = 1800;
          const start = performance.now();
          const step = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          cio.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ----------  Footer year  ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ----------  Contact form (demo handler)  ---------- */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]");
      const original = btn.textContent;
      btn.textContent = "Sending…";
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        btn.textContent = "Message sent ✓";
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2600);
      }, 1200);
    });
  }

  /* ----------  Newsletter (demo)  ---------- */
  document.querySelectorAll(".footer-newsletter form").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = f.querySelector("input");
      const btn = f.querySelector("button");
      if (!input || !input.value.trim()) return;
      input.value = "";
      if (btn) {
        const t = btn.textContent;
        btn.textContent = "Subscribed ✓";
        setTimeout(() => (btn.textContent = t), 2400);
      }
    });
  });

  /* ----------  Click-to-play video embeds  ---------- */
  document.querySelectorAll(".thumb[data-video]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      if (thumb.querySelector("iframe")) return; // already playing
      const id = thumb.dataset.video;
      const source = thumb.dataset.source;
      const iframe = document.createElement("iframe");
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("title", thumb.querySelector("img")?.alt || "Video");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      if (source === "youtube") {
        // Use nocookie domain + proper param set to avoid Error 153
        iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
      } else if (source === "drive") {
        iframe.src = "https://drive.google.com/file/d/" + id + "/preview";
      }
      thumb.innerHTML = "";
      thumb.appendChild(iframe);
    });
  });

  /* ----------  Lightbox gallery  ---------- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = document.getElementById("lb-img");
    var lbCaption = document.getElementById("lb-caption");
    var lbPrev = lb.querySelector(".lb-prev");
    var lbNext = lb.querySelector(".lb-next");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    var currentIndex = 0;

    function lbSource(el) {
      var img = el.querySelector("img") || el;
      return { src: img.src, alt: img.alt || "", caption: el.dataset.caption || img.alt || "" };
    }

    function showItem(index) {
      var item = items[index];
      if (!item) return;
      currentIndex = index;
      var data = lbSource(item);
      lbImg.src = data.src;
      lbImg.alt = data.alt;
      lbCaption.textContent = data.caption;
      lbCaption.style.display = data.caption ? "block" : "none";
      // Toggle nav visibility
      var single = items.length <= 1;
      lbPrev.classList.toggle("hidden", single);
      lbNext.classList.toggle("hidden", single);
    }

    function openLb(index) {
      showItem(index);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeLb() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    function nav(dir) {
      var n = (currentIndex + dir + items.length) % items.length;
      showItem(n);
    }

    items.forEach(function (el, i) {
      el.addEventListener("click", function () { openLb(i); });
    });

    // Close button
    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    // Click dark backdrop to close (but not when clicking the image/caption)
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    // Nav buttons
    lbPrev.addEventListener("click", function (e) { e.stopPropagation(); nav(-1); });
    lbNext.addEventListener("click", function (e) { e.stopPropagation(); nav(1); });
    // Keyboard
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") nav(-1);
      else if (e.key === "ArrowRight") nav(1);
    });
    // Swipe support on touch devices
    var touchX = 0;
    lb.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].screenX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      var diff = e.changedTouches[0].screenX - touchX;
      if (Math.abs(diff) > 50) nav(diff > 0 ? -1 : 1);
    }, { passive: true });
  }
})();
