import { InputComponent } from "./input-component";
import { Subject } from "../stream/subject";
import { toDom } from "../dom-renderer/to-dom";
import { GetJsonRequest } from "../get-json-request";

export class FormComponent {
    get element() {
        return this._element;
    }

    get submitStream() {
        return this._submitStream;
    }

    get formData() {
        return new FormData(this._element.querySelector('form'));
    }

    constructor() {
        this._store = new Subject(this._getDefaultState());
        this._formValidStream = this._store.pipe().map(s => !s.name.error && !s.description.error && !s.code.error);
        this._element = null;
        this._nameComponent = new InputComponent();
        this._descriptionComponent = new InputComponent();
        this._codeComponent = new InputComponent();
        this._submitStream = null;
    }

    bind() {
        this._bindNameComponent();
        this._bindDescriptionComponent();
        this._bindCodeComponent();

        const registerOnClick = e => {
            e.preventDefault = true;
            this._submitStream = e
                .pipe()
                .withLatestFrom(this._formValidStream)
                .filter(([_, valid]) => valid)
                .map(([submit]) => submit);
        }
        const btnTypeStream = this._formValidStream.map(v => v ? 'add-btn' : 'cancel-btn');

        const children = new DocumentFragment();
        children.append(
            this._nameComponent.element,
            this._descriptionComponent.element,
            this._codeComponent.element
        );
        this._element = toDom`
            <div class="book book-edit">
                <a class="commit-btn ${btnTypeStream}" href="#" (click)=${registerOnClick}></a>
                <form novalidate>
                    ${children}
                </form>
            </div>`;

        this._store.state = this._getDefaultState();

        return {
            element: this._element,
            submitStream: this._submitStream
        };
    }

    reset() {
        this._store.state = this._getDefaultState();
    }

    async _bindNameComponent() {
        const nameStateStream = this._store.pipe().map(s => s.name);
        this._nameComponent.bind({
            loading: false,
            error: nameStateStream.map(s => s.error),
            pristine: nameStateStream.map(s => s.pristine),
            name: 'name',
            label: 'Name'
        });

        const errorStream = this._nameComponent.inputChange
            .pipe()
            .map(e => e.checkValidity() ? '' : e.validationMessage);

        let eventCount = 0;
        let pristine = true;
        for await (let error of errorStream) {
            if (++eventCount >= 2) {
                pristine = false;
            }

            this._store.state = {name: {error, pristine}};
        }
    }

    async _bindDescriptionComponent() {
        const descriptionStateStream = this._store.pipe().map(s => s.description);
        this._descriptionComponent.bind({
            loading: false,
            error: descriptionStateStream.map(s => s.error),
            pristine: descriptionStateStream.map(s => s.pristine),
            name: 'description',
            label: 'Description'
        });

        const errorStream = this._descriptionComponent.inputChange
            .pipe()
            .map(e => e.checkValidity() ? '' : e.validationMessage);

        let eventCount = 0;
        let pristine = true;
        for await (let error of errorStream) {
            if (++eventCount >= 2) {
                pristine = false;
            }

            this._store.state = {description: {error, pristine}};
        }
    }

    async _bindCodeComponent() {
        const codeStateStream = this._store.pipe().map(s => s.code);
        this._codeComponent.bind({
            loading: codeStateStream.map(s => s.loading),
            error: codeStateStream.map(s => s.error),
            pristine: codeStateStream.map(s => s.pristine),
            name: 'code',
            label: 'Code'
        });

        const codeExists = this._codeComponent.inputChange
            .pipe()
            .throttle(300)
            .map(el => el.value)
            .tap(_ => {
                this._store.state = {
                    code: {
                        ...this._store.state.code,
                        loading: true
                    }
                };
            })
            .switchMap(str => str
                ? new GetJsonRequest(`/books/codeExists/${str}`)
                : Promise.resolve({exists: false}))
            .map(({exists}) => exists ? 'This book code already exists. Please choose a different one' : '')
            .tap(_ => {
                this._store.state = {
                    code: {
                        ...this._store.state.code,
                        loading: false
                    }
                };
            });

        const codeValid = this._codeComponent.inputChange
            .pipe()
            .map(el => el.checkValidity() ? '' : el.validationMessage);

        const errorStream = codeValid
            .combineLatest(codeExists)
            .map(([valid, exists]) => valid || exists);

        let eventCount = 0;
        let pristine = true;
        for await (let error of errorStream) {
            console.log('error: ' + error);
            if (++eventCount >= 2) {
                pristine = false;
            }

            this._store.state = {
                code: {
                    ...this._store.state.code,
                    pristine,
                    error
                }
            };
        }
    }

    _getDefaultState() {
        return {
            name: {
                pristine: true,
                error: ''
            },
            description: {
                pristine: true,
                error: ''
            },
            code: {
                pristine: true,
                error: '',
                loading: false
            }
        };
    }
}
