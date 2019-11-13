import { InputRenderer } from './input-renderer';
import { GetJsonRequest } from './get-json-request';
import { EventStream } from './stream/event-stream';
import { Subject } from './stream/subject';

export class FormValidator {
    get submitStream() {
        if (!this._submitStream) {
            this._submitStream = new EventStream({
                domEl: this._commitBtn,
                eventName: 'click',
                preventDefault: true
            })
            .pipe()
            .filter(_ => this._store.state.valid && !this._store.state.loading);
        }
        return this._submitStream;
    }

    get formData() {
        return new FormData(this._formEl.querySelector('form'));
    }

    constructor(formEl) {
        this._formEl = formEl;

        this._store = new Subject();
        
        this._setUpNameControl();
        this._setUpUpDescriptionControl();
        this._setUpCodeControl();
        this._setUpCommitBtn();
        this._subscribeDomUpdates();

        this.reset();
    }

    reset() {
        this._nameControl.reset();
        this._descriptionControl.reset();
        this._codeControl.reset();
        this._disableBtn();

        this._store.state = {
            name: '',
            descr: '',
            code: '',
            valid: false,
            loading: false
        };
    }

    async _setUpNameControl() {
        this._nameControl = new InputRenderer(
            this._formEl.querySelector('input[name=name]')
        );
        const nameValid = this._nameControl.typingStream
            .pipe()
            .map(e => e.target)
            .startWith(this._nameControl.inputEl)
            .map(el => el.checkValidity() ? '' : el.validationMessage);
        
        for await (let v of nameValid) {
            this._store.state = {
                name: v,
                valid: !v && !this._store.state.descr && !this._store.state.code
            };
        }
    }

    async _setUpUpDescriptionControl() {
        this._descriptionControl = new InputRenderer(
            this._formEl.querySelector('textarea[name=description]')
        );
        const descriptionValid = this._descriptionControl.typingStream
            .pipe()
            .map(e => e.target)
            .startWith(this._descriptionControl.inputEl)
            .map(el => el.checkValidity() ? '' : el.validationMessage);
        
        for await (let v of descriptionValid) {
            this._store.state = {
                descr: v,
                valid: !this._store.state.name && !v && !this._store.state.code
            };
        }
    }

    async _setUpCodeControl() {
        this._codeControl = new InputRenderer(
            this._formEl.querySelector('input[name=code]')
        );

        const codeExists = this._codeControl.typingStream
            .pipe()
            .map(e => e.target)
            .startWith(this._codeControl.inputEl)
            .throttle(300)
            .map(el => el.value)
            .tap(_ => {
                this._store.state = {
                    loading: true
                };
            })
            .switchMap(str => str
                ? new GetJsonRequest(`/books/codeExists/${str}`)
                : Promise.resolve({exists: false}))
            .map(({exists}) => exists ? 'This book code already exists. Please choose a different one' : '')
            .tap(_ => {
                this._store.state = {
                    loading: false
                };
            });

        const codeValid = this._codeControl.typingStream
            .pipe()
            .map(e => e.target)
            .startWith(this._codeControl.inputEl)
            .map(el => el.checkValidity() ? '' : el.validationMessage);

        const combined = codeValid
            .combineLatest(codeExists)
            .map(([valid, exists]) => valid || exists);

        for await (let v of combined) {
            this._store.state = {
                code: v,
                valid: !this._store.state.name && !this._store.state.descr && !v
            };
        }
    }

    _setUpCommitBtn() {
        this._commitBtn = this._formEl.querySelector('.add-btn');
        this._submitStream = null;
    }

    async _subscribeDomUpdates() {
        for await (let state of this._store) {
            let {name, descr, code, loading, valid} = state;

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

            if (loading) {
                this._codeControl.showLoading();
            } else {
                this._codeControl.hideLoading();
            }

            if (valid && !loading) {
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
