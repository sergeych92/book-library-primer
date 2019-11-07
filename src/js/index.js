import '../css/style.scss';
import { loadRows, renderBook, removeBook, bookListEl, clearUpForm } from './booklist-renderer';
import {EventStream} from './event-stream';
import {throttleStream} from './throttle-stream';
import { CodeControlValidator } from './code-control-validator';
import { GetJsonRequest } from './get-json-request';

loadRows();

const addForm = document.querySelector('.library form');
const addBtnEl = document.querySelector('.add-btn');
addBtnEl.addEventListener('click', e => {
    e.preventDefault();
    addForm.classList.add('touched');
    if (!addForm.checkValidity()) {
        alert('Name, Description, and Code must be filled out. Code must be unique');
    } else {
        fetch('/books/book', {
            method: 'POST',
            body: new FormData(addForm)
        }).then(response => response.json())
        .then(result => {
            if (!result.error) {
                renderBook(result);
                clearUpForm(addForm);
            } else {
                alert(`Couldn't add a book because ${result.error}`);
            }
        });
    }
});

bookListEl.addEventListener('click', e => {
    const removeBtn = e.target;
    if (removeBtn.matches('.remove-btn')) {
        e.preventDefault();
        const id = parseInt(removeBtn.parentElement.dataset.id);
        fetch('/books/book', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({id})
        }).then(response => response.json())
        .then(({wasRemoved}) => {
            if (wasRemoved) {
                removeBook(id);
            } else {
                alert('Could not remove the book, sorry');
            }
        });
    }
});

// let codeControlValidator = new CodeControlValidator(document.querySelector('.library .control:last-child'));


(async () => {
    const typingStream = new EventStream({
        domEl: document.querySelector('.library .control:last-child .input'),
        eventName: 'input',
        eventValueReader: e => e.target.value
    });

    // for await (let code of typingStream) {
        
    // }

    let pr = new GetJsonRequest(`/books/codeExists/potter`)
    .then(({exists}) => {
        console.log(`request has arrived: ${exists}`);
    }).finally(() => {
        console.log('finally');
    }).catch(err => {
        if (pr.wasCancelled) {
            console.log(`request has been aborted. ${err}`);
        }
    });

    setTimeout(() => {
        pr.cancel();
        pr.cancel();
    }, 500);

})()

// document.querySelector('.cancel-btn').addEventListener('click', e => {
//     e.preventDefault();
//     typingStream.stop();
// }, {once: true});
//