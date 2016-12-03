drop table if exists highlights;
create table highlights (
  id integer primary key autoincrement,
  uid integer not null,
  pid integer not null,
  nodeid integer not null,
  'text' text
);
create table accounts (
  id integer primary key autoincrement,
  name char(255),
  pw char (255)
);