import '../css/style.scss';
import { loadRows, renderBook, removeBook, bookListEl, clearUpForm } from './booklist-renderer';
import { FormValidator } from './form-validator';
import { NameComponent } from './components/name-component';
import { Subject } from './stream/subject';
import { FormComponent } from './components/form-component';

loadRows();

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

// const formValidator = new FormValidator(
//     document.querySelector('.book-edit')
// );

// (async () => {
//     for await (let _ of formValidator.submitStream) {
//         const response = await fetch('/books/book', {
//             method: 'POST',
//             body: formValidator.formData
//         }).then(response => response.json())
        
//         if (!response.error) {
//             renderBook(response);
//             formValidator.reset();
//         } else {
//             alert(`Couldn't add a book because ${response.error}`);
//         }
//     }
// })();

(function () {
    const formComponent = new FormComponent();
    formComponent.bind();
    document.querySelector('.library').prepend(
        formComponent.element
    );
})();
