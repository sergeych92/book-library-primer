import { StreamIterable } from "./stream-iterable";

export class Subject {
    get state() {
        return this._state;
    }

    set state(s) {
        if (typeof (s) !== 'object') {
            throw new Error('state must be an object');
        }

        this._state = {
            ...this._state,
            ...s
        };

        // queue an event and execute it in a special event generated in the generator

        this._resolveTo(this._state);
    }

    constructor(state) {
        this._state = state || {};
        this._resolves = [];
        this._subscribersNum = 0;
        this._eventQueue = [];
    }

    pipe() {
        return new StreamIterable(x => x, this);
    }

    async *[Symbol.asyncIterator]() {
        console.log('subscribed');
        this._subscribersNum++;
        try {
            while (true) {
                const promise = new Promise(resolve => {
                    this._resolves.push(resolve);
                });
                if (this._resolves.length === this._subscribersNum) {
                    console.log('all subscribers should be good to go on a next event notification');
                    queueMicrotask(() => {
                        // publish a new event because it's after the promise.then subscription
                    });
                }
                yield await promise;
            }
        } finally {
            console.log('unsubscribed');
            this._subscribersNum--;
        }
    }

    _resolveTo() {
        if (this._resolves.length > 0) {
            for (let r of this._resolves) {
                r(this._state);
            }
            this._resolves = [];
        }
    }
}
