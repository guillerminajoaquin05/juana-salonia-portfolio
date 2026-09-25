-- New service: LinkedIn profile coaching (for beginners / people who want feedback).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
insert into public.services (position, title, title_es, text, text_es, details, details_es, category, image_url)
values (
  4,
  'LinkedIn Profile Coaching',
  'Asesorías para tu perfil de LinkedIn',
  'One-on-one sessions for people who are just getting started on LinkedIn, or who want honest feedback on their profile. No jargon and no growth hacks: the basics, explained simply.',
  'Sesiones uno a uno para quienes están arrancando en LinkedIn o quieren feedback sobre su perfil. Sin tecnicismos ni fórmulas mágicas: lo básico, explicado simple.',
  array['Setting up and completing your profile', 'What to post (and how to get started)', 'Feedback on your current profile', 'Tips to feel confident sharing your work'],
  array['Cómo armar y completar tu perfil', 'Qué publicar (y cómo empezar)', 'Feedback sobre tu perfil actual', 'Consejos para animarte a compartir lo que hacés'],
  'Content',
  ''
);
