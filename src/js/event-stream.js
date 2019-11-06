export class EventStream {
    static from(domEl) {
        return new EventStream(domEl);
    }

    constructor({domEl, eventName, eventValueReader}) {
        this._domEl = domEl;
        this._eventName = eventName;
        this._eventValueReader = eventValueReader;
        
        this._running = true;
        this._promiseResolve = null;
        this._eventListener = null;
    }

    stop() {
        if (this._running) {
            this._running = false;
            if (this._promiseResolve) {
                this._promiseResolve(undefined);
            }
            if (this._eventListener) {
                this._domEl.removeEventListener(this._eventName, this._eventListener);
                this._eventListener = null;
            }
        }        
    }

    async *[Symbol.asyncIterator]() {
        if (!this._running) {
            return;
        }

        this._eventListener = e => {
            if (this._promiseResolve) {
                this._promiseResolve(this._eventValueReader(e));
                this._promiseResolve = null;
            }
        };
        this._domEl.addEventListener(this._eventName, this._eventListener);
    
        while (this._running) {
            let nextValue = await new Promise(resolve => {
                this._promiseResolve = resolve;
            });
            if (nextValue !== undefined) {
                yield nextValue;
            }
        }
    }
}
