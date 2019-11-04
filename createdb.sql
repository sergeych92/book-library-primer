create database local_library;

create table Books (
    Id int not null auto_increment primary key,
    BookName varchar(50) not null,
    BookDescr varchar(200),
    BookCode varchar(100) not null unique,
    constraint book_code_unique unique (BookCode)
);

insert into Books (BookName, BookDescr, BookCode) values (
    'Harry Potter: The Phylosophers stone',
    'A childrens book featuring a young boy wizard',
    'potter 1'
);
    
insert into Books (BookName, BookDescr, BookCode) values (
    'The Hound of The Baskervilles',
    'A detective story where Sherlock Holmes solves a mistery of the scary hound glowing in the dark',
    'SH hound'
);
    
insert into Books (BookName, BookDescr, BookCode) values (
    'The Murder on The Orient Express',
    'Hercule Poirot is on a train to London where a misterious murder happens in the night',
    'orient express'
);
