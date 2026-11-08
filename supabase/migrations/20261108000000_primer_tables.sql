create table public.users (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    user_name text not null,
    user_grad_year bigint not null,
    user_tcg_status text not null,
    user_email text not null
);

create table public.projects (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    project_name text not null check (trim(project_name) <> ''),
    project_manager_id bigint not null references public.users(id),
    project_description text not null
);

create table public.associates (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    project_id bigint not null references public.projects(id) on delete cascade,
    associate_id bigint not null references public.users(id) on delete cascade,
    unique (project_id, associate_id)
);

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.associates enable row level security;
grant select, insert, update, delete on public.users, public.projects, public.associates to service_role;
