(function(){
  "use strict";

  /* ---- hamburger nav ---- */
  var hamburgerBtn = document.getElementById("hamburgerBtn");
  var siteNav = document.getElementById("siteNav");

  function closeNav(){
    hamburgerBtn.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    siteNav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function openNav(){
    hamburgerBtn.setAttribute("aria-expanded", "true");
    siteNav.classList.add("is-open");
    siteNav.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  if (hamburgerBtn && siteNav){
    hamburgerBtn.addEventListener("click", function(){
      var isOpen = hamburgerBtn.getAttribute("aria-expanded") === "true";
      isOpen ? closeNav() : openNav();
    });
    siteNav.querySelectorAll("[data-nav-link]").forEach(function(link){
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---- scroll reveal ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -5% 0px" });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in-view"); });
  }

  /* ---- about photo carousel (About page); re-runnable after content.js swaps photos ---- */
  var acTimer;
  window.initAboutCarousel = function(){
    var aboutCarousel = document.getElementById("aboutCarousel");
    if (!aboutCarousel) return;
    clearInterval(acTimer);
    var acImages = aboutCarousel.querySelectorAll(".about-carousel-frame img");
    var acDots = aboutCarousel.querySelectorAll(".about-carousel-dot");
    if (!acImages.length) return;
    var acIndex = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function acShow(i){
      acImages[acIndex].classList.remove("is-active");
      if (acDots[acIndex]) acDots[acIndex].classList.remove("is-active");
      acIndex = (i + acImages.length) % acImages.length;
      acImages[acIndex].classList.add("is-active");
      if (acDots[acIndex]) acDots[acIndex].classList.add("is-active");
    }
    function acStart(){ clearInterval(acTimer); if (!reduce && acImages.length > 1) acTimer = setInterval(function(){ acShow(acIndex + 1); }, 4500); }
    function acStop(){ clearInterval(acTimer); }

    acDots.forEach(function(dot, i){
      dot.onclick = function(){ acStop(); acShow(i); acStart(); };
    });
    aboutCarousel.onmouseenter = acStop;
    aboutCarousel.onmouseleave = acStart;
    acStart();
  };
  window.initAboutCarousel();

  /* ---- work filter tags (Selected Work page); supports ?filter=Podcast ---- */
  function catOf(t){ return t.getAttribute("data-cat") || t.textContent.trim(); }
  window.initWorkFilter = function(initial){
    var filterTags = document.querySelectorAll(".filter-tag");
    if (!filterTags.length) return;
    var workRows = document.querySelectorAll(".work-list-row[data-cats]");
    function applyFilter(name){
      filterTags.forEach(function(t){
        t.setAttribute("aria-pressed", catOf(t) === name ? "true" : "false");
      });
      workRows.forEach(function(row){
        var show = name === "All" || row.getAttribute("data-cats").split(",").map(function(c){ return c.trim(); }).indexOf(name) !== -1;
        row.hidden = !show;
      });
    }
    filterTags.forEach(function(tag){
      tag.onclick = function(){ applyFilter(catOf(tag)); };
    });
    var wanted = initial || new URLSearchParams(window.location.search).get("filter");
    var known = Array.prototype.map.call(filterTags, catOf);
    if (wanted && known.indexOf(wanted) !== -1) applyFilter(wanted);
  };
  window.initWorkFilter();

  /* ---- copy email to clipboard (Contact page) ---- */
  var copyEmailBtn = document.getElementById("copyEmailBtn");
  if (copyEmailBtn){
    var copyEmailAction = document.getElementById("copyEmailAction");
    var defaultLabel = "Click to copy →";
    copyEmailBtn.addEventListener("click", function(){
      var email = copyEmailBtn.getAttribute("data-email");
      function showCopied(){
        copyEmailAction.textContent = window.I18N ? window.I18N.t("Copied ✓") : "Copied ✓";
        setTimeout(function(){ copyEmailAction.textContent = window.I18N ? window.I18N.t(defaultLabel) : defaultLabel; }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(email).then(showCopied, function(){
          window.location.href = "mailto:" + email;
        });
      } else {
        window.location.href = "mailto:" + email;
      }
    });
  }

  /* ---- footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
