drop table if exists entries;
create table entries (
  id integer primary key autoincrement,
  uid integer not null,
  pid integer not null,
  nodeid integer not null,
  'text' text
);