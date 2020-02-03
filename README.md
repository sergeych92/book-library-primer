# book-library-primer
A SPA app featuring my own DOM rendering library with custom observables and an async store, built on top of express/mysql (knee)

```
class NameComponent {
  ...

  bind({loading, error, pristine}) {
        const inputInvalidClass = error.map(e => e ? 'invalid' : '');
        const controlPristineClass = pristine.pipe().map(t => t ? 'pristine' : 'dirty');
        
        this._element = toDom`
            <div class="control ${controlPristineClass}">
                <label>Name</label>
                <input required name="name" class="input name ${inputInvalidClass}" (input)=${this._registerOnInput.bind(this)}>
                <div class="error" *if=${error}>
                    <div class="triangle-left"></div>
                    <div class="message">${error}</div>
                </div>
                <div class="loading" *if=${loading}></div>
            </div>`;

        return {
            element: this._element,
            errorStream: this._errorStream
        };
    }
     _registerOnInput(stream, el) {
        stream.preventDefault = true;
        this._errorStream = stream.pipe()
            .map(e => e.target)
            .startWith(el)
            .map(e => e.checkValidity() ? '' : e.validationMessage);
    }
 }
 
 class FormComponent {
  ...
  bind() {
        ...
        const btnTypeStream = this._formValidStream.map(v => v ? 'add-btn' : 'cancel-btn');

        const children = new DocumentFragment();
        children.append(
            this._nameComponent.element, this._descriptionComponent.element, this._codeComponent.element
        );
        this._element = toDom`
            <div class="book book-edit">
                <a class="commit-btn ${btnTypeStream}" href="#" (click)=${this._registerOnSubmitBtnClick.bind(this)}></a>
                <form novalidate>
                    ${children}
                </form>
            </div>`;
        this._formElement = this._element.querySelector('form');

        this._store.setState(this._getDefaultState());

        return {
            element: this._element,
            submitStream: this._submitStream
        };
    }
}

const store = new Subject({
    bookList: []
});
(async function () {
    const formComponent = new FormComponent();
    formComponent.bind();
    document.querySelector('.library').append(
        formComponent.element
    );

    for await (let _ of formComponent.submitStream) {
        const response = await fetch('/books/book', {
            method: 'POST',
            body: formComponent.formData
        }).then(response => response.json())
        
        if (!response.error) {
            store.setState(prevState => ({
                bookList: [...prevState.bookList, response]
            }));
            formComponent.reset();
        } else {
            alert(`Couldn't add a book because ${response.error}`);
        }
    }
})();

...
const codeExists = inputChangeStream
    .pipe()
    .throttle(300)
    .map(el => el.value)
    .tap(_ => {
        this._onLoadingStart();
    })
    .switchMap(str => str
        ? new GetJsonRequest(`/books/codeExists/${str}`)
        : Promise.resolve({exists: false}))
    .map(({exists}) => exists ? 'This book code already exists. Please choose a different one' : '');
```
