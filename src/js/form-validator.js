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
            .map(e => e.target)
            .startWith(this._nameControl.inputEl)
            .map(el => el.checkValidity() ? '' : el.validationMessage);

        const descriptionValid = this._descriptionControl.getTypingStream()
            .pipe()
            .map(e => e.target)
            .startWith(this._descriptionControl.inputEl)
            .map(el => el.checkValidity() ? '' : el.validationMessage);

        const codeExists = this._codeControl.getTypingStream()
            .pipe()
            .map(e => e.target)
            .throttle(300)
            .startWith(this._codeControl.inputEl)
            .map(el => el.value)
            .switchMap(str => str
                ? new GetJsonRequest(`/books/codeExists/${str}`)
                : Promise.resolve({exists: false}))
            .map(({exists}) => exists ? 'This book code already exists. Please choose a different one' : '');

        const codeValid = this._codeControl.getTypingStream()
            .pipe()
            .map(e => e.target)
            .startWith(this._codeControl.inputEl)
            .map(el => el.checkValidity() ? '' : el.validationMessage);

        const combined = combineLatest([
            nameValid,
            descriptionValid,
            codeValid.combineLatest(codeExists).map(([valid, exists]) => valid || exists)
        ]);

        for await (let [name, descr, code] of combined) {
            this._validState = {
                name,
                descr,
                code: code,
                valid: !name && !descr && !code
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

            if (code) {
                this._codeControl.showError(code);
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
