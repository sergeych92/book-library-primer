import { strToHtml } from "./str-to-html";
import { EventStream } from "./stream/event-stream";

export class InputRenderer {
    constructor(inputEl) {
        this._inputEl = inputEl;
        this._wrapperEl = this._inputEl.parentElement;
        this._hasError = false;
        this._typingStream = null;

        this._init();
    }

    showError(msg) {
        this.clearErrors();
        this._wrapperEl.classList.add('invalid');
        this._wrapperEl.append(
            strToHtml`
            <div class="error">
                <div class="triangle-left"></div>
                <div class="message">${msg}</div>
            </div>
            `
        );
        this._hasError = true;
    }

    clearErrors() {
        this._wrapperEl.classList.remove('invalid');
        if (this._hasError) {
            this._wrapperEl.querySelector('.error').remove();
            this._hasError = false;
        }
    }

    getTypingStream() {
        if (!this._typingStream) {
            this._typingStream = new EventStream({
                domEl: this._inputEl,
                eventName: 'input'
            });
        }
        return this._typingStream;
    }

    _init() {
        this.clearErrors();
        this._inputEl.value = '';
    }
}
