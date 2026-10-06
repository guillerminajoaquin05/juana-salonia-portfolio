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
  /* photos framed in the admin carry their focus point as "#f=x,y" (percent):
     turns it into the object-position that keeps that part of the photo in view */
  function focus(u){
    var m = /#f=(\d{1,3}),(\d{1,3})$/.exec(u || "");
    return m ? ' style="object-position:' + m[1] + "% " + m[2] + '%"' : "";
  }
  function q(table){ return sb.from(table).select("*").order("position", { ascending: true }); }

  var data = { works: [], services: [], lately: [], testimonials: [], collaborators: [], settings: {} };
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
      var media = w.cover_url
        ? '<div class="work-carousel-image"><img src="' + esc(w.cover_url) + '" alt="" decoding="async"' + focus(w.cover_url) + "></div>"
        : '<div class="work-carousel-image work-carousel-image--empty"><span>' + esc(title) + "</span></div>";
      return '<a href="work-detail.html?id=' + esc(w.id) + '" class="work-carousel-item"' + (hidden ? ' aria-hidden="true" tabindex="-1"' : "") + ">" +
        media +
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
      /* category "Contact" = personalised service with no portfolio: link to Contact instead */
      var cta = !full || !s.category ? ""
        : s.category.toLowerCase() === "contact"
          ? '<a href="contact.html" class="service-cta">' + esc(t("Get in touch →")) + "</a>"
          : '<a href="work.html?filter=' + encodeURIComponent(s.category) + '" class="service-cta">' + esc(t("See related work →")) + "</a>";
      var text = full ? pick(s, "text") : (pick(s, "text") || det.join(", "));
      var Tag = full ? "h2" : "h3";
      return '<div class="service-row"><div>' +
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
        openTestimonialModal(pick(it, "quote"), it.name, pick(it, "role"));
      });
    });
  }

  /* full-quote modal: blurred/dimmed backdrop, a card with one square corner
     and the rest rounded, sliding up into
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

  function openTestimonialModal(quote, name, role){
    if (!tOverlay){
      tOverlay = document.createElement("div");
      tOverlay.className = "testimonial-modal-overlay";
      tOverlay.addEventListener("click", function(e){ if (e.target === tOverlay) closeTestimonialModal(); });
      tModal = document.createElement("div");
      tModal.className = "testimonial-modal-box";
      tModal.setAttribute("role", "dialog");
      tModal.setAttribute("aria-modal", "true");
      tModal.innerHTML = '<button type="button" class="testimonial-modal-close"></button>' +
        '<div class="testimonial-modal-body"><blockquote></blockquote><cite></cite></div>';
      tModal.querySelector(".testimonial-modal-close").addEventListener("click", closeTestimonialModal);
      tOverlay.appendChild(tModal);
      document.body.appendChild(tOverlay);
    }
    tModal.querySelector(".testimonial-modal-close").textContent = "✕";
    tModal.querySelector(".testimonial-modal-close").setAttribute("aria-label", t("Close"));
    tModal.querySelector("blockquote").innerHTML = "&ldquo;" + rich(quote) + "&rdquo;";
    tModal.querySelector("cite").textContent = name + (role ? ", " + role : "");

    tReturnFocus = document.activeElement;
    tModal.scrollTop = 0;
    /* flush the closed state first so the blur/fade-in plays on every open,
       including the very first one (when the overlay was just created) */
    void getComputedStyle(tOverlay).opacity;
    tOverlay.classList.add("is-open");
    document.addEventListener("keydown", onTestimonialModalKeydown);
    tModal.querySelector(".testimonial-modal-close").focus();
  }

  function renderSettings(s){
    var S = function(k){ return pick(s, k); };
    /* landing photos chosen in the admin (empty = keep the ones in the HTML) */
    var heroImg = $("#hero .hero-photo-full img");
    if (heroImg && s.hero_image) heroImg.src = s.hero_image;
    var homePhoto = $("#about .about-simple-photo img");
    if (homePhoto && s.home_about_image) homePhoto.src = s.home_about_image;

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
          /* photos kept in the repo get a version tag so edited files aren't served stale from cache */
          if (!/^https?:/.test(p)) p += "?v=3";
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
    if (s.whatsapp_channel) document.querySelectorAll('a[href*="whatsapp.com/channel/"]').forEach(function(a){ a.href = s.whatsapp_channel; });
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

  /* Collage: photos go in groups of three on a 6-column grid — one big photo
     and two stacked small ones, the big one alternating left/right. A last
     group of two is two halves, a single leftover photo goes full width.
     Returns a shape per photo. */
  function collageShapes(n){
    var groups = [];
    for (var left = n; left > 0; left -= 3) groups.push(Math.min(3, left));
    var out = [], flip = false;
    groups.forEach(function(g){
      if (g === 3){ out.push.apply(out, flip ? ["small", "big", "small"] : ["big", "small", "small"]); flip = !flip; }
      else if (g === 2) out.push("half", "half");
      else out.push("full");
    });
    return out;
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
    var linkBox = $(".project-link");
    if (linkBox){
      var labels = { site: "View site →", podcast: "View podcast →", more: "See more →" };
      linkBox.hidden = !w.link_url;
      linkBox.innerHTML = w.link_url ? '<a href="' + esc(w.link_url) + '" target="_blank" rel="noopener" class="btn btn-primary">' + esc(t(labels[w.link_label] || labels.more)) + '<span class="visually-hidden"> ' + esc(t("(opens in a new tab)")) + "</span></a>" : "";
    }
    var facts = document.querySelectorAll(".project-meta > div");
    if (facts.length >= 4){
      /* a fact with no value is hidden instead of showing a bare label */
      [cats.join(", "), pick(w, "year_place") || "", pick(w, "role") || ""].forEach(function(v, k){
        facts[k].lastElementChild.textContent = v;
        facts[k].style.display = v ? "" : "none";
      });
      facts[3].lastElementChild.innerHTML = w.drive_url ? '<a href="' + esc(w.drive_url) + '" target="_blank" rel="noopener" class="link-arrow">' + esc(t("Gallery →")) + '<span class="visually-hidden"> ' + esc(t("(opens in a new tab)")) + "</span></a>" : "";
      facts[3].style.display = w.drive_url ? "" : "none";
      var band = $(".project-facts");
      if (band) band.style.display = Array.prototype.some.call(facts, function(d){ return d.style.display !== "none"; }) ? "" : "none";
    }
    var blocks = page.children;
    var vals = [pick(w, "context"), pick(w, "role_text"), pick(w, "highlights")];
    for (var i = 0; i < blocks.length && i < 3; i++){
      var p = blocks[i].querySelector("p");
      blocks[i].style.display = vals[i] ? "" : "none";
      if (vals[i] && p) p.innerHTML = rich(vals[i]);
    }
    /* photo collage at the top (cover photo first, then the gallery) + lightbox */
    var gal = $(".gallery-grid");
    if (gal){
      var photos = [];
      try { photos = JSON.parse(w.gallery || "[]"); } catch (e) {}
      if (w.cover_url) photos.unshift(w.cover_url);
      photos = photos.filter(function(p, i){ return photos.indexOf(p) === i; });
      if (!photos.length){ gal.style.display = "none"; return; }
      gal.style.display = "";
      var title = pick(w, "title");
      var shapes = collageShapes(photos.length);
      gal.innerHTML = photos.map(function(p, i){
        return '<button type="button" class="gallery-item gallery-item--' + shapes[i] + '" data-i="' + i + '" aria-label="' + esc(t("Open photo")) + " " + (i + 1) + '">' +
          '<img src="' + esc(p) + '" alt="' + esc(title) + " — " + (i + 1) + '"' + (i > 2 ? ' loading="lazy"' : "") + ' decoding="async"' + focus(p) + "></button>";
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

  /* footer logos: every logo gets about the same visual weight from its own
     proportions (wide wordmarks come out lower, square marks taller), times the
     admin's optional size tweak. Rendered once; nothing in it is translated. */
  var collabsDone = false;
  function collabSize(img){
    var r = img.naturalWidth / img.naturalHeight;
    if (!r || !isFinite(r)) return;
    var k = parseFloat(img.getAttribute("data-size")) || 1;
    var hh = Math.min(Math.sqrt(6000 / r), 68) * k, ww = hh * r;
    if (ww > 180 * k){ ww = 180 * k; hh = ww / r; }
    img.width = Math.round(ww); img.height = Math.round(hh);
  }
  function renderCollabs(list){
    var row = $(".collab-row");
    list = list.filter(function(c){ return c.logo_url; });
    if (!row || !list.length || collabsDone) return;
    collabsDone = true;
    row.innerHTML = list.map(function(c){
      var img = '<img class="collab-logo" src="' + esc(c.logo_url) + '" alt="' + esc(c.name) + '" data-size="' + esc(c.size || "1") + '" decoding="async">';
      return c.link_url
        ? '<a class="collab-chip" href="' + esc(c.link_url) + '" target="_blank" rel="noopener">' + img + '<span class="visually-hidden"> (opens in a new tab)</span></a>'
        : '<span class="collab-chip">' + img + "</span>";
    }).join("");
    Array.prototype.forEach.call(row.querySelectorAll("img"), function(img){
      if (img.complete && img.naturalWidth) collabSize(img);
      else img.addEventListener("load", function(){ collabSize(img); });
    });
  }

  function renderAll(){
    renderWorkList(data.works);
    renderMarquee(data.works);
    renderServices(data.services);
    renderLately(data.lately);
    renderTestimonials(data.testimonials);
    renderSettings(data.settings);
    renderWorkDetail(data.works);
    renderCollabs(data.collaborators);
    if (window.I18N) window.I18N.apply(document.body);
  }

  /* ---------- link hygiene ----------
     Everything that ends up in an href/src comes from the admin. Only let
     through https/http links and plain relative paths (e.g. Fotos/web/x.jpg),
     so a pasted "javascript:" or "data:" link can never run on the site. */
  function safeUrl(u){
    u = String(u == null ? "" : u).trim();
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    return /^[a-z][a-z0-9+.-]*:/i.test(u) || u.indexOf("//") === 0 ? "" : u;
  }
  function safeList(json){
    var list = [];
    try { list = JSON.parse(json || "[]"); } catch (e) {}
    return JSON.stringify((Array.isArray(list) ? list : []).map(safeUrl).filter(Boolean));
  }
  function cleanData(){
    data.works.forEach(function(w){
      ["logo_url", "cover_url", "link_url", "drive_url"].forEach(function(k){ w[k] = safeUrl(w[k]); });
      w.gallery = safeList(w.gallery);
    });
    data.services.forEach(function(s){ s.image_url = safeUrl(s.image_url); });
    data.collaborators.forEach(function(c){ c.logo_url = safeUrl(c.logo_url); c.link_url = safeUrl(c.link_url); });
    var st = data.settings;
    ["hero_image", "home_about_image", "linkedin", "whatsapp_channel"].forEach(function(k){ if (k in st) st[k] = safeUrl(st[k]); });
    if ("about_photos" in st) st.about_photos = safeList(st.about_photos);
    if (st.email && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(st.email)) st.email = "";
  }

  /* ---------- load ---------- */
  var needsWorks = $(".work-list") || $(".work-carousel-track") || $(".project-copy");
  Promise.all([
    needsWorks ? q("works") : { data: [] },
    $(".services-list") ? q("services") : { data: [] },
    $(".lately-grid") ? q("lately_items") : { data: [] },
    $(".testimonials") ? q("testimonials") : { data: [] },
    sb.from("site_settings").select("*"),
    $(".collab-row") ? q("collaborators") : { data: [] }
  ]).then(function(r){
    data.works = r[0].data || []; data.services = r[1].data || []; data.lately = r[2].data || [];
    data.testimonials = r[3].data || [];
    data.collaborators = r[5].data || [];
    (r[4].data || []).forEach(function(row){ data.settings[row.key] = row.value; });
    cleanData();
    renderAll();
    document.addEventListener("langchange", renderAll);
  }).catch(function(){ /* keep static fallback */ });
})();
