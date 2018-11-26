#!/usr/bin/env node

var mysql=require("./sqlite.js").SqliteDB;

dbfile="./aubooks.dat";

var mydb=new mysql(dbfile);

/**
 * table:publisher
 * pubid: auto;
 * pubname:string;
 * 
 * 
 * 
 * 
 */


/**
 table:bookinfo
bookid: auto num
bookname: string
bookwriter:string
bookreader:string
bookcover:string (url)
booklength:time
bookreleasedate:date
bookfolder:string
booklanguage:number
bookseriesname:string
bookseriessortid:decimal
bookpublisher:number
 */


