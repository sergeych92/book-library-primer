import '../css/style.scss';
import { loadRows, renderBook, removeBook, bookListEl, clearUpForm } from './booklist-renderer';
import { FormValidator } from './form-validator';
import { FormComponent } from './components/form-component';
import { Subject } from './stream/subject';

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

// (async function () {
//     const formComponent = new FormComponent();
//     formComponent.bind();
//     document.querySelector('.library').prepend(
//         formComponent.element
//     );

//     for await (let click of formComponent.submitStream) {
//         console.log(click);
//     }
// })();

(async function () {
    let subject = new Subject({
        name: 'hello',
        code: 'hi'
    });

    (async function() {
        for await (let s of subject) {
            console.log(`name: ${s.name}, code: ${s.code}`);
        }
    })();

    (async function() {
        for await (let s of [1,2,3,4,5,6,7,8,9,10]) {
            subject.state = {
                name: 'Mia',
                code: s
            };
            console.log(`setting ${s}`);
        }
    })();
})();
