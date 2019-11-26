import { toDom } from "../dom-renderer/to-dom";

export class NameComponent {
    get element() { return this._element; }
    get errorStream() { return this._errorStream; }

    constructor() {
        this._element = null;
        this._errorStream = null;
    }

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
