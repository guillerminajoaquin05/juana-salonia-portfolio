/* Public site: pulls content from Supabase and swaps it into the pages.
   If Supabase isn't configured (or a request fails) the static HTML stays as
   is, so the site always renders. Loaded after script.js. */
(function(){
  "use strict";
  var cfg = window.SITE_CONFIG;
  if (!cfg || !cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf("YOUR_") === 0 || !window.supabase) return;
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* *text* -> highlighted span */
  function rich(s){ return esc(s).replace(/\*([^*]+)\*/g, '<span class="highlight">$1</span>'); }
  function $(sel){ return document.querySelector(sel); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function q(table){ return sb.from(table).select("*").order("position", { ascending: true }); }

  var STAR = '<span class="star" aria-hidden="true"></span>';

  /* ---------- renderers ---------- */
  function renderWorkList(works){
    var list = $(".work-list");
    if (!list || !works.length) return;
    list.innerHTML = works.map(function(w, i){
      return '<a href="work-detail.html?id=' + esc(w.id) + '" class="work-list-row" data-cats="' + esc((w.categories || []).join(",")) + '">' +
        '<span class="work-list-index">' + pad(i + 1) + '</span>' +
        '<span class="work-list-title">' + esc(w.title) + '</span>' +
        '<span class="work-list-meta">' + esc(w.meta) + '</span>' +
        (w.logo_url ? '<div class="work-list-media" aria-hidden="true"><img src="' + esc(w.logo_url) + '" alt=""></div>' : "") +
        '</a>';
    }).join("");
    var tags = $(".filter-tags");
    if (tags){
      var seen = [];
      works.forEach(function(w){ (w.categories || []).forEach(function(c){ if (seen.indexOf(c) === -1) seen.push(c); }); });
      tags.innerHTML = ["All"].concat(seen).map(function(c, i){
        return '<button type="button" class="filter-tag" aria-pressed="' + (i === 0) + '">' + esc(c) + "</button>";
      }).join("");
    }
    if (window.initWorkFilter) window.initWorkFilter();
  }

  function renderMarquee(works){
    var track = $(".work-carousel-track");
    if (!track || !works.length) return;
    function item(w, hidden){
      var img = w.cover_url || ("https://placehold.co/480x360/e7e2d6/66253D?text=" + encodeURIComponent(w.title));
      return '<a href="work-detail.html?id=' + esc(w.id) + '" class="work-carousel-item"' + (hidden ? ' aria-hidden="true" tabindex="-1"' : "") + ">" +
        '<div class="work-carousel-image"><img src="' + esc(img) + '" alt=""></div>' +
        '<div class="work-carousel-caption"><span class="work-carousel-title">' + esc(w.title) + "</span>" +
        '<span class="work-carousel-meta">' + esc((w.categories || []).join(" · ")) + "</span></div></a>";
    }
    track.innerHTML = works.map(function(w){ return item(w, false); }).join("") +
                      works.map(function(w){ return item(w, true); }).join("");
  }

  function renderServices(services){
    var list = $(".services-list");
    if (!list || !services.length) return;
    var full = !!document.querySelector(".page-title") && location.pathname.indexOf("services") !== -1;
    list.innerHTML = services.map(function(s, i){
      var details = (s.details || []).length && full
        ? '<ul class="service-detail">' + s.details.map(function(d){ return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>" : "";
      var cta = full && s.category
        ? '<a href="work.html?filter=' + encodeURIComponent(s.category) + '" class="service-cta">See related work &rarr;</a>' : "";
      var text = full ? s.text : (s.text || (s.details || []).join(", "));
      var Tag = full ? "h2" : "h3";
      return '<div class="service-row">' + STAR + "<div>" +
        "<" + Tag + ' class="service-title">' + (full ? pad(i + 1) + " — " : "") + esc(s.title) + "</" + Tag + ">" +
        '<p class="service-text">' + esc(text) + "</p>" + details + cta + "</div>" +
        (s.image_url ? '<div class="service-row-media" aria-hidden="true"><img src="' + esc(s.image_url) + '" alt=""></div>' : "") +
        "</div>";
    }).join("");
  }

  function renderLately(items){
    var grid = $(".lately-grid");
    if (!grid || !items.length) return;
    grid.innerHTML = items.map(function(it, i){
      return '<div class="lately-item"><span class="lately-num">' + pad(i + 1) + "</span><p>" + esc(it.text) +
        '</p><span class="lately-status">' + esc(it.status) + "</span></div>";
    }).join("");
  }

  function renderSettings(s){
    /* landing About blurb */
    var home = document.querySelector("#about .about-simple-copy p");
    if (home && s.home_about) home.innerHTML = rich(s.home_about);

    /* About page */
    var copy = document.querySelector("main .about-simple-copy");
    if (copy && $("#aboutCarousel")){
      var paras = ["about_p1", "about_p2", "about_p3", "about_pd"].filter(function(k){ return s[k]; });
      if (paras.length) copy.innerHTML = paras.map(function(k){ return "<p>" + rich(s[k]) + "</p>"; }).join("");
      var d = $(".credential-degree"), sc = $(".credential-school");
      if (d && s.degree) d.textContent = s.degree;
      if (sc && s.school) sc.textContent = s.school;
      var photos = [];
      try { photos = JSON.parse(s.about_photos || "[]"); } catch (e) {}
      var frame = $(".about-carousel-frame"), dots = $(".about-carousel-dots");
      if (frame && dots && photos.length){
        frame.innerHTML = photos.map(function(p, i){
          return '<img src="' + esc(p) + '" alt="Juana Salonia"' + (i === 0 ? ' class="is-active"' : ' loading="lazy"') + ">";
        }).join("");
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
    document.title = w.title + " | Juana Salonia";
    var cats = (w.categories || []).join(" / ");
    var set = function(sel, html){ var el = $(sel); if (el) el.innerHTML = html; };
    set(".page-header .eyebrow", esc(cats));
    set(".page-header .page-title", esc(w.title));
    set(".page-header .page-lede", esc(w.summary));
    var hero = $(".project-hero-media");
    if (hero) hero.innerHTML = w.cover_url ? '<img src="' + esc(w.cover_url) + '" alt="' + esc(w.title) + '">' : "";
    var facts = document.querySelectorAll(".project-meta > div");
    if (facts.length >= 4){
      facts[0].lastElementChild.textContent = (w.categories || []).join(", ");
      facts[1].lastElementChild.textContent = w.year_place || "";
      facts[2].lastElementChild.textContent = w.role || "";
      facts[3].lastElementChild.innerHTML = w.drive_url ? '<a href="' + esc(w.drive_url) + '" target="_blank" rel="noopener" class="link-arrow">Gallery →</a>' : "";
      if (!w.drive_url) facts[3].style.display = "none";
    }
    var blocks = page.children;
    var vals = [w.context, w.role_text, w.highlights];
    for (var i = 0; i < blocks.length && i < 3; i++){
      var p = blocks[i].querySelector("p");
      if (!vals[i]){ blocks[i].style.display = "none"; continue; }
      if (p) p.innerHTML = esc(vals[i]).replace(/\n+/g, "<br><br>");
    }
    var gal = $(".gallery-grid");
    if (gal) gal.remove();
  }

  /* ---------- load ---------- */
  var needsWorks = $(".work-list") || $(".work-carousel-track") || $(".project-copy");
  Promise.all([
    needsWorks ? q("works") : { data: [] },
    $(".services-list") ? q("services") : { data: [] },
    $(".lately-grid") ? q("lately_items") : { data: [] },
    sb.from("site_settings").select("*")
  ]).then(function(r){
    var works = r[0].data || [], services = r[1].data || [], lately = r[2].data || [];
    var settings = {};
    (r[3].data || []).forEach(function(row){ settings[row.key] = row.value; });
    renderWorkList(works);
    renderMarquee(works);
    renderServices(services);
    renderLately(lately);
    renderSettings(settings);
    renderWorkDetail(works);
  }).catch(function(){ /* keep static fallback */ });
})();
