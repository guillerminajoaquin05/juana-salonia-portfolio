-- Spanish versions of every editable field.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- (Safe to run again: it only adds missing columns and fills EMPTY Spanish fields.)

alter table public.works add column if not exists title_es text default '';
alter table public.works add column if not exists meta_es text default '';
alter table public.works add column if not exists summary_es text default '';
alter table public.works add column if not exists year_place_es text default '';
alter table public.works add column if not exists role_es text default '';
alter table public.works add column if not exists context_es text default '';
alter table public.works add column if not exists role_text_es text default '';
alter table public.works add column if not exists highlights_es text default '';

alter table public.services add column if not exists title_es text default '';
alter table public.services add column if not exists text_es text default '';
alter table public.services add column if not exists details_es text[] not null default '{}';

alter table public.lately_items add column if not exists text_es text default '';
alter table public.lately_items add column if not exists status_es text default '';

-- ---------- Spanish for the current content ----------
update public.works set meta_es = 'Eventos · Experiencia internacional'
  where title = 'EuroShop Düsseldorf' and coalesce(meta_es, '') = '';
update public.works set meta_es = 'Producción de podcast · EE. UU. · 2025–Presente'
  where title = 'Event Marketer''s Toolbox' and coalesce(meta_es, '') = '';
update public.works set meta_es = 'Producción de podcast y contenido'
  where title = 'The Expo Factor' and coalesce(meta_es, '') = '';
update public.works set title_es = 'Cómo armar un podcast desde cero — UCA', meta_es = 'Charlas · Docencia · Buenos Aires'
  where title = 'Building a Podcast From Scratch — UCA' and coalesce(meta_es, '') = '';
update public.works set meta_es = 'Viajes · Contenido · Producción'
  where title = 'Iara Snei — Bali' and coalesce(meta_es, '') = '';
update public.works set meta_es = 'Lanzamiento y producción de podcast'
  where title = 'Sale con Fritas' and coalesce(meta_es, '') = '';

update public.services set
  title_es = 'Producción y estrategia de podcast',
  text_es = 'Del concepto a la entrega de cada episodio: todo lo que un podcast necesita para salir al aire.',
  details_es = '{"Desarrollo del concepto y preproducción","Coordinación de invitados","Grabación, publicación y distribución","Notas del episodio y reutilización de contenido"}'
  where title = 'Podcast Production & Strategy' and coalesce(title_es, '') = '';
update public.services set
  title_es = 'Estrategia de LinkedIn y contenido',
  text_es = 'Construir una presencia auténtica y un sistema de contenido que se pueda sostener en el tiempo.',
  details_es = '{"Marca personal y estrategia de contenido","Copywriting","Carruseles y newsletters","Optimización de perfil"}'
  where title = 'LinkedIn & Content Strategy' and coalesce(title_es, '') = '';
update public.services set
  title_es = 'Proyectos, eventos y experiencias',
  text_es = 'Producción integral para los proyectos y experiencias que necesitan a alguien que simplemente lo haga suceder.',
  details_es = '{"Producción y coordinación","Comunicación y logística","Contenido y apoyo en el lugar"}'
  where title = 'Projects, Events & Experiences' and coalesce(title_es, '') = '';

update public.lately_items set text_es = 'Produciendo un nuevo podcast', status_es = 'En curso'
  where text = 'Producing a new podcast' and coalesce(text_es, '') = '';
update public.lately_items set text_es = 'Terminando mi carrera en Comunicación Digital e Interactiva', status_es = 'En curso'
  where text = 'Finishing my degree in Digital & Interactive Communication' and coalesce(text_es, '') = '';
update public.lately_items set text_es = 'Preparando otra experiencia creativa de viaje', status_es = 'Próximamente'
  where text = 'Preparing another creative travel experience' and coalesce(text_es, '') = '';
update public.lately_items set text_es = 'Di mi primera masterclass universitaria', status_es = 'Listo'
  where text = 'Gave my first university masterclass' and coalesce(text_es, '') = '';
update public.lately_items set text_es = 'Trabajé en EuroShop, Düsseldorf', status_es = 'Listo'
  where text = 'Worked at EuroShop in Düsseldorf' and coalesce(text_es, '') = '';

insert into public.site_settings (key, value) values
 ('home_about_es', 'Juana trabaja en comunicación digital, contenido, podcasts y eventos. Es menos una "creadora de contenido" y más una *productora, coordinadora y estratega*: la persona que se asegura de que las ideas realmente sucedan.'),
 ('about_p1_es', '[PENDIENTE: historia completa — cómo Juana llegó a la comunicación digital, el contenido, los podcasts y los eventos, y qué la mueve en su trabajo.]'),
 ('about_p2_es', 'Es menos una "creadora de contenido" y más una *productora, coordinadora y estratega*: la persona que se asegura de que las ideas realmente sucedan, desde el concepto de un podcast hasta una feria internacional.'),
 ('about_p3_es', '[PENDIENTE: experiencia internacional — países, industrias, colaboraciones destacadas.]'),
 ('about_pd_es', 'P.D. — nació en Mendoza y vive en Buenos Aires, Argentina. Habla español e inglés.'),
 ('degree_es', 'Próxima Licenciada en Comunicación Digital e Interactiva'),
 ('school_es', 'Pontificia Universidad Católica Argentina (UCA)')
on conflict (key) do nothing;
