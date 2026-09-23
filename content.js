/* Public site: pulls content from Supabase and swaps it into the pages.
   If Supabase isn't configured (or a request fails) the static HTML stays as
   is, so the site always renders. Every editable field has an English column
   and a *_es column; the visitor's language (i18n.js) picks which one to show,
   falling back to English when the Spanish one is empty. Loaded after script.js. */
(function(){
  "use strict";
  var cfg = window.SITE_CONFIG;
  if (!cfg || !cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf("YOUR_") === 0 || !window.supabase) return;
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  function lang(){ return window.I18N ? window.I18N.lang : "en"; }
  function t(s){ return window.I18N ? window.I18N.t(s) : s; }
  /* value of field k for the current language, falling back to English */
  function pick(rec, k){
    if (!rec) return "";
    if (lang() === "es"){
      var v = rec[k + "_es"];
      if (Array.isArray(v) ? v.length : v) return v;
    }
    return rec[k];
  }
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* *text* -> highlighted span, and line breaks preserved: a blank line between
     paragraphs becomes a paragraph gap, a single line break becomes <br>.
     Handles text pasted from the admin panel that has real newlines. */
  function rich(s){
    return esc(s)
      .replace(/\*([^*]+)\*/g, '<span class="highlight">$1</span>')
      .replace(/\n[ \t]*\n+/g, "<br><br>")
      .replace(/\n/g, "<br>");
  }
  function $(sel){ return document.querySelector(sel); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function q(table){ return sb.from(table).select("*").order("position", { ascending: true }); }

  var STAR = '<span class="star" aria-hidden="true"></span>';
  var data = { works: [], services: [], lately: [], testimonials: [], settings: {} };
  var photosDone = false;

  /* ---------- renderers ---------- */
  function renderWorkList(works){
    var list = $(".work-list");
    if (!list || !works.length) return;
    var pressed = document.querySelector('.filter-tag[aria-pressed="true"]');
    var current = pressed ? (pressed.getAttribute("data-cat") || "All") : null;
    list.innerHTML = works.map(function(w, i){
      return '<a href="work-detail.html?id=' + esc(w.id) + '" class="work-list-row" data-cats="' + esc((w.categories || []).join(",")) + '">' +
        '<span class="work-list-index">' + pad(i + 1) + '</span>' +
        '<span class="work-list-title">' + esc(pick(w, "title")) + '</span>' +
        '<span class="work-list-meta">' + esc(pick(w, "meta")) + '</span>' +
        (w.logo_url ? '<div class="work-list-media" aria-hidden="true"><img src="' + esc(w.logo_url) + '" alt="" decoding="async"></div>' : "") +
        '</a>';
    }).join("");
    var tags = $(".filter-tags");
    if (tags){
      var seen = [];
      works.forEach(function(w){ (w.categories || []).forEach(function(c){ if (seen.indexOf(c) === -1) seen.push(c); }); });
      tags.innerHTML = ["All"].concat(seen).map(function(c, i){
        return '<button type="button" class="filter-tag" aria-pressed="' + (i === 0) + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
      }).join("");
    }
    if (window.initWorkFilter) window.initWorkFilter(current && current !== "All" ? current : undefined);
  }

  function renderMarquee(works){
    var track = $(".work-carousel-track");
    if (!track || !works.length) return;
    function cats(w){ return (w.categories || []).map(t).join(" · "); }
    function item(w, hidden){
      var title = pick(w, "title");
      var img = w.cover_url || ("https://placehold.co/480x360/e7e2d6/66253D?text=" + encodeURIComponent(w.title));
      return '<a href="work-detail.html?id=' + esc(w.id) + '" class="work-carousel-item"' + (hidden ? ' aria-hidden="true" tabindex="-1"' : "") + ">" +
        '<div class="work-carousel-image"><img src="' + esc(img) + '" alt="" decoding="async"></div>' +
        '<div class="work-carousel-caption"><span class="work-carousel-title">' + esc(title) + "</span>" +
        '<span class="work-carousel-meta">' + esc(cats(w)) + "</span></div></a>";
    }
    track.innerHTML = works.map(function(w){ return item(w, false); }).join("") +
                      works.map(function(w){ return item(w, true); }).join("");
  }

  function renderServices(services){
    var list = $(".services-list");
    if (!list || !services.length) return;
    var full = !!document.querySelector(".page-title") && location.pathname.indexOf("services") !== -1;
    list.innerHTML = services.map(function(s, i){
      var det = pick(s, "details") || [];
      var details = det.length && full
        ? '<ul class="service-detail">' + det.map(function(d){ return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>" : "";
      var cta = full && s.category
        ? '<a href="work.html?filter=' + encodeURIComponent(s.category) + '" class="service-cta">' + esc(t("See related work →")) + "</a>" : "";
      var text = full ? pick(s, "text") : (pick(s, "text") || det.join(", "));
      var Tag = full ? "h2" : "h3";
      return '<div class="service-row">' + STAR + "<div>" +
        "<" + Tag + ' class="service-title">' + (full ? pad(i + 1) + " — " : "") + esc(pick(s, "title")) + "</" + Tag + ">" +
        '<p class="service-text">' + rich(text) + "</p>" + details + cta + "</div>" +
        (s.image_url ? '<div class="service-row-media" aria-hidden="true"><img src="' + esc(s.image_url) + '" alt="" decoding="async"></div>' : "") +
        "</div>";
    }).join("");
  }

  function renderLately(items){
    var grid = $(".lately-grid");
    if (!grid || !items.length) return;
    grid.innerHTML = items.map(function(it, i){
      return '<div class="lately-item"><span class="lately-num">' + pad(i + 1) + "</span><p>" + esc(pick(it, "text")) +
        '</p><span class="lately-status">' + esc(pick(it, "status")) + "</span></div>";
    }).join("");
  }

  var TESTIMONIAL_ACCENTS = ["terracotta", "cyan", "lime", "pink"];

  function renderTestimonials(items){
    var wrap = $(".testimonials");
    if (!wrap) return;
    var section = wrap.closest("section");
    if (!items.length){ if (section) section.style.display = "none"; return; }
    if (section) section.style.display = "";
    wrap.innerHTML = items.map(function(it){
      var role = pick(it, "role");
      return '<div class="testimonial">' +
        '<p class="testimonial-quote">&ldquo;' + rich(pick(it, "quote")) + "&rdquo;</p>" +
        '<button type="button" class="testimonial-more" hidden>' + esc(t("Read more →")) + "</button>" +
        "<cite>" + esc(it.name) + (role ? ", " + esc(role) : "") + "</cite></div>";
    }).join("");
    Array.prototype.forEach.call(wrap.querySelectorAll(".testimonial"), function(card, i){
      var quoteEl = card.querySelector(".testimonial-quote");
      var btn = card.querySelector(".testimonial-more");
      if (quoteEl.scrollHeight - quoteEl.clientHeight < 4) return;
      btn.hidden = false;
      btn.addEventListener("click", function(){
        var it = items[i];
        openTestimonialModal(pick(it, "quote"), it.name, pick(it, "role"), TESTIMONIAL_ACCENTS[i % TESTIMONIAL_ACCENTS.length]);
      });
    });
  }

  /* full-quote modal: blurred/dimmed backdrop, a card with one square corner
     and the rest rounded, a thin color accent bar on top, sliding up into
     place — same recipe as the reference's case-study modal, adapted for a
     testimonial (no photo). Esc / backdrop click / ✕ close it. */
  var tModal, tOverlay, tReturnFocus;
  function closeTestimonialModal(){
    if (!tModal || !tOverlay.classList.contains("is-open")) return;
    tOverlay.classList.remove("is-open");
    document.removeEventListener("keydown", onTestimonialModalKeydown);
    if (tReturnFocus) tReturnFocus.focus();
  }
  function onTestimonialModalKeydown(e){ if (e.key === "Escape") closeTestimonialModal(); }

  function openTestimonialModal(quote, name, role, accent){
    if (!tOverlay){
      tOverlay = document.createElement("div");
      tOverlay.className = "testimonial-modal-overlay";
      tOverlay.addEventListener("click", function(e){ if (e.target === tOverlay) closeTestimonialModal(); });
      tModal = document.createElement("div");
      tModal.className = "testimonial-modal-box";
      tModal.setAttribute("role", "dialog");
      tModal.setAttribute("aria-modal", "true");
      tModal.innerHTML = '<div class="testimonial-modal-accent"></div>' +
        '<button type="button" class="testimonial-modal-close"></button>' +
        '<div class="testimonial-modal-body"><blockquote></blockquote><cite></cite></div>';
      tModal.querySelector(".testimonial-modal-close").addEventListener("click", closeTestimonialModal);
      tOverlay.appendChild(tModal);
      document.body.appendChild(tOverlay);
    }
    tModal.querySelector(".testimonial-modal-accent").style.background = "var(--color-" + accent + ")";
    tModal.querySelector(".testimonial-modal-close").textContent = "✕";
    tModal.querySelector(".testimonial-modal-close").setAttribute("aria-label", t("Close"));
    tModal.querySelector("blockquote").innerHTML = "&ldquo;" + rich(quote) + "&rdquo;";
    tModal.querySelector("cite").textContent = name + (role ? ", " + role : "");

    tReturnFocus = document.activeElement;
    tOverlay.classList.add("is-open");
    document.addEventListener("keydown", onTestimonialModalKeydown);
    tModal.querySelector(".testimonial-modal-close").focus();
  }

  function renderSettings(s){
    var S = function(k){ return pick(s, k); };
    /* landing About blurb */
    var home = document.querySelector("#about .about-simple-copy p");
    if (home && S("home_about")) home.innerHTML = rich(S("home_about"));

    /* About page */
    var copy = document.querySelector("main .about-simple-copy");
    if (copy && $("#aboutCarousel")){
      var paras = ["about_p1", "about_p2", "about_p3", "about_pd"].filter(function(k){ return S(k); });
      if (paras.length) copy.innerHTML = paras.map(function(k){ return "<p>" + rich(S(k)) + "</p>"; }).join("");
      var d = $(".credential-degree"), sc = $(".credential-school");
      if (d && S("degree")) d.textContent = S("degree");
      if (sc && S("school")) sc.textContent = S("school");
      var photos = [];
      try { photos = JSON.parse(s.about_photos || "[]"); } catch (e) {}
      var frame = $(".about-carousel-frame"), dots = $(".about-carousel-dots");
      if (!photosDone && frame && dots && photos.length){
        photosDone = true;
        frame.innerHTML = photos.map(function(p, i){
          return '<img src="' + esc(p) + '" alt="Juana Salonia"' + (i === 0 ? ' class="is-active"' : ' loading="lazy"') + ">";
        }).join("");
        dots.setAttribute("role", "group");
        dots.innerHTML = photos.map(function(p, i){
          return '<button type="button" class="about-carousel-dot' + (i === 0 ? " is-active" : "") + '" aria-label="Photo ' + (i + 1) + '"></button>';
        }).join("");
        if (window.initAboutCarousel) window.initAboutCarousel();
      }
    }

    /* contact points, all pages */
    if (s.linkedin) document.querySelectorAll('a[href*="linkedin.com/in/"]').forEach(function(a){ a.href = s.linkedin; });
    if (s.email){
      document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){ a.href = "mailto:" + s.email; });
      var btn = document.getElementById("copyEmailBtn");
      if (btn){
        btn.setAttribute("data-email", s.email);
        var v = btn.querySelector(".contact-method-value");
        if (v) v.textContent = s.email;
      }
    }
  }

  function renderWorkDetail(works){
    var page = $(".project-copy");
    if (!page) return;
    var id = new URLSearchParams(location.search).get("id");
    var w = works.filter(function(x){ return x.id === id; })[0];
    if (!w) return;
    document.title = pick(w, "title") + " | Juana Salonia";
    var cats = (w.categories || []).map(t);
    var set = function(sel, html){ var el = $(sel); if (el) el.innerHTML = html; };
    set(".page-header .eyebrow", esc(cats.join(" / ")));
    set(".page-header .page-title", esc(pick(w, "title")));
    set(".page-header .page-lede", esc(pick(w, "summary")));
    var hero = $(".project-hero-media");
    if (hero) hero.innerHTML = w.cover_url ? '<img src="' + esc(w.cover_url) + '" alt="' + esc(pick(w, "title")) + '">' : "";
    var facts = document.querySelectorAll(".project-meta > div");
    if (facts.length >= 4){
      facts[0].lastElementChild.textContent = cats.join(", ");
      facts[1].lastElementChild.textContent = pick(w, "year_place") || "";
      facts[2].lastElementChild.textContent = pick(w, "role") || "";
      facts[3].lastElementChild.innerHTML = w.drive_url ? '<a href="' + esc(w.drive_url) + '" target="_blank" rel="noopener" class="link-arrow">' + esc(t("Gallery →")) + '<span class="visually-hidden"> ' + esc(t("(opens in a new tab)")) + "</span></a>" : "";
      facts[3].style.display = w.drive_url ? "" : "none";
    }
    var blocks = page.children;
    var vals = [pick(w, "context"), pick(w, "role_text"), pick(w, "highlights")];
    for (var i = 0; i < blocks.length && i < 3; i++){
      var p = blocks[i].querySelector("p");
      blocks[i].style.display = vals[i] ? "" : "none";
      if (vals[i] && p) p.innerHTML = rich(vals[i]);
    }
    /* photo gallery (masonry grid + lightbox) */
    var gal = $(".gallery-grid");
    if (gal){
      var photos = [];
      try { photos = JSON.parse(w.gallery || "[]"); } catch (e) {}
      if (!photos.length){ gal.style.display = "none"; return; }
      gal.style.display = "";
      var title = pick(w, "title");
      gal.innerHTML = photos.map(function(p, i){
        return '<button type="button" class="gallery-item" data-i="' + i + '" aria-label="' + esc(t("Open photo")) + " " + (i + 1) + '">' +
          '<img src="' + esc(p) + '" alt="' + esc(title) + " — " + (i + 1) + '" loading="lazy" decoding="async"></button>';
      }).join("");
      Array.prototype.forEach.call(gal.querySelectorAll(".gallery-item"), function(b){
        b.addEventListener("click", function(){ openLightbox(photos, parseInt(b.getAttribute("data-i"), 10), title); });
      });
    }
  }

  /* lightbox (native <dialog>: Esc closes, focus is restored to the photo you opened) */
  var lb;
  function openLightbox(photos, start, title){
    if (!lb){
      lb = document.createElement("dialog");
      lb.className = "lightbox";
      lb.innerHTML = '<button type="button" class="lightbox-close" data-act="close"></button>' +
        '<button type="button" class="lightbox-nav lightbox-prev" data-act="prev"></button>' +
        '<img alt=""><button type="button" class="lightbox-nav lightbox-next" data-act="next"></button>' +
        '<p class="lightbox-count" aria-live="polite"></p>';
      document.body.appendChild(lb);
      lb.addEventListener("click", function(e){
        var act = e.target.getAttribute && e.target.getAttribute("data-act");
        if (act === "close" || e.target === lb) lb.close();
        else if (act === "prev") lb.step(-1);
        else if (act === "next") lb.step(1);
      });
      lb.addEventListener("keydown", function(e){
        if (e.key === "ArrowLeft") lb.step(-1);
        else if (e.key === "ArrowRight") lb.step(1);
      });
    }
    var i = start;
    lb.querySelector(".lightbox-close").setAttribute("aria-label", t("Close"));
    lb.querySelector(".lightbox-prev").setAttribute("aria-label", t("Previous"));
    lb.querySelector(".lightbox-next").setAttribute("aria-label", t("Next"));
    lb.querySelector(".lightbox-close").textContent = "✕";
    lb.querySelector(".lightbox-prev").textContent = "‹";
    lb.querySelector(".lightbox-next").textContent = "›";
    function show(){
      var img = lb.querySelector("img");
      img.src = photos[i]; img.alt = title + " — " + (i + 1);
      lb.querySelector(".lightbox-count").textContent = (i + 1) + " / " + photos.length;
      var single = photos.length < 2;
      lb.querySelector(".lightbox-prev").style.display = single ? "none" : "";
      lb.querySelector(".lightbox-next").style.display = single ? "none" : "";
    }
    lb.step = function(d){ i = (i + d + photos.length) % photos.length; show(); };
    show();
    if (!lb.open) lb.showModal();
  }

  function renderAll(){
    renderWorkList(data.works);
    renderMarquee(data.works);
    renderServices(data.services);
    renderLately(data.lately);
    renderTestimonials(data.testimonials);
    renderSettings(data.settings);
    renderWorkDetail(data.works);
    if (window.I18N) window.I18N.apply(document.body);
  }

  /* ---------- load ---------- */
  var needsWorks = $(".work-list") || $(".work-carousel-track") || $(".project-copy");
  Promise.all([
    needsWorks ? q("works") : { data: [] },
    $(".services-list") ? q("services") : { data: [] },
    $(".lately-grid") ? q("lately_items") : { data: [] },
    $(".testimonials") ? q("testimonials") : { data: [] },
    sb.from("site_settings").select("*")
  ]).then(function(r){
    data.works = r[0].data || []; data.services = r[1].data || []; data.lately = r[2].data || [];
    data.testimonials = r[3].data || [];
    (r[4].data || []).forEach(function(row){ data.settings[row.key] = row.value; });
    renderAll();
    document.addEventListener("langchange", renderAll);
  }).catch(function(){ /* keep static fallback */ });
})();
