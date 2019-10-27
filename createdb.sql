create database local_library;

create table if not exists Books (
    Id int not null auto_increment,
    BookName varchar(50) not null,
    BookDescr varchar(200),
    primary key (Id)
);

insert into Books (BookName, BookDescr)
values ('Harry Potter: The Phylosophers stone', 'A childrens book featuring a young boy wizard');
    
insert into Books (BookName, BookDescr)
values ('The Hound of The Baskervilles', 'A detective story where Sherlock Holmes solves a mistery of the scary hound glowing in the dark');
    
insert into Books (BookName, BookDescr)
values ('The Murder on The Orient Express', 'Hercule Poaro is on a train to London where a misterious murder happens in the night');

