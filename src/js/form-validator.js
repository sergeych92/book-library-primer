import { InputRenderer } from './input-renderer';
import { combineLatest } from './stream/combine-latest';
import { GetJsonRequest } from './get-json-request';
import { EventStream } from './stream/event-stream';

export class FormValidator {
    get submitStream() {
        if (!this._submitStream) {
            this._submitStream = new EventStream({
                domEl: this._commitBtn,
                eventName: 'click',
                preventDefault: true
            })
            .pipe()
            .filter(_ => this._validState.valid && !this._validState.loading);
        }
        return this._submitStream;
    }

    get formData() {
        return new FormData(this._formEl.querySelector('form'));
    }

    constructor(formEl) {
        this._formEl = formEl;

        this._validState = {
            name: '',
            descr: '',
            code: '',
            valid: false,
            loading: false
        };
        this._setUpControls();
        this._setUpStreams();
        this._submitStream = null;
    }

    resetControls() {
        this._nameControl.reset();
        this._descriptionControl.reset();
        this._codeControl.reset();

        this._validState = {
            name: '',
            descr: '',
            code: '',
            valid: false,
            loading: false
        };
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
        const nameValid = this._nameControl.typingStream
            .pipe()
            .map(e => e.target)
            .startWith(this._nameControl.inputEl)
            .map(el => el.checkValidity() ? '' : el.validationMessage);

        const descriptionValid = this._descriptionControl.typingStream
            .pipe()
            .map(e => e.target)
            .startWith(this._descriptionControl.inputEl)
            .map(el => el.checkValidity() ? '' : el.validationMessage);

        const codeExists = this._codeControl.typingStream
            .pipe()
            .map(e => e.target)
            .throttle(300)
            .startWith(this._codeControl.inputEl)
            .map(el => el.value)
            .tap(_ => {
                this._codeControl.showLoading();
                this._validState.loading = true;
            })
            .switchMap(str => str
                ? new GetJsonRequest(`/books/codeExists/${str}`)
                : Promise.resolve({exists: false}))
            .map(({exists}) => exists ? 'This book code already exists. Please choose a different one' : '')
            .tap(_ => {
                this._codeControl.hideLoading();
                this._validState.loading = false;
            });

        const codeValid = this._codeControl.typingStream
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
                valid: !name && !descr && !code,
                loading: this._validState.loading
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

            if (this._validState.valid && !this._validState.loading) {
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
