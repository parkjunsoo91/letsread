drop table if exists highlights;
create table highlights (
  id integer primary key autoincrement,
  uid integer not null,
  pid integer not null,
  layer integer,
  json text not null
);
create table users (
  id integer primary key autoincrement,
  username char(255)
);