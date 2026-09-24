-- Rewrite the About texts in first person (EN + ES).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
update public.site_settings set value = 'I work across digital communication, content, podcasts and events. I''m less a "content creator" and more a *producer, coordinator and strategist* — the person who makes sure ideas actually happen.' where key = 'home_about';
update public.site_settings set value = 'Trabajo en comunicación digital, contenido, podcasts y eventos. Soy menos una "creadora de contenido" y más una *productora, coordinadora y estratega*: la persona que se asegura de que las ideas realmente sucedan.' where key = 'home_about_es';
update public.site_settings set value = '[PENDING: my full story — how I got into digital communication, content, podcasts and events, and what drives my work.]' where key = 'about_p1';
update public.site_settings set value = '[PENDIENTE: mi historia completa — cómo llegué a la comunicación digital, el contenido, los podcasts y los eventos, y qué me mueve en mi trabajo.]' where key = 'about_p1_es';
update public.site_settings set value = 'I''m less a "content creator" and more a *producer, coordinator and strategist* — the person who makes sure ideas actually happen, from a podcast concept to an international trade fair.' where key = 'about_p2';
update public.site_settings set value = 'Soy menos una "creadora de contenido" y más una *productora, coordinadora y estratega*: la persona que se asegura de que las ideas realmente sucedan, desde el concepto de un podcast hasta una feria internacional.' where key = 'about_p2_es';
update public.site_settings set value = '[PENDING: my international experience — countries, industries, notable collaborations.]' where key = 'about_p3';
update public.site_settings set value = '[PENDIENTE: mi experiencia internacional — países, industrias, colaboraciones destacadas.]' where key = 'about_p3_es';
update public.site_settings set value = 'P.D. — I was born in Mendoza and I''m based in Buenos Aires, Argentina. I speak Spanish & English.' where key = 'about_pd';
update public.site_settings set value = 'P.D. — Nací en Mendoza y vivo en Buenos Aires, Argentina. Hablo español e inglés.' where key = 'about_pd_es';
