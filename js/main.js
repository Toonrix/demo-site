/* =========================================================
   ARYTSU — interactions & animations
   ========================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navbar: shadow/blur on scroll ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var mobile = document.getElementById("navMobile");
  toggle.addEventListener("click", function () {
    var open = mobile.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mobile.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mobile.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up numbers ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-countup")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1500;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll("[data-countup]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    counters.forEach(function (el) {
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      el.textContent = prefix + (el.getAttribute("data-countup")) + suffix;
    });
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- FAQ: smooth single-open accordion ---------- */
  var faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(function (item) {
    var summary = item.querySelector("summary");
    var answer = item.querySelector(".faq__answer");

    summary.addEventListener("click", function (e) {
      e.preventDefault();

      if (item.open) {
        collapse(item, answer);
      } else {
        // close siblings
        faqItems.forEach(function (other) {
          if (other !== item && other.open) collapse(other, other.querySelector(".faq__answer"));
        });
        expand(item, answer);
      }
    });
  });

  function expand(item, answer) {
    item.open = true;
    if (prefersReduced) { answer.style.height = "auto"; return; }
    var h = answer.scrollHeight;
    answer.style.height = "0px";
    requestAnimationFrame(function () {
      answer.style.transition = "height .35s cubic-bezier(.16,1,.3,1)";
      answer.style.height = h + "px";
    });
    answer.addEventListener("transitionend", function te() {
      answer.style.height = "auto";
      answer.style.transition = "";
      answer.removeEventListener("transitionend", te);
    });
  }

  function collapse(item, answer) {
    if (prefersReduced) { item.open = false; return; }
    var h = answer.scrollHeight;
    answer.style.height = h + "px";
    answer.style.transition = "height .3s cubic-bezier(.16,1,.3,1)";
    requestAnimationFrame(function () { answer.style.height = "0px"; });
    answer.addEventListener("transitionend", function te() {
      item.open = false;
      answer.style.height = "";
      answer.style.transition = "";
      answer.removeEventListener("transitionend", te);
    });
  }

  /* ---------- Blueprint video facades (click to load YouTube) ---------- */
  document.querySelectorAll(".blueprint__video").forEach(function (facade) {
    var id = facade.getAttribute("data-video-id");
    var isPlaceholder = !id || /^YOUR_VIDEO_ID/i.test(id);

    // Load the real YouTube thumbnail once a valid ID is set.
    if (!isPlaceholder) {
      var img = new Image();
      img.onload = function () { facade.style.backgroundImage = "url(" + img.src + ")"; };
      img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
    }

    facade.addEventListener("click", function () {
      if (isPlaceholder || facade.classList.contains("is-playing")) return;
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      iframe.title = "Video breakdown";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      facade.classList.add("is-playing");
      facade.appendChild(iframe);
    });
  });

  /* ---------- Footer year (auto) ---------- */
  // Keeps copyright current if reused beyond 2026.
  var yearNodes = document.querySelectorAll("[data-year]");
  yearNodes.forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
