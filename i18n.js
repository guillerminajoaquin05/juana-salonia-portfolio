/* EN / ES switcher for the fixed text of the site.
   The HTML stays in English; when Spanish is active every text node (and a few
   attributes) that matches an entry below is swapped for its translation, and
   restored when switching back. Content that Juana edits in the admin panel is
   bilingual in the database (see content.js), not here. */
(function(){
  "use strict";

  var ES = {
    /* nav + chrome */
    "Home": "Inicio", "About": "Sobre mí", "Services": "Servicios", "Work": "Trabajos", "Contact": "Contacto",
    "Language": "Idioma", "Primary": "Principal", "Open menu": "Abrir menú", "Admin login": "Acceso admin",
    "Juana Salonia — home": "Juana Salonia — inicio",
    "Juana Salonia. All rights reserved.": "Juana Salonia. Todos los derechos reservados.",
    "Worked & collaborated with": "Trabajé y colaboré con", "Collaborators": "Colaboradores",
    "Have something in mind? Let's talk.": "¿Tienes algo en mente? Hablemos.",
    "Get in touch": "Contáctame", "Get in touch →": "Contáctame →",

    /* home */
    "Digital Production & Creative Assistance": "Producción digital y asistencia creativa",
    "I help teams, projects and creative experiences run smoothly.": "Ayudo a que equipos, proyectos y experiencias creativas funcionen sin fricciones.",
    "See my work": "Ver mi trabajo", "Let's work together →": "Trabajemos juntos →",
    "About Me": "Sobre mí", "Get to know me →": "Conóceme →",
    "Selected Work": "Trabajos seleccionados", "View full archive →": "Ver archivo completo →",
    "See all services →": "Ver todos los servicios →",
    "Lately": "Últimamente", "In progress": "En curso", "Coming up": "Próximamente", "Done": "Listo",

    /* about */
    "01 / About Me": "01 / Sobre mí", "The person behind": "La persona detrás de", "the production.": "la producción.",
    "Upcoming B.A. in Digital and Interactive Communication": "Próxima Licenciada en Comunicación Digital e Interactiva",
    "Visit LinkedIn": "Ver LinkedIn", "Keep exploring": "Sigue explorando",
    "See my services →": "Ver mis servicios →", "View my work →": "Ver mi trabajo →",
    "Photos of Juana": "Fotos de Juana",
    "producer, coordinator and strategist": "productora, coordinadora y estratega",

    /* services */
    "02 / Services": "02 / Servicios", "Three worlds,": "Tres mundos,", "one way of working.": "una forma de trabajar.",
    "Not sure exactly what you need? That's fine — these three worlds tend to overlap. Here's what each one covers.":
      "¿No estás seguro de lo que necesitas? No pasa nada: estos tres mundos suelen superponerse. Esto es lo que cubre cada uno.",
    "See related work →": "Ver trabajos relacionados →", "Ready to start?": "¿Listo para empezar?", "See it in action →": "Míralo en acción →",

    /* work */
    "03 / Selected Work": "03 / Trabajos seleccionados", "The living": "El archivo", "archive.": "vivo.",
    "Every project, told as a story rather than a client list. New work gets added here as it happens.":
      "Cada proyecto, contado como una historia y no como una lista de clientes. El trabajo nuevo se agrega aquí a medida que sucede.",
    "Filter projects by category": "Filtrar proyectos por categoría",
    "All": "Todos", "Podcast": "Podcast", "Events": "Eventos", "Travel": "Viajes", "Content": "Contenido", "Speaking": "Charlas",

    /* work detail */
    "← Back to archive": "← Volver al archivo", "← Back to home": "← Volver al inicio",
    "Category": "Categoría", "Year & Place": "Año y lugar", "My Role": "Mi rol", "Gallery": "Galería",
    "View site →": "Ver sitio →", "View podcast →": "Ver podcast →", "See more →": "Ver más →",
    "Gallery →": "Galería →", "Drive link →": "Enlace a Drive →", "Context": "Contexto", "Highlights": "Destacados",
    "More work": "Más trabajos", "Back to full archive →": "Volver al archivo completo →",
    "Start a project like this →": "Empezar un proyecto como este →",

    /* contact */
    "05 / Contact": "05 / Contacto", "Have something in mind?": "¿Tienes algo en mente?", "Let's talk.": "Hablemos.",
    "Email": "Correo", "Click to copy →": "Clic para copiar →", "Copied ✓": "Copiado ✓", "Visit profile →": "Ver perfil →",
    "What people say": "Lo que dicen", "Email me": "Escríbeme",

    /* gallery */
    "Open photo": "Abrir foto", "Close": "Cerrar", "Previous": "Anterior", "Next": "Siguiente",
    "Read more →": "Leer más →", "Read less": "Leer menos",

    /* accessibility */
    "Skip to content": "Saltar al contenido", "Pause": "Pausar", "Play": "Reproducir",
    "Previous photo": "Foto anterior", "Next photo": "Foto siguiente",
    "Can't find what you're looking for? Let's talk, find the right solution together and make your idea happen.":
      "¿No encontrás lo que estás buscando? Charlemos, pensemos juntos la solución y hagamos tu idea realidad.",
    "Let's talk →": "Hablemos →",
    "(opens in a new tab)": "(se abre en una pestaña nueva)",
    "Juana Salonia — Digital Production & Creative Assistance": "Juana Salonia — Producción digital y asistencia creativa",

    /* contact form */
    "Send a message": "Envía un mensaje", "Name": "Nombre", "What are you looking for?": "¿Qué buscas?", "Message": "Mensaje",
    "LinkedIn & content": "LinkedIn y contenido", "A project or event": "Un proyecto o evento", "Something else": "Otra cosa",
    "Send message": "Enviar mensaje", "Sending…": "Enviando…",
    "Message sent — thank you! I'll get back to you soon.": "Mensaje enviado, ¡gracias! Te voy a responder pronto.",
    "Please fill in your name, a valid email and a message.": "Completa tu nombre, un email válido y un mensaje.",
    "Something went wrong. Please try again or email directly.": "Algo salió mal. Inténtalo de nuevo o escribe directamente por email.",

    /* 404 */
    "404": "404", "This page took": "Esta página se perdió", "a wrong turn.": "en el camino.",
    "The link may be broken, or the page may have moved.": "Puede que el enlace esté roto o que la página se haya movido.",
    "Back to home →": "Volver al inicio →",

    /* fallbacks for the static (pre-database) copy */
    "Podcast Production & Strategy": "Producción y estrategia de podcast",
    "LinkedIn & Content Strategy": "Estrategia de LinkedIn y contenido",
    "Projects, Events & Experiences": "Proyectos, eventos y experiencias",
    "01 — Podcast Production & Strategy": "01 — Producción y estrategia de podcast",
    "02 — LinkedIn & Content Strategy": "02 — Estrategia de LinkedIn y contenido",
    "03 — Projects, Events & Experiences": "03 — Proyectos, eventos y experiencias"
  };

  var TITLES = {
    "Juana Salonia | Digital Production & Creative Assistance": "Juana Salonia | Producción digital y asistencia creativa",
    "About Me | Juana Salonia": "Sobre mí | Juana Salonia",
    "Services | Juana Salonia": "Servicios | Juana Salonia",
    "Selected Work | Juana Salonia": "Trabajos seleccionados | Juana Salonia",
    "Contact | Juana Salonia": "Contacto | Juana Salonia",
    "Page not found | Juana Salonia": "Página no encontrada | Juana Salonia"
  };

  function norm(s){ return String(s).replace(/\s+/g, " ").trim(); }

  var lang = "en";
  try { if (localStorage.getItem("lang") === "es") lang = "es"; } catch (e) {}

  function translate(s){
    var key = norm(s);
    if (lang !== "es") return null;
    if (ES[key] != null) return ES[key];
    var m = /^Photo (\d+)$/.exec(key);
    return m ? "Foto " + m[1] : null;
  }

  /* text nodes */
  function applyText(root){
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        var p = n.parentNode && n.parentNode.nodeName;
        return (p === "SCRIPT" || p === "STYLE" || p === "TEXTAREA") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function(node){
      if (lang === "es"){
        if (node.__en !== undefined || !node.nodeValue.trim()) return;
        var t = translate(node.nodeValue);
        if (t != null){
          var lead = /^\s*/.exec(node.nodeValue)[0], trail = /\s*$/.exec(node.nodeValue)[0];
          node.__en = node.nodeValue;
          node.nodeValue = lead + t + trail;
        }
      } else if (node.__en !== undefined){
        node.nodeValue = node.__en;
        delete node.__en;
      }
    });
  }

  /* attributes */
  var ATTRS = ["alt", "aria-label", "title", "placeholder"];
  function applyAttrs(root){
    var els = root.querySelectorAll("[alt],[aria-label],[title],[placeholder]");
    Array.prototype.forEach.call(els, function(el){
      ATTRS.forEach(function(a){
        if (!el.hasAttribute(a)) return;
        el.__en = el.__en || {};
        if (lang === "es"){
          if (el.__en[a] !== undefined) return;
          var t = translate(el.getAttribute(a));
          if (t != null){ el.__en[a] = el.getAttribute(a); el.setAttribute(a, t); }
        } else if (el.__en[a] !== undefined){
          el.setAttribute(a, el.__en[a]);
          delete el.__en[a];
        }
      });
    });
  }

  var enTitle = document.title;
  function applyTitle(){
    document.title = (lang === "es" && TITLES[norm(enTitle)]) || enTitle;
  }

  function apply(root){
    root = root || document.body;
    applyText(root);
    applyAttrs(root);
  }

  function paintToggle(){
    document.documentElement.lang = lang;
    Array.prototype.forEach.call(document.querySelectorAll(".lang-toggle [data-lang]"), function(b){
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
  }

  function set(l){
    lang = l === "es" ? "es" : "en";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    I18N.lang = lang;
    apply(document.body);
    applyTitle();
    paintToggle();
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }

  var I18N = window.I18N = {
    lang: lang,
    apply: apply,
    set: set,
    /* translate a string used by scripts (falls back to the original) */
    t: function(s){ var t = translate(s); return t != null ? t : s; }
  };

  Array.prototype.forEach.call(document.querySelectorAll(".lang-toggle [data-lang]"), function(b){
    b.addEventListener("click", function(){ set(b.getAttribute("data-lang")); });
  });

  paintToggle();
  if (lang === "es"){ apply(document.body); applyTitle(); }
})();
