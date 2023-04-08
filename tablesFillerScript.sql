create extension if not exists "uuid-ossp";
create table if not exists users (
    id uuid not null default uuid_generate_v4() primary key,
   	name text not null,
   	password text not null,
	email text not null
);
create table if not exists carts (
    id uuid not null default uuid_generate_v4() primary key,
    user_id uuid references users(id) on delete cascade,
    created_at date not null,
    updated_at date not null,
    status text not null check (status IN ('OPEN', 'ORDERED'))
);

create table if not exists products (
	id uuid not null default uuid_generate_v4() primary key,
  	title text not null,
  	description text not null,
  	price integer not null
);


create table if not exists cart_items (
    id uuid not null default uuid_generate_v4() primary key,
    count integer not null,
    cart_id uuid references carts(id) ON DELETE CASCADE,
    product_id uuid references products(id) ON DELETE CASCADE
);



create table if not exists orders (
    id uuid not null default uuid_generate_v4() primary key,
    user_id uuid references users(id) on delete cascade,
    cart_id uuid not null references carts(id),
    payment JSON not null,
    delivery JSON not null,
    comments text,
    status text not null,
    total integer not null
);

insert into users (id, name, password, email) values ('b70cccf7-ffba-44fb-bddd-fe0fcccaa64c', 'user1', 'password1', 'email1@email.com'),
('e8045a90-3336-416c-9073-4cf38d98c8c1', 'user2', 'password2', 'email2@email.com'),
('f2c03422-9235-4d89-84af-2bd7bf4b05a9', 'user3', 'password3', 'email3@email.com');

insert into products (id, title, description, price) values ('43fbee93-36f8-4b28-a4a1-ab967ff2c6c0', 'test-title3-csv', 'test-description3-csv', 250),
('e703e4e3-d091-445e-bbf9-81dccf59ec84', 'test-title2-scv', 'test-description2-scv', 100),
('fc0d8891-bea4-480b-820b-eab3603ce271', 'test-title-scv', 'test-description-scv', 200),
('c448cc29-3b22-4fa9-b392-98e6cf7303c9', 'title-scv', 'title-scv', 600)
;

insert into carts (user_id, created_at, updated_at, status) values ('b70cccf7-ffba-44fb-bddd-fe0fcccaa64c', '2023-03-26 06:08:03', '2023-03-26 06:48:31', 'OPEN' ),
    ('e8045a90-3336-416c-9073-4cf38d98c8c1', '2023-01-25 19:30:43', '2023-01-25 19:30:43', 'OPEN' ),
    ('f2c03422-9235-4d89-84af-2bd7bf4b05a9', '2023-01-18 02:36:12', '2023-01-18 04:36:02', 'OPEN');

insert into cart_items (cart_id, product_id, count) values (
    '7ce737ae-bf2e-462e-a9ae-83f52f7a7543', '77d7fac5-c98c-4633-85ba-e01eb8a90269', 1),
    ('a4fe6ac4-89a2-48a9-91a1-97899adbccb7', 'afac0e1f-c061-4eed-9b61-cb5be9b2f509', 2),
    ('9caf36a1-f7ac-4c4d-ac25-8c6cf7c9e41b', '77d7fac5-c98c-4633-85ba-e01eb8a90269', 2),
    ('9caf36a1-f7ac-4c4d-ac25-8c6cf7c9e41b', '6368b7ae-9ae8-4d68-a017-7145b5714569', 7);
