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
    var first = siteNav.querySelector("a");
    if (first) setTimeout(function(){ first.focus(); }, 50);
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
      if (e.key === "Escape" && siteNav.classList.contains("is-open")){ closeNav(); hamburgerBtn.focus(); }
    });
  }

  /* ---- home: no rule under the header while it sits over the hero photo ---- */
  var siteHeader = document.querySelector(".site-header");
  var hero = document.getElementById("hero");
  if (siteHeader && hero){
    var overHero = function(){
      siteHeader.classList.toggle("over-hero", hero.getBoundingClientRect().bottom > siteHeader.offsetHeight);
    };
    overHero();
    window.addEventListener("scroll", overHero, { passive: true });
    window.addEventListener("resize", overHero);
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

    function mark(i, on){
      if (!acDots[i]) return;
      acDots[i].classList.toggle("is-active", on);
      if (on) acDots[i].setAttribute("aria-current", "true"); else acDots[i].removeAttribute("aria-current");
    }
    function acShow(i){
      acImages[acIndex].classList.remove("is-active");
      mark(acIndex, false);
      acIndex = (i + acImages.length) % acImages.length;
      acImages[acIndex].classList.add("is-active");
      mark(acIndex, true);
    }
    function acStart(){
      clearInterval(acTimer);
      if (!reduce && !window.__acPaused && acImages.length > 1) acTimer = setInterval(function(){ acShow(acIndex + 1); }, 2000);
    }
    function acStop(){ clearInterval(acTimer); }

    /* prev / next arrows over the photo (added here because content.js
       rebuilds the frame's images from the admin) */
    var frame = aboutCarousel.querySelector(".about-carousel-frame");
    if (frame && acImages.length > 1){
      [["prev", "‹", "Previous photo", -1], ["next", "›", "Next photo", 1]].forEach(function(a){
        var btn = frame.querySelector(".about-carousel-arrow--" + a[0]);
        if (!btn){
          btn = document.createElement("button");
          btn.type = "button";
          btn.className = "about-carousel-arrow about-carousel-arrow--" + a[0];
          btn.textContent = a[1];
          frame.appendChild(btn);
        }
        btn.setAttribute("aria-label", window.I18N ? window.I18N.t(a[2]) : a[2]);
        btn.onclick = function(){ acStop(); acShow(acIndex + a[3]); acStart(); };
      });
    }

    acDots.forEach(function(dot, i){
      dot.onclick = function(){ acStop(); acShow(i); acStart(); };
    });
    mark(0, true);
    aboutCarousel.onmouseenter = acStop;
    aboutCarousel.onmouseleave = acStart;

    /* explicit pause / play button (WCAG 2.2.2) */
    var toggle = document.getElementById("acToggle");
    if (toggle){
      var paint = function(){
        toggle.setAttribute("aria-pressed", String(!!window.__acPaused));
        toggle.textContent = window.I18N ? window.I18N.t(window.__acPaused ? "Play" : "Pause") : (window.__acPaused ? "Play" : "Pause");
      };
      toggle.onclick = function(){ window.__acPaused = !window.__acPaused; paint(); if (window.__acPaused) acStop(); else acStart(); };
      paint();
      document.addEventListener("langchange", paint);
    }
    acStart();
  };

  /* pause / play the work marquee on the home page */
  var marqueeToggle = document.getElementById("marqueeToggle");
  var marqueeBox = document.getElementById("workCarousel");
  if (marqueeToggle && marqueeBox){
    var paintMarquee = function(){
      var p = marqueeBox.classList.contains("is-paused");
      marqueeToggle.setAttribute("aria-pressed", String(p));
      marqueeToggle.textContent = window.I18N ? window.I18N.t(p ? "Play" : "Pause") : (p ? "Play" : "Pause");
    };
    marqueeToggle.addEventListener("click", function(){ marqueeBox.classList.toggle("is-paused"); paintMarquee(); });
    document.addEventListener("langchange", paintMarquee);
    paintMarquee();

    /* arrows: glide the ribbon one tile back/forward by easing the CSS
       animation's clock (the loop is seamless, so time wraps freely) */
    var mTrack = marqueeBox.querySelector(".work-carousel-track");
    var nudge = function(dir){
      var anim = mTrack && mTrack.getAnimations ? mTrack.getAnimations()[0] : null;
      var item = mTrack && mTrack.querySelector(".work-carousel-item");
      if (!anim || !item) return;
      var dur = anim.effect.getComputedTiming().duration;
      var gap = parseFloat(getComputedStyle(mTrack).columnGap) || 0;
      var step = (item.offsetWidth + gap) / (mTrack.offsetWidth / 2) * dur;
      var from = anim.currentTime || 0;
      if (dir < 0 && from < step) from += dur;
      var to = from + dir * step, t0 = performance.now();
      (function tick(now){
        var k = Math.min(1, (now - t0) / 450), e = 1 - Math.pow(1 - k, 3);
        anim.currentTime = from + (to - from) * e;
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    };
    var arrows = [["prev", "‹", "Previous project", -1], ["next", "›", "Next project", 1]].map(function(a){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "about-carousel-arrow work-carousel-arrow about-carousel-arrow--" + a[0];
      b.textContent = a[1];
      b.addEventListener("click", function(){ nudge(a[3]); });
      marqueeBox.appendChild(b);
      return [b, a[2]];
    });
    var paintArrows = function(){
      arrows.forEach(function(x){ x[0].setAttribute("aria-label", window.I18N ? window.I18N.t(x[1]) : x[1]); });
    };
    document.addEventListener("langchange", paintArrows);
    paintArrows();
  }
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

  /* ---- contact form (Web3Forms — a free backend for static sites; sent with
     fetch so the page doesn't reload) ---- */
  var contactForm = document.querySelector(".contact-form");
  if (contactForm){
    var cfStatus = document.getElementById("cfStatus");
    var cfSubmit = document.getElementById("cfSubmit");
    var tr = function(s){ return window.I18N ? window.I18N.t(s) : s; };
    var say = function(msg, ok){ cfStatus.textContent = tr(msg); cfStatus.className = "cf-status " + (ok ? "is-ok" : "is-err"); };

    contactForm.addEventListener("submit", function(e){
      e.preventDefault();
      var name = contactForm.elements["name"], email = contactForm.elements["email"], msg = contactForm.elements["message"];
      var valid = true;
      [[name, name.value.trim()], [email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())], [msg, msg.value.trim()]].forEach(function(p){
        p[0].setAttribute("aria-invalid", p[1] ? "false" : "true");
        if (!p[1]) valid = false;
      });
      if (!valid){ say("Please fill in your name, a valid email and a message.", false); return; }

      contactForm.elements["language"].value = window.I18N ? window.I18N.lang : "en";
      /* a subject with the sender's name reads like a real enquiry to Gmail and is easy to filter */
      contactForm.elements["subject"].value = "Nueva consulta de " + name.value.trim() + " (web)";
      cfSubmit.disabled = true;
      cfStatus.className = "cf-status"; cfStatus.textContent = tr("Sending…");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
      }).then(function(res){ return res.json().then(function(data){ return { ok: res.ok && data.success, data: data }; }); })
        .then(function(r){
          if (!r.ok) throw new Error(r.data && r.data.message);
          contactForm.reset();
          cfStatus.textContent = ""; cfStatus.className = "cf-status";
          /* swap the form for the big thank-you block */
          var thanks = document.getElementById("cfThanks");
          contactForm.hidden = true;
          thanks.hidden = false;
          thanks.scrollIntoView({ behavior: "smooth", block: "center" });
          thanks.focus({ preventScroll: true });
        }).catch(function(){
          say("Something went wrong. Please try again or email directly.", false);
        }).then(function(){ cfSubmit.disabled = false; });
    });

    var cfAgain = document.getElementById("cfAgain");
    if (cfAgain) cfAgain.addEventListener("click", function(){
      document.getElementById("cfThanks").hidden = true;
      contactForm.hidden = false;
      contactForm.elements["name"].focus();
    });
  }

  /* ---- footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
