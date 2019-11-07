const express = require('express');
const knex = require('knex');
const multer = require('multer');

const booksRouter = express.Router();

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
    db().select('Id', 'BookName', 'BookDescr', 'BookCode')
        .from('Books')
        .then(response => {
            res.json({
                books: response.map(row => ({
                    id: row.Id,
                    name: row.BookName,
                    description: row.BookDescr,
                    code: row.BookCode
                }))
            });
        })
});

booksRouter.get('/codeExists/:code', function (req, res) {
    const code = req.params.code;
    setTimeout(() => { // add an artificial delay to simulate busy server and test request.abort()
        db().select('Id')
        .from('Books')
        .where('BookCode', code)
        .then(dbRows => {
            res.json({
                exists: dbRows.length > 0
            });
        });
    }, 2000);
});

// multer().none() is for form data
booksRouter.post('/book', multer().none(), function (req, res) {
    const {name, description, code} = req.body;
    db('Books')
        .returning('Id')
        .insert({
            BookName: name,
            BookDescr: description,
            BookCode: code
        }).then(([id]) => {
            res.json({
                ...req.body,
                id
            });
        }).catch(error => {
            res.json({
                error: `There is a book already with the code ${code}`,
                dbError: error
            });
        });
});

booksRouter.delete('/book', function (req, res) {
    const {id} = req.body;
    db('Books')
        .where('id', id)
        .del()
        .then(count => {
            res.json({
                wasRemoved: count === 1
            });
        }).catch(error => {
            res.json({
                error: `Couldn't delete the book with the id=${id}`,
                dbError: error
            });
        });
});

module.exports = booksRouter;
