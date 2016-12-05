drop table if exists highlights;
create table highlights (
  id integer primary key autoincrement,
  uid integer not null,
  pid integer not null,
  nodeid integer not null,
  'text' text
);
create table users (
  id integer primary key autoincrement,
  username char(255)
);