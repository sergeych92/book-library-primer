import '../css/style.scss';
import { loadRows, renderBook, removeBook, bookListEl, clearUpForm } from './booklist-renderer';
import { FormValidator } from './form-validator';

loadRows();

const addForm = document.querySelector('.library form');
const addBtnEl = document.querySelector('.commit-btn');
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

const formValidator = new FormValidator(
    document.querySelector('.book-edit')
);
