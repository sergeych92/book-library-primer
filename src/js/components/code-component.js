import { toDom } from "../dom-renderer/to-dom";
import { GetJsonRequest } from "../get-json-request";

export class CodeComponent {
    get element() { return this._element; }
    get errorStream() { return this._errorStream; }

    constructor() {
        this._element = null;
        this._errorStream = null;
        this._onLoadingStart = () => {};
    }

    bind({loading, error, pristine, onLoadingStart}) {
        if (onLoadingStart) {
            this._onLoadingStart = onLoadingStart;
        }

        const inputInvalidClass = error.map(e => e ? 'invalid' : '');
        const controlPristineClass = pristine.pipe().map(t => t ? 'pristine' : 'dirty');
        
        this._element = toDom`
            <div class="control ${controlPristineClass}">
                <label>Code</label>
                <input required minlength="4" name="code" class="input code ${inputInvalidClass}" (input)=${this._registerOnInput.bind(this)}>
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
        const inputChangeStream = stream.pipe()
            .map(e => e.target)
            .startWith(el);
        
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

        const codeValid = inputChangeStream
            .pipe()
            .map(el => el.checkValidity() ? '' : el.validationMessage);

        this._errorStream = codeValid
            .combineLatest(codeExists)
            .map(([valid, exists]) => valid || exists);
    }
}
