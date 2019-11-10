import {EventStream} from './stream/event-stream';
import {throttleStream} from './stream/throttle-stream';

export class CodeControlValidator {
    constructor(controlEl) {
        this._controlEl = controlEl;
        this._inputEl = this._controlEl.querySelector('.input');

        // this._uniqueValidator();
        this._invalidReporter();
    }

    async _uniqueValidator() {
        const typingStream = new EventStream({
            domEl: this._inputEl,
            eventName: 'input',
            eventValueReader: e => e.target.value
        });

        const batchedStream = throttleStream(typingStream);
        for await (let t of batchedStream) {
            let req = await fetch(`/books/codeExists/${code}`);
            let json = await req.json();
            this._inputEl.setCustomValidity(json.exists ? 'The code already exists' : '');
        }
    }

    async _invalidReporter() {
        const invalidStream = new EventStream({
            domEl: this._inputEl,
            eventName: 'invalid',
            eventValueReader: e => e
        });

        for await (let t of invalidStream) {
            console.log('checked validity: ' + this._inputEl.validity.valid);
        }
    }
}
