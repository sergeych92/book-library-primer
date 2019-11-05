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

export async function* throttleStream(eventStream, timeout = 500) {
    const iterator = eventStream[Symbol.asyncIterator]();
    let upcomingValue = iterator.next();
    let lastValue = {done: false};
    while (!lastValue.done) {
        lastValue = await upcomingValue;
        upcomingValue = null;
        while (!lastValue.done) {
            if (!upcomingValue) {
                upcomingValue = iterator.next();
            }
            let {late, nextValue, done} = await Promise.race([
                new Promise(resolve => setTimeout(() => resolve({late: true}), timeout)),
                upcomingValue.then(({value, done}) => ({late: false, nextValue: value, done}))
            ]);
            if (done || late) {
                yield lastValue.value;
            } else {
                upcomingValue = null;
            }
            if (late) {
                break;
            }
            lastValue = {value: nextValue, done};
        }
    }
}
