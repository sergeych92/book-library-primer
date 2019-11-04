export const bookListEl = document.querySelector('.book-list');

export function renderBook({id, name, description, code}) {
    const bookHtml =
        `<li class="book" data-id=${id}>
            <a class="remove-btn" href="#"></a>
            <div>
                <div class="name">${name}</div>
                <div>${description}</div>
                <div>${code}</div>
            </div>
        </li>`;
    bookListEl.insertAdjacentHTML('beforeend', bookHtml);
}

export function removeBook(id) {
    const bookToRemove = bookListEl.querySelector(`.book[data-id="${id}"]`);
    if (bookToRemove) {
        bookToRemove.remove();
    }
}

export function clearUpForm(form) {
    form.classList.remove('touched');
    for (let input of form.querySelectorAll('input')) {
        input.value = '';
    }
    for (let textarea of form.querySelectorAll('textarea')) {
        textarea.value = '';
    }
}

export function loadRows() {
    fetch('/books')
        .then(r => r.json())
        .then(({books}) => {
            bookListEl.innerHTML = '';
            for (let book of books) {
                renderBook(book);
            }
        });
}
