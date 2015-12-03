CREATE TABLE users (
  id serial primary key,
  name varchar(60),
  email varchar(60),
  password varchar(60),
  token varchar(120) 
);

CREATE TABLE games (
  id serial primary key,
  w_user_id integer references users(id) ON DELETE cascade,
  b_user_id integer references users(id) ON DELETE cascade,
  winner integer references users(id) ON DELETE cascade,
  loser integer references users(id) ON DELETE cascade
);
