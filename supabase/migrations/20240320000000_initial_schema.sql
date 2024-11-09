-- Create games table
create table games (
  id uuid default uuid_generate_v4() primary key,
  name_en text not null,
  name_ru text not null,
  slug text not null unique,
  description_en text not null,
  description_ru text not null,
  image text not null,
  has_gacha_heroes boolean default false,
  meta_title_en text,
  meta_title_ru text,
  meta_description_en text,
  meta_description_ru text,
  meta_keywords_en text,
  meta_keywords_ru text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table games enable row level security;

-- Create RLS policies for games
create policy "Games are viewable by everyone"
  on games for select
  using (true);

create policy "Games are editable by authenticated users"
  on games for all
  using (auth.role() = 'authenticated');

-- Create heroes table
create table heroes (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references games on delete cascade not null,
  name_en text not null,
  name_ru text not null,
  icon text not null,
  type text not null check (type in ('legendary', 'epic')),
  rarity integer,
  element text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table heroes enable row level security;

-- Create RLS policies for heroes
create policy "Heroes are viewable by everyone"
  on heroes for select
  using (true);

create policy "Heroes are editable by authenticated users"
  on heroes for all
  using (auth.role() = 'authenticated');

-- Create accounts table
create table accounts (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references games on delete cascade not null,
  title_en text not null,
  title_ru text not null,
  description_en text not null,
  description_ru text not null,
  price numeric not null check (price >= 0),
  image text not null,
  server text,
  adventure_rank integer,
  guaranteed boolean default false,
  heroes jsonb not null default '[]'::jsonb,
  resources jsonb not null default '[]'::jsonb,
  meta_title_en text,
  meta_title_ru text,
  meta_description_en text,
  meta_description_ru text,
  meta_keywords_en text,
  meta_keywords_ru text,
  status text not null default 'active' check (status in ('active', 'sold', 'hidden')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table accounts enable row level security;

-- Create RLS policies for accounts
create policy "Accounts are viewable by everyone"
  on accounts for select
  using (status = 'active' or auth.role() = 'authenticated');

create policy "Accounts are editable by authenticated users"
  on accounts for all
  using (auth.role() = 'authenticated');

-- Create orders table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references accounts on delete set null,
  status text not null check (status in ('pending', 'completed', 'cancelled')),
  price numeric not null check (price >= 0),
  contact_method text not null,
  contact_value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table orders enable row level security;

-- Create RLS policies for orders
create policy "Orders are viewable by authenticated users"
  on orders for select
  using (auth.role() = 'authenticated');

create policy "Orders are insertable by everyone"
  on orders for insert
  with check (true);

create policy "Orders are editable by authenticated users"
  on orders for update
  using (auth.role() = 'authenticated');

-- Create reviews table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references games on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  content text not null,
  author_name text not null,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table reviews enable row level security;

-- Create RLS policies for reviews
create policy "Reviews are viewable by everyone"
  on reviews for select
  using (true);

create policy "Reviews are insertable by everyone"
  on reviews for insert
  with check (true);

create policy "Reviews are editable by authenticated users"
  on reviews for update
  using (auth.role() = 'authenticated');

-- Create configuration table
create table configuration (
  id uuid default uuid_generate_v4() primary key,
  telegram_bot_token text,
  telegram_chat_id text,
  ai_api_key text,
  ai_api_url text,
  ai_model text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table configuration enable row level security;

-- Create RLS policies for configuration
create policy "Configuration is viewable by authenticated users"
  on configuration for select
  using (auth.role() = 'authenticated');

create policy "Configuration is editable by authenticated users"
  on configuration for all
  using (auth.role() = 'authenticated');

-- Create functions and triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_games_updated_at
  before update on games
  for each row
  execute function update_updated_at_column();

create trigger update_heroes_updated_at
  before update on heroes
  for each row
  execute function update_updated_at_column();

create trigger update_accounts_updated_at
  before update on accounts
  for each row
  execute function update_updated_at_column();

create trigger update_orders_updated_at
  before update on orders
  for each row
  execute function update_updated_at_column();

create trigger update_reviews_updated_at
  before update on reviews
  for each row
  execute function update_updated_at_column();

create trigger update_configuration_updated_at
  before update on configuration
  for each row
  execute function update_updated_at_column();