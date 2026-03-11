alter table public.memes
add column if not exists source_meme_id uuid references public.memes(id) on delete set null;

create index if not exists idx_memes_source_meme_id on public.memes(source_meme_id);
