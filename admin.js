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
    works: { label: "Trabajos", table: "works", noun: "trabajo", title: "title", sub: function(r){ return (r.categories || []).join(", "); },
      fields: [
        { k: "title", l: "Título", t: "text", req: true },
        { k: "categories", l: "Categorías", t: "tags", hint: "Separadas por coma. Son las que aparecen como filtros en Work (ej: Podcast, Events, Travel, Content, Speaking)." },
        { k: "meta", l: "Línea corta (lista de Work)", t: "text", hint: "Ej: Podcast Production · USA · 2025–Present" },
        { k: "logo_url", l: "Logo (PNG con fondo transparente)", t: "image", hint: "Aparece al pasar el mouse por la fila en Work." },
        { k: "cover_url", l: "Foto de portada", t: "image", hint: "Se usa en la cinta de la home y arriba del caso de estudio." },
        { k: "summary", l: "Resumen (una frase)", t: "textarea", rows: 2 },
        { k: "year_place", l: "Año y lugar", t: "text" },
        { k: "role", l: "Mi rol (corto)", t: "text" },
        { k: "drive_url", l: "Link a la galería (Drive)", t: "text" },
        { k: "context", l: "Contexto", t: "textarea" },
        { k: "role_text", l: "Qué hice yo", t: "textarea" },
        { k: "highlights", l: "Highlights", t: "textarea" }
      ] },
    services: { label: "Servicios", table: "services", noun: "servicio", title: "title", sub: function(r){ return r.category ? "Filtro: " + r.category : ""; },
      fields: [
        { k: "title", l: "Título", t: "text", req: true },
        { k: "text", l: "Descripción", t: "textarea", rows: 3 },
        { k: "details", l: "Detalle (uno por línea)", t: "lines" },
        { k: "category", l: "Categoría de Work a la que enlaza", t: "text", hint: "Tiene que coincidir con una categoría de los trabajos (ej: Podcast)." },
        { k: "image_url", l: "Foto (aparece al pasar el mouse)", t: "image" }
      ] },
    lately: { label: "Lately", table: "lately_items", noun: "ítem", title: "text", sub: function(r){ return r.status; },
      fields: [
        { k: "text", l: "Texto", t: "text", req: true },
        { k: "status", l: "Estado", t: "text", hint: "Ej: In progress, Coming up, Done" }
      ] }
  };

  var SETTINGS = [
    { group: "Sobre mí (home)", fields: [
      { k: "home_about", l: "Texto corto de la home", t: "textarea", rows: 4, hint: "Para resaltar en naranja, poné *asteriscos* alrededor del texto." } ] },
    { group: "Sobre mí (página About)", fields: [
      { k: "about_p1", l: "Párrafo 1", t: "textarea" },
      { k: "about_p2", l: "Párrafo 2", t: "textarea", hint: "Podés resaltar con *asteriscos*." },
      { k: "about_p3", l: "Párrafo 3", t: "textarea" },
      { k: "about_pd", l: "P.D.", t: "textarea", rows: 2 },
      { k: "degree", l: "Título académico", t: "text" },
      { k: "school", l: "Universidad", t: "text" },
      { k: "about_photos", l: "Fotos del carrusel", t: "gallery", hint: "Se muestran en este orden. Mejor fotos verticales." } ] },
    { group: "Contacto", fields: [
      { k: "email", l: "Email", t: "text" },
      { k: "linkedin", l: "LinkedIn (URL completa)", t: "text" } ] }
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

  function upload(original){
    return compress(original).then(function(file){
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
      var box = h("div", { class: "img-field" });
      var prev = h("div");
      var status = h("span", { class: "hint" });
      function paint(){ prev.innerHTML = ""; prev.appendChild(url ? h("img", { src: url, alt: "" }) : h("div", { class: "ph", text: "Sin imagen" })); }
      var file = h("input", { type: "file", accept: "image/*", id: id });
      file.addEventListener("change", function(){
        if (!file.files[0]) return;
        status.textContent = "Subiendo…";
        upload(file.files[0]).then(function(u){ url = u; paint(); status.textContent = "Listo."; })
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
          var fig = h("figure", {}, [
            h("img", { src: u, alt: "" }),
            h("button", { type: "button", class: "btn btn--sm", text: "✕", "aria-label": "Quitar foto", onclick: function(){ urls.splice(idx, 1); draw(); } })
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
          if (r.error) say(m, "Error: " + r.error.message); else say(m, "Guardado ✓", true);
        });
      });
      panel.appendChild(form);
    });
  }

  /* ---------- shell ---------- */
  var TABS = [["works", "Trabajos"], ["services", "Servicios"], ["lately", "Lately"], ["settings", "Textos y contacto"]];
  function show(key){
    Array.prototype.forEach.call(tabsEl.children, function(b){ b.setAttribute("aria-selected", b.dataset.key === key); });
    if (key === "settings") renderSettings(); else renderList(key);
  }
  TABS.forEach(function(t){
    var b = h("button", { class: "tab", type: "button", role: "tab", text: t[1], onclick: function(){ show(t[0]); } });
    b.dataset.key = t[0]; tabsEl.appendChild(b);
  });
  document.getElementById("logoutBtn").addEventListener("click", function(){
    sb.auth.signOut().then(function(){ location.replace("login.html"); });
  });

  sb.auth.getSession().then(function(r){
    if (!r.data.session){ location.replace("login.html"); return; }
    show("works");
  });
  sb.auth.onAuthStateChange(function(ev){ if (ev === "SIGNED_OUT") location.replace("login.html"); });
})();
