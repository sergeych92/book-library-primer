import { InputRenderer } from './input-renderer';
import { combineLatest } from './stream/combine-latest';
import { GetJsonRequest } from './get-json-request';

export class FormValidator {
    constructor(formEl) {
        this._formEl = formEl;

        this._validState = {
            name: '',
            descr: '',
            code: '',
            valid: true
        };
        this._setUpControls();
        this._setUpStreams();
    }

    _setUpControls() {
        this._nameControl = new InputRenderer(
            this._formEl.querySelector('input[name=name]')
        );
        this._descriptionControl = new InputRenderer(
            this._formEl.querySelector('textarea[name=description]')
        );
        this._codeControl = new InputRenderer(
            this._formEl.querySelector('input[name=code]')
        );

        this._nameControl.clearErrors();
        this._descriptionControl.clearErrors();
        this._codeControl.clearErrors();

        this._commitBtn = this._formEl.querySelector('.add-btn');
        this._disableBtn();
    }

    async _setUpStreams() {
        const nameValid = this._nameControl.getTypingStream()
            .pipe()
            .map(e => e.target.checkValidity() ? '' : e.target.validationMessage);

        const descriptionValid = this._descriptionControl.getTypingStream()
            .pipe()
            .map(e => e.target.checkValidity() ? '' : e.target.validationMessage);

        const codeExists = this._codeControl.getTypingStream()
            .pipe()
            .map(e => e.target.value)
            .throttle(300)
            .switchMap(str => str
                ? new GetJsonRequest(`/books/codeExists/${str}`)
                : Promise.resolve({exists: false}))
            .map(({exists}) => exists ? 'This book code already exists. Please choose a different one' : '');

        const codeValid = this._codeControl.getTypingStream()
            .pipe()
            .map(e => e.target.checkValidity() ? '' : e.target.validationMessage);

        const combined = combineLatest([
            nameValid,
            descriptionValid,
            codeValid,
            codeExists
        ]);

        for await (let [name, descr, code, exists] of combined) {
            this._validState = {
                name,
                descr,
                code: code || exists,
                valid: !name && !descr && !code && !exists
            };

            if (name) {
                this._nameControl.showError(name);
            } else {
                this._nameControl.clearErrors();
            }

            if (descr) {
                this._descriptionControl.showError(descr);
            } else {
                this._descriptionControl.clearErrors();
            }

            if (this._validState.code) {
                this._codeControl.showError(this._validState.code);
            } else {
                this._codeControl.clearErrors();
            }

            if (this._validState.valid) {
                this._enableBtn();
            } else {
                this._disableBtn();
            }
        }
    }

    _disableBtn() {
        this._commitBtn.classList.remove('add-btn');
        this._commitBtn.classList.add('cancel-btn');
    }

    _enableBtn() {
        this._commitBtn.classList.remove('cancel-btn');
        this._commitBtn.classList.add('add-btn');
    }
}
