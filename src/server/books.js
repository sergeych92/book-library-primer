import { Router } from 'express';
import knex from 'knex';
import multer from 'multer';

export const booksRouter = Router();

let db = knex({
    debug: true,
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'hello123',
        database: 'local_library'
    }
});

booksRouter.get('/', function (req, res) {
    db().select('Id', 'BookName', 'BookDescr')
        .from('Books')
        .then(response => {
            res.json({
                books: response.map(row => ({
                    id: row.Id,
                    name: row.BookName,
                    description: row.BookDescr
                }))
            });
        })
});

const upload = multer();

booksRouter.post('/', upload.none(), function (req, res) {
    const {name, description} = req.body;
    db('Books')
        .returning('Id')
        .insert({
            BookName: name,
            BookDescr: description
        }).then(([id]) => {
            res.json({
                ...req.body,
                id
            });
        });
});

booksRouter.delete('/', function (req, res) {
    const {id} = req.body;
    db('Books')
        .where('id', id)
        .del()
        .then(count => {
            res.json({
                wasRemoved: count === 1
            });
        });
});
