import { strToHtml } from "./dom-renderer/str-to-html";
import { EventStream } from "./stream/event-stream";

export class InputRenderer {
    get inputEl() { return this._inputEl; }

    get typingStream() {
        if (!this._typingStream) {
            this._typingStream = new EventStream({
                domEl: this._inputEl,
                eventName: 'input'
            })
            .pipe()
            .tap(_ => {
                this._wrapperEl.classList.remove('pristine');
                this._wrapperEl.classList.add('dirty');
            });
        }
        return this._typingStream;
    }

    constructor(inputEl) {
        this._inputEl = inputEl;
        this._wrapperEl = this._inputEl.parentElement;
        this._hasError = !!this._wrapperEl.querySelector('.error');
        this._hasLoading = !!this._wrapperEl.querySelector('.loading');
        this._typingStream = null;

        this.reset();
    }

    reset() {
        // TODO: reset typing stream to its original state
        
        this.clearErrors();
        this.hideLoading();
        this._inputEl.value = '';
        
        this._wrapperEl.classList.remove('dirty');
        this._wrapperEl.classList.add('pristine');
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

    showLoading() {
        if (!this._hasLoading) {
            this._wrapperEl.append(
                strToHtml`<div class="loading"></div>`
            );
            this._hasLoading = true;
        }
    }

    hideLoading() {
        if (this._hasLoading) {
            this._wrapperEl.querySelector('.loading').remove();
            this._hasLoading = false;
        }
    }
}
