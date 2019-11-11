import { StreamIterator } from "./stream-iterator";

export class EventStream {

    constructor({domEl, eventName, eventValueReader}) {
        this._domEl = domEl;
        this._eventName = eventName;
        this._eventValueReader = eventValueReader;
        
        this._running = true;
        this._nextEventResolves = [];
        this._eventListener = null;
    }

    pipe() {
        return new StreamIterator(this);
    }

    stop() {
        if (this._running) {
            this._running = false;
            this._resolveAllPromises(undefined);
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

        if (!this._eventListener) {
            this._eventListener = e => this._resolveAllPromises(this._eventValueReader(e));
            this._domEl.addEventListener(this._eventName, this._eventListener);
        }
    
        while (this._running) {
            let nextValue = await new Promise(resolve => {
                this._nextEventResolves.push(resolve);
            });
            if (nextValue !== undefined) {
                yield nextValue;
            }
        }
    }

    _resolveAllPromises(value) {
        if (this._nextEventResolves.length > 0) {
            for (let r of this._nextEventResolves) {
                r(value);
            }
            this._nextEventResolves = [];
        }
    }
}
