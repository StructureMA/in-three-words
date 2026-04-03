-- Add gift recipient fields to selections
alter table public.selections add column gift_recipient_name text;
alter table public.selections add column gift_note text;
alter table public.selections add column is_gift boolean not null default false;
