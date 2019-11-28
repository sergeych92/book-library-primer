import '../css/style.scss';
import { loadRows, renderBook, removeBook, bookListEl, clearUpForm } from './booklist-renderer';
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

(async function () {
    const formComponent = new FormComponent();
    formComponent.bind();
    document.querySelector('.library').prepend(
        formComponent.element
    );

    for await (let _ of formComponent.submitStream) {
        const response = await fetch('/books/book', {
            method: 'POST',
            body: formComponent.formData
        }).then(response => response.json())
        
        if (!response.error) {
            renderBook(response);
            formComponent.reset();
        } else {
            alert(`Couldn't add a book because ${response.error}`);
        }
    }
})();

// (async function () {
//     let subject = new Subject({
//         name: 'Alexa',
//         code: 0
//     });

//     (async function() {
//         const mapped = subject.pipe().map(s => `name: ${s.name}, code: ${s.code}`);
//         for await (let s of mapped) {
//             console.log(`listener 1: ${s}`);
//         }
//     })();

//     (async function() {
//         for (let s of [1,2,3,4,5]) {
//             subject.setState(({name, code}) => ({
//                 name,
//                 code: code + 1
//             }));
//             console.log(`setting ${s}`);
//         }
//     })();
// })();

class BookListComponent {
    bind() {
        const bookList = [1,2,3];

        const element = toDom`
            <ul class="book-list">
                <virtual *textContent=${'text'}></virtual>
                
                <!-- *textContent=${'some text'} -->
                
                <virtual
                    *for=${bookList}
                    *key="id"
                    *component=${BookList}
                    *onCreate=${onCreate}
                    *onDelete=${onDelete}>
                </virtual>

                ${{directive: 'text', variable: 'some text' }}

                ${{
                    directive: 'for',
                    key: 'id',
                    variable: bookList,
                    component: BookList,
                    onCreate: component => {
                        // Add component to a list of forkJoin or something to react to its id change
                    },
                    onDelete: componet => {
                        // Remove the given component from the observable list
                    }
                }}
            </ul>`;
    }
}