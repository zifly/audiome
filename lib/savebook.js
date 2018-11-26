#!/usr/bin/env node

var mysql=require("./sqlite.js").SqliteDB;

dbfile="./aubooks.dat";

var mydb=new mysql(dbfile);
