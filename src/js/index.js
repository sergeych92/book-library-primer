import '../css/style.scss';
import { loadRows, renderBook, removeBook, bookListEl, clearUpForm } from './booklist-renderer';

loadRows();

const addForm = document.querySelector('.library form');
const addBtnEl = document.querySelector('.add-btn');
addBtnEl.addEventListener('click', e => {
    e.preventDefault();
    addForm.classList.add('touched');
    if (!addForm.checkValidity()) {
        alert('Name and Description must be filled out');
    } else {
        fetch('/books', {
            method: 'POST',
            body: new FormData(addForm)
        }).then(response => response.json())
        .then(result => {
            renderBook(result);
            clearUpForm(addForm);
        })
    }
});

bookListEl.addEventListener('click', e => {
    const removeBtn = e.target;
    if (removeBtn.matches('.remove-btn')) {
        e.preventDefault();
        const id = parseInt(removeBtn.parentElement.dataset.id);
        fetch('/books', {
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
        })
    }
});
