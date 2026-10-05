(function(){
  "use strict";
  var cfg = window.SITE_CONFIG;
  if (!cfg || cfg.SUPABASE_URL.indexOf("YOUR_") === 0){
    document.getElementById("panel").innerHTML = '<p class="empty">Falta configurar Supabase en config.js.</p>';
    return;
  }
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  var panel = document.getElementById("panel");
  var tabsEl = document.getElementById("tabs");

  /* ---------- what can be edited ---------- */
  var LISTS = {
    works: { label: "Trabajos", table: "works", noun: "trabajo", title: "title", view: function(r){ return r ? "work-detail.html?id=" + r.id : "work.html"; }, sub: function(r){ return (r.categories || []).join(", "); },
      fields: [
        { k: "title", l: "Título", t: "text", req: true },
        { k: "title_es", l: "Título (Español)", t: "text", hint: "Opcional. Si lo dejás vacío se usa el título en inglés." },
        { k: "categories", l: "Categorías", t: "tags", hint: "Separadas por coma. Son las que aparecen como filtros en Work (ej: Podcast, Events, Travel, Content, Speaking)." },
        { k: "meta", l: "Línea corta (lista de Work)", t: "text", hint: "Ej: Podcast Production · USA · 2025–Present" },
        { k: "meta_es", l: "Línea corta (Español)", t: "text" },
        { k: "logo_url", l: "Logo (PNG con fondo transparente)", t: "image", hint: "Aparece al pasar el mouse por la fila en Work." },
        { k: "cover_url", l: "Foto de portada", t: "image", hint: "Se usa en la cinta de la home y arriba del caso de estudio." },
        { k: "summary", l: "Resumen (una frase)", t: "textarea", rows: 2 },
        { k: "summary_es", l: "Resumen (Español)", t: "textarea", rows: 2 },
        { k: "year_place", l: "Año y lugar", t: "text" },
        { k: "year_place_es", l: "Año y lugar (Español)", t: "text" },
        { k: "role", l: "Mi rol (corto)", t: "text" },
        { k: "role_es", l: "Mi rol (Español)", t: "text" },
        { k: "gallery", l: "Galería de fotos", t: "gallery", hint: "Se muestran en este orden en la página del trabajo. Podés subir varias juntas; se achican solas." },
        { k: "drive_url", l: "Link a la galería completa (Drive)", t: "text", hint: "Opcional: aparece como enlace \"Gallery\" en los datos del proyecto." },
        { k: "link_url", l: "Enlace del botón (sitio, podcast, etc.)", t: "text", hint: "Opcional: pegá la URL completa (https://...). Si lo dejás vacío, el botón no aparece." },
        { k: "link_label", l: "Texto del botón", t: "select", options: [["site", "Ver sitio"], ["podcast", "Ver podcast"], ["more", "Ver más"]] },
        { k: "context", l: "Contexto", t: "textarea", hint: "Para separar en párrafos, dejá una línea en blanco entre uno y otro." },
        { k: "context_es", l: "Contexto (Español)", t: "textarea" },
        { k: "role_text", l: "Qué hice yo", t: "textarea" },
        { k: "role_text_es", l: "Qué hice yo (Español)", t: "textarea" },
        { k: "highlights", l: "Highlights", t: "textarea" },
        { k: "highlights_es", l: "Highlights (Español)", t: "textarea" }
      ] },
    services: { label: "Servicios", table: "services", noun: "servicio", title: "title", view: function(){ return "services.html"; }, sub: function(r){ return r.category ? "Filtro: " + r.category : ""; },
      fields: [
        { k: "title", l: "Título", t: "text", req: true },
        { k: "title_es", l: "Título (Español)", t: "text" },
        { k: "text", l: "Descripción", t: "textarea", rows: 3 },
        { k: "text_es", l: "Descripción (Español)", t: "textarea", rows: 3 },
        { k: "details", l: "Detalle (uno por línea)", t: "lines" },
        { k: "details_es", l: "Detalle (Español, uno por línea)", t: "lines" },
        { k: "category", l: "Categoría de Work a la que enlaza", t: "text", hint: "Tiene que coincidir con una categoría de los trabajos (ej: Podcast). Si ponés Contact, el botón dice \"Get in touch\" y lleva a la página de contacto (para servicios personalizados sin trabajos para mostrar)." },
        { k: "image_url", l: "Foto (aparece al pasar el mouse)", t: "image" }
      ] },
    lately: { label: "Lately", table: "lately_items", noun: "ítem", title: "text", view: function(){ return "index.html#lately"; }, sub: function(r){ return r.status; },
      fields: [
        { k: "text", l: "Texto", t: "text", req: true },
        { k: "text_es", l: "Texto (Español)", t: "text" },
        { k: "status", l: "Estado", t: "text", hint: "Ej: In progress, Coming up, Done" },
        { k: "status_es", l: "Estado (Español)", t: "text", hint: "Ej: En curso, Próximamente, Listo" }
      ] },
    testimonials: { label: "Testimonios", table: "testimonials", noun: "testimonio", title: "name", view: function(){ return "contact.html"; }, sub: function(r){ return (r.quote || "").slice(0, 50); },
      fields: [
        { k: "quote", l: "Testimonio", t: "textarea", rows: 3, req: true, hint: "Sin comillas: se agregan solas al mostrarlo." },
        { k: "quote_es", l: "Testimonio (Español)", t: "textarea", rows: 3 },
        { k: "name", l: "Nombre de quien lo dice", t: "text", req: true },
        { k: "role", l: "Cargo / empresa", t: "text" },
        { k: "role_es", l: "Cargo / empresa (Español)", t: "text" }
      ] },
    collaborators: { label: "Logos del footer", table: "collaborators", noun: "logo", title: "name", view: function(){ return "index.html"; }, sub: function(r){ return r.link_url ? "Enlace: " + r.link_url : "Sin enlace"; },
      fields: [
        { k: "name", l: "Nombre de la marca", t: "text", req: true, hint: "No se ve en la página: lo leen los buscadores y los lectores de pantalla." },
        { k: "logo_url", l: "Logo", t: "image", logo: "cream", hint: "Subí el logo como lo tengas (PNG, JPG o SVG; mejor con fondo transparente o liso). Se pasa solo al color crema del footer, se recorta y toma el mismo tamaño que el resto." },
        { k: "link_url", l: "Enlace a su página", t: "text", hint: "Opcional: pegá la URL completa (https://...). Al hacer clic en el logo se abre en otra pestaña." },
        { k: "size", l: "Tamaño", t: "select", options: [["0.85", "Un poco más chico"], ["1.15", "Un poco más grande"], ["1", "Normal"]], hint: "Por si algún logo queda visualmente más grande o más chico que los demás." }
      ] }
  };

  var SETTINGS = [
    { group: "Portada (home)", fields: [
      { k: "hero_image", l: "Foto de portada", t: "image", hint: "Foto horizontal. El recorte toma la parte de abajo, así que conviene que la persona esté abajo y el cielo o fondo liso arriba (ahí va el texto). Si la dejás vacía, se usa la de los globos." } ] },
    { group: "Sobre mí (home)", fields: [
      { k: "home_about", l: "Texto corto de la home", t: "textarea", rows: 4, hint: "Para resaltar en negrita, poné *asteriscos* alrededor del texto." },
      { k: "home_about_es", l: "Texto corto de la home (Español)", t: "textarea", rows: 4 },
      { k: "home_about_image", l: "Foto de la sección Sobre mí", t: "image", hint: "La polaroid ya armada (PNG con fondo transparente). Si la dejás vacía, se usa la actual." } ] },
    { group: "Sobre mí (página About)", fields: [
      { k: "about_p1", l: "Párrafo 1", t: "textarea", hint: "Para separar en párrafos dentro de este mismo campo, dejá una línea en blanco entre uno y otro." },
      { k: "about_p1_es", l: "Párrafo 1 (Español)", t: "textarea" },
      { k: "about_p2", l: "Párrafo 2", t: "textarea", hint: "Podés resaltar en negrita con *asteriscos*." },
      { k: "about_p2_es", l: "Párrafo 2 (Español)", t: "textarea" },
      { k: "about_p3", l: "Párrafo 3", t: "textarea" },
      { k: "about_p3_es", l: "Párrafo 3 (Español)", t: "textarea" },
      { k: "about_pd", l: "P.D.", t: "textarea", rows: 2 },
      { k: "about_pd_es", l: "P.D. (Español)", t: "textarea", rows: 2 },
      { k: "degree", l: "Título académico", t: "text" },
      { k: "degree_es", l: "Título académico (Español)", t: "text" },
      { k: "school", l: "Universidad", t: "text" },
      { k: "school_es", l: "Universidad (Español)", t: "text" },
      { k: "about_photos", l: "Fotos del carrusel", t: "gallery", hint: "Se muestran en este orden. Mejor fotos verticales." } ] },
    { group: "Contacto", fields: [
      { k: "email", l: "Email", t: "text" },
      { k: "linkedin", l: "LinkedIn (URL completa)", t: "text" },
      { k: "whatsapp_channel", l: "Canal de WhatsApp (URL completa)", t: "text", hint: "El canal de búsquedas laborales. Aparece en la página de Contact." } ] }
  ];

  /* ---------- helpers ---------- */
  function h(tag, attrs, kids){
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function(k){
      if (k === "class") el.className = attrs[k];
      else if (k === "text") el.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function(c){ if (c) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function say(el, text, ok){ el.textContent = text; el.className = "msg " + (ok ? "ok" : "err"); }
  function slug(name){ return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, ""); }

  /* Shrinks photos before upload: longest side <= 1800px, JPEG ~82%.
     PNGs stay PNG (logos need transparency) but are resized too.
     SVG/GIF and anything the browser can't decode go up untouched. */
  var MAX_SIDE = 1800;
  function compress(file){
    var type = file.type;
    if (type !== "image/jpeg" && type !== "image/png" && type !== "image/webp") return Promise.resolve(file);
    return createImageBitmap(file, { imageOrientation: "from-image" }).then(function(bmp){
      var scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
      var w = Math.round(bmp.width * scale), hgt = Math.round(bmp.height * scale);
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = hgt;
      canvas.getContext("2d").drawImage(bmp, 0, 0, w, hgt);
      var outType = type === "image/png" ? "image/png" : "image/jpeg";
      return new Promise(function(resolve){
        canvas.toBlob(function(blob){
          /* keep the original if we somehow made it bigger */
          if (!blob || (scale === 1 && blob.size >= file.size)) return resolve(file);
          var ext = outType === "image/png" ? ".png" : ".jpg";
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, "") + ext, { type: outType }));
        }, outType, 0.82);
      });
    }).catch(function(){ return file; });
  }

  /* Footer logos: recolor to the footer cream (#FDFAF5), trim the empty
     border and save as PNG, so every logo Juana adds matches the rest.
     The "ink" is whatever contrasts with the background: dark or colored
     marks on white/transparent, or light marks on a dark box. */
  function lum(px, i){ return 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; }
  function creamLogo(file){
    return new Promise(function(resolve, reject){
      var im = new Image();
      im.onload = function(){ resolve(im); };
      im.onerror = function(){ reject(new Error("no se pudo leer la imagen")); };
      im.src = URL.createObjectURL(file);
    }).then(function(im){
      var w = im.naturalWidth || 600, hgt = im.naturalHeight || 300;
      var s = Math.min(800 / w, 800 / hgt);
      if (!/svg/.test(file.type)) s = Math.min(1, s);
      w = Math.max(1, Math.round(w * s)); hgt = Math.max(1, Math.round(hgt * s));
      var cv = document.createElement("canvas"); cv.width = w; cv.height = hgt;
      var ctx = cv.getContext("2d"); ctx.drawImage(im, 0, 0, w, hgt);
      var d = ctx.getImageData(0, 0, w, hgt), px = d.data, i;
      var clear = 0, sum = 0, n = 0;
      for (i = 0; i < px.length; i += 4){ if (px[i + 3] < 20) clear++; else if (px[i + 3] > 200){ sum += lum(px, i); n++; } }
      var corners = [0, (w - 1) * 4, (hgt - 1) * w * 4, ((hgt - 1) * w + w - 1) * 4];
      var bg = corners.reduce(function(a, c){ return a + lum(px, c); }, 0) / 4;
      var mode = clear / (w * hgt) > 0.1 ? (n && sum / n > 200 ? "alpha" : "dark") : (bg < 128 ? "light" : "dark");
      var orig = new Uint8ClampedArray(px);
      var x0, y0, x1, y1;
      /* box = [bx0, by0, bx1, by1]: only pixels inside it can be ink */
      function ink(mode, box){
        var solid = 0;
        x0 = w; y0 = hgt; x1 = -1; y1 = -1;
        for (var y = 0; y < hgt; y++) for (var x = 0; x < w; x++){
          i = (y * w + x) * 4;
          var l = lum(orig, i);
          var t = mode === "alpha" ? 1 : mode === "dark" ? (245 - l) / 30 : (l - 95) / 120;
          var a = Math.round(orig[i + 3] * Math.max(0, Math.min(1, t)));
          if (box && (x < box[0] || x > box[2] || y < box[1] || y > box[3])) a = 0;
          px[i] = 253; px[i + 1] = 250; px[i + 2] = 245; px[i + 3] = a;
          if (a > 128) solid++;
          if (a > 12){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        return solid;
      }
      var solid = ink(mode);
      if (x1 < 0) throw new Error("no se encontró el logo en la imagen");
      /* the "logo" came out as a solid block: it's a light logo on a dark box
         (e.g. white text on a black banner), so take the light marks inside it */
      if (mode === "dark" && solid / ((x1 - x0 + 1) * (y1 - y0 + 1)) > 0.7){
        var b = [x0 + 2, y0 + 2, x1 - 2, y1 - 2];
        ink("light", b);
        if (x1 < 0) throw new Error("no se encontró el logo en la imagen");
      }
      ctx.putImageData(d, 0, 0);
      var out = document.createElement("canvas"); out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
      out.getContext("2d").drawImage(cv, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
      return new Promise(function(resolve){
        out.toBlob(function(blob){ resolve(new File([blob], file.name.replace(/\.[^.]+$/, "") + "-footer.png", { type: "image/png" })); }, "image/png");
      });
    });
  }

  function upload(original, f){
    return (f && f.logo === "cream" ? creamLogo(original) : compress(original)).then(function(file){
      var path = Date.now() + "-" + slug(file.name);
      return sb.storage.from("media").upload(path, file, { cacheControl: "31536000", upsert: false }).then(function(r){
        if (r.error) throw r.error;
        return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
      });
    });
  }

  /* one field -> { el, get() } */
  function buildField(f, value){
    var wrap = h("div", { class: "field" });
    var id = "f-" + f.k;
    wrap.appendChild(h("label", { for: id, text: f.l }));
    var get;

    if (f.t === "text"){
      var i = h("input", { type: "text", id: id, value: value || "" }); i.value = value || "";
      wrap.appendChild(i); get = function(){ return i.value.trim(); };
    } else if (f.t === "textarea"){
      var ta = h("textarea", { id: id, rows: f.rows || 5 }); ta.value = value || "";
      wrap.appendChild(ta); get = function(){ return ta.value.trim(); };
    } else if (f.t === "select"){
      var sel = h("select", { id: id });
      f.options.forEach(function(o){ sel.appendChild(h("option", { value: o[0], text: o[1] })); });
      sel.value = value || f.options[f.options.length - 1][0];
      wrap.appendChild(sel); get = function(){ return sel.value; };
    } else if (f.t === "tags"){
      var ti = h("input", { type: "text", id: id }); ti.value = (value || []).join(", ");
      wrap.appendChild(ti);
      get = function(){ return ti.value.split(",").map(function(s){ return s.trim(); }).filter(Boolean); };
    } else if (f.t === "lines"){
      var li = h("textarea", { id: id, rows: 5 }); li.value = (value || []).join("\n");
      wrap.appendChild(li);
      get = function(){ return li.value.split("\n").map(function(s){ return s.trim(); }).filter(Boolean); };
    } else if (f.t === "image"){
      var url = value || "";
      var box = h("div", { class: "img-field" + (f.logo === "cream" ? " img-field--dark" : "") });
      var prev = h("div");
      var status = h("span", { class: "hint" });
      function paint(){ prev.innerHTML = ""; prev.appendChild(url ? h("img", { src: url, alt: "" }) : h("div", { class: "ph", text: "Sin imagen" })); }
      var file = h("input", { type: "file", accept: "image/*", id: id });
      file.addEventListener("change", function(){
        if (!file.files[0]) return;
        status.textContent = "Subiendo…";
        upload(file.files[0], f).then(function(u){ url = u; paint(); status.textContent = "Listo."; })
          .catch(function(e){ status.textContent = "Error al subir: " + e.message; });
      });
      var clear = h("button", { type: "button", class: "btn btn--ghost btn--sm", text: "Quitar", onclick: function(){ url = ""; paint(); } });
      paint();
      box.appendChild(prev); box.appendChild(h("div", {}, [file, h("div", {}, [clear, status])]));
      wrap.appendChild(box); get = function(){ return url; };
    } else if (f.t === "gallery"){
      var urls = [];
      try { urls = JSON.parse(value || "[]"); } catch (e) {}
      var grid = h("div", { class: "gallery" });
      var gs = h("span", { class: "hint" });
      function draw(){
        grid.innerHTML = "";
        urls.forEach(function(u, idx){
          function mv(dir){ var j = idx + dir; if (j < 0 || j >= urls.length) return; var t = urls[idx]; urls[idx] = urls[j]; urls[j] = t; draw(); }
          var fig = h("figure", {}, [
            h("img", { src: u, alt: "" }),
            h("button", { type: "button", class: "btn btn--sm", text: "✕", "aria-label": "Quitar foto", onclick: function(){ urls.splice(idx, 1); draw(); } }),
            h("div", { class: "gallery-move" }, [
              h("button", { type: "button", class: "btn btn--ghost btn--sm", text: "‹", "aria-label": "Mover antes", disabled: idx === 0 ? "disabled" : false, onclick: function(){ mv(-1); } }),
              h("button", { type: "button", class: "btn btn--ghost btn--sm", text: "›", "aria-label": "Mover después", disabled: idx === urls.length - 1 ? "disabled" : false, onclick: function(){ mv(1); } })
            ])
          ]);
          grid.appendChild(fig);
        });
      }
      var add = h("input", { type: "file", accept: "image/*", multiple: "multiple", id: id });
      add.addEventListener("change", function(){
        var files = Array.prototype.slice.call(add.files); if (!files.length) return;
        gs.textContent = "Subiendo…";
        Promise.all(files.map(upload)).then(function(us){ urls = urls.concat(us); draw(); gs.textContent = "Listo."; })
          .catch(function(e){ gs.textContent = "Error al subir: " + e.message; });
      });
      draw();
      wrap.appendChild(grid); wrap.appendChild(add); wrap.appendChild(gs);
      get = function(){ return JSON.stringify(urls); };
    }
    if (f.hint) wrap.appendChild(h("p", { class: "hint", text: f.hint }));
    return { el: wrap, get: get };
  }

  /* ---------- list tabs ---------- */
  function renderList(key){
    var def = LISTS[key];
    panel.innerHTML = "";
    var head = h("div", { class: "panel-head" }, [
      h("h2", { text: def.label }),
      h("button", { class: "btn", type: "button", text: "+ Agregar " + def.noun, onclick: function(){ openEditor(null); } })
    ]);
    var editorSlot = h("div");
    var rowsEl = h("div", { class: "rows" });
    panel.appendChild(head); panel.appendChild(editorSlot); panel.appendChild(rowsEl);
    var records = [];

    function load(){
      return sb.from(def.table).select("*").order("position", { ascending: true }).then(function(r){
        if (r.error){ rowsEl.innerHTML = ""; rowsEl.appendChild(h("p", { class: "empty", text: "Error: " + r.error.message })); return; }
        records = r.data || []; drawRows();
      });
    }
    function drawRows(){
      rowsEl.innerHTML = "";
      if (!records.length){ rowsEl.appendChild(h("p", { class: "empty", text: "Todavía no hay nada acá." })); return; }
      records.forEach(function(rec, i){
        var t = h("div", { class: "row-title" }, [rec[def.title] || "(sin título)"]);
        var sub = def.sub(rec); if (sub) t.appendChild(h("span", { class: "row-sub", text: sub }));
        rowsEl.appendChild(h("div", { class: "row" }, [
          h("span", { class: "row-num", text: (i < 9 ? "0" : "") + (i + 1) }), t,
          h("div", { class: "row-actions" }, [
            h("button", { class: "btn btn--ghost btn--sm", type: "button", text: "↑", "aria-label": "Subir", disabled: i === 0 ? "disabled" : false, onclick: function(){ move(i, -1); } }),
            h("button", { class: "btn btn--ghost btn--sm", type: "button", text: "↓", "aria-label": "Bajar", disabled: i === records.length - 1 ? "disabled" : false, onclick: function(){ move(i, 1); } }),
            h("a", { class: "btn btn--ghost btn--sm", href: def.view(rec), target: "_blank", rel: "noopener", text: "Ver ↗", "aria-label": "Ver en el sitio (se abre en otra pestaña)" }),
            h("button", { class: "btn btn--ghost btn--sm", type: "button", text: "Editar", onclick: function(){ openEditor(rec); } }),
            h("button", { class: "btn btn--danger btn--sm", type: "button", text: "Borrar", onclick: function(){ remove(rec); } })
          ])
        ]));
      });
    }
    function move(i, dir){
      var a = records[i], b = records[i + dir]; if (!b) return;
      Promise.all([
        sb.from(def.table).update({ position: b.position }).eq("id", a.id),
        sb.from(def.table).update({ position: a.position }).eq("id", b.id)
      ]).then(function(){
        /* positions may be equal on seeded data: renumber to be safe */
        var order = records.slice(); order.splice(i, 1); order.splice(i + dir, 0, a);
        return Promise.all(order.map(function(rec, idx){ return sb.from(def.table).update({ position: idx + 1 }).eq("id", rec.id); }));
      }).then(load);
    }
    function remove(rec){
      if (!confirm("¿Borrar \"" + (rec[def.title] || "") + "\"? No se puede deshacer.")) return;
      sb.from(def.table).delete().eq("id", rec.id).then(function(r){
        if (r.error) alert("Error: " + r.error.message); else load();
      });
    }
    function openEditor(rec){
      editorSlot.innerHTML = "";
      var form = h("form", { class: "editor", novalidate: "novalidate" });
      form.appendChild(h("h3", { text: rec ? "Editar " + def.noun : "Nuevo " + def.noun, style: "margin-bottom:1.25rem" }));
      var built = def.fields.map(function(f){ var b = buildField(f, rec ? rec[f.k] : null); form.appendChild(b.el); return { f: f, b: b }; });
      var m = h("p", { class: "msg", role: "alert" });
      var save = h("button", { class: "btn", type: "submit", text: "Guardar" });
      form.appendChild(h("div", { class: "editor-actions" }, [save,
        h("button", { class: "btn btn--ghost", type: "button", text: "Cancelar", onclick: function(){ editorSlot.innerHTML = ""; } })]));
      form.appendChild(m);
      form.addEventListener("submit", function(e){
        e.preventDefault();
        var payload = {};
        for (var i = 0; i < built.length; i++){
          var v = built[i].b.get();
          if (built[i].f.req && !v){ say(m, "Completá: " + built[i].f.l); return; }
          payload[built[i].f.k] = v;
        }
        save.disabled = true;
        var req = rec
          ? sb.from(def.table).update(payload).eq("id", rec.id)
          : sb.from(def.table).insert(Object.assign({ position: records.length ? Math.max.apply(null, records.map(function(x){ return x.position; })) + 1 : 1 }, payload));
        req.then(function(r){
          save.disabled = false;
          if (r.error){ say(m, "Error: " + r.error.message); return; }
          editorSlot.innerHTML = ""; load();
          toast("Guardado ✓ Ya está publicado.", def.view(rec));
        });
      });
      editorSlot.appendChild(form);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    load();
  }

  /* ---------- settings tab ---------- */
  function renderSettings(){
    panel.innerHTML = "";
    panel.appendChild(h("div", { class: "panel-head" }, [h("h2", { text: "Textos y contacto" })]));
    sb.from("site_settings").select("*").then(function(r){
      if (r.error){ panel.appendChild(h("p", { class: "empty", text: "Error: " + r.error.message })); return; }
      var vals = {}; (r.data || []).forEach(function(x){ vals[x.key] = x.value; });
      var form = h("form", { novalidate: "novalidate" });
      var built = [];
      SETTINGS.forEach(function(g){
        var box = h("section", { class: "setting-group" }, [h("h3", { text: g.group })]);
        g.fields.forEach(function(f){ var b = buildField(f, vals[f.k]); box.appendChild(b.el); built.push({ f: f, b: b }); });
        form.appendChild(box);
      });
      var m = h("p", { class: "msg", role: "alert" });
      var save = h("button", { class: "btn", type: "submit", text: "Guardar cambios" });
      form.appendChild(h("div", { class: "editor-actions" }, [save])); form.appendChild(m);
      form.addEventListener("submit", function(e){
        e.preventDefault(); save.disabled = true;
        var rows = built.map(function(x){ return { key: x.f.k, value: x.b.get() }; });
        sb.from("site_settings").upsert(rows, { onConflict: "key" }).then(function(r){
          save.disabled = false;
          if (r.error) say(m, "Error: " + r.error.message); else { say(m, "Guardado ✓", true); toast("Guardado ✓ Ya está publicado.", "index.html"); }
        });
      });
      panel.appendChild(form);
    });
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(text, viewHref){
    var el = document.getElementById("toast");
    if (!el){ el = h("div", { id: "toast", class: "toast", role: "status" }); document.body.appendChild(el); }
    el.innerHTML = "";
    el.appendChild(document.createTextNode(text));
    if (viewHref) el.appendChild(h("a", { href: viewHref, target: "_blank", rel: "noopener", text: "Ver en el sitio ↗" }));
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.classList.remove("is-on"); }, 7000);
  }

  /* ---------- backup: download everything as one JSON file ---------- */
  function backup(btn){
    var tables = ["works", "services", "lately_items", "testimonials", "collaborators", "site_settings"];
    btn.disabled = true; var old = btn.textContent; btn.textContent = "Preparando…";
    Promise.all(tables.map(function(t){ return sb.from(t).select("*"); })).then(function(res){
      for (var i = 0; i < res.length; i++) if (res[i].error) throw res[i].error;
      var out = { app: "juanasalonia-portfolio", exported_at: new Date().toISOString(),
        note: "Las fotos no van dentro de este archivo: solo sus direcciones (URLs). Las imágenes quedan en Supabase Storage (bucket media).", tables: {} };
      tables.forEach(function(t, i){ out.tables[t] = res[i].data; });
      var blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "juanasalonia-copia-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
      toast("Copia descargada ✓ Guardala en un lugar seguro.");
    }).catch(function(e){ toast("No se pudo descargar la copia: " + (e.message || e)); })
      .then(function(){ btn.disabled = false; btn.textContent = old; });
  }

  /* ---------- shell ---------- */
  var TABS = [["works", "Trabajos"], ["services", "Servicios"], ["lately", "Lately"], ["testimonials", "Testimonios"], ["collaborators", "Logos del footer"], ["settings", "Textos, fotos y contacto"]];
  function show(key){
    Array.prototype.forEach.call(tabsEl.children, function(b){ b.setAttribute("aria-selected", b.dataset.key === key); });
    if (key === "settings") renderSettings(); else renderList(key);
  }
  TABS.forEach(function(t){
    var b = h("button", { class: "tab", type: "button", role: "tab", text: t[1], onclick: function(){ show(t[0]); } });
    b.dataset.key = t[0]; tabsEl.appendChild(b);
  });
  document.getElementById("backupBtn").addEventListener("click", function(){ backup(this); });
  document.getElementById("logoutBtn").addEventListener("click", function(){
    sb.auth.signOut().then(function(){ location.replace("login.html"); });
  });

  sb.auth.getSession().then(function(r){
    if (!r.data.session){ location.replace("login.html"); return; }
    show("works");
  });
  sb.auth.onAuthStateChange(function(ev){ if (ev === "SIGNED_OUT") location.replace("login.html"); });
})();
