import { toDom } from "../dom-renderer/to-dom";

export class InputComponent {
    get element() { return this._element; }
    get inputChange() { return this._inputChange; }

    constructor() {
        this._element = null;
        this._inputChange = null;
    }

    bind({loading, error, pristine, name, label}) {
        const inputInvalidClass = error.map(e => e ? 'invalid' : '');
        const controlPristineClass = pristine.pipe().map(t => t ? 'pristine' : 'dirty');
        
        const registerOnInput = (stream, el) => {
            stream.preventDefault = true;
            this._inputChange = stream.pipe().map(e => e.target).startWith(el);
        };

        this._element = toDom`
            <div class="control ${controlPristineClass}">
                <label>${label}</label>
                <input minlength="4" required name="${name}" class="input ${inputInvalidClass}" (input)=${registerOnInput}>
                <div class="error" *if=${error}>
                    <div class="triangle-left"></div>
                    <div class="message">${error}</div>
                </div>
                <div class="loading" *if=${loading}></div>
            </div>`;

        return {
            element: this._element,
            inputChange: this._inputChange
        };
    }
}
