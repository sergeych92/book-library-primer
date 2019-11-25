import { StreamIterable } from "./stream-iterable";

export class Subject {
    get state() {
        return this._state;
    }

    set state(s) {
        if (typeof (s) !== 'object') {
            throw new Error('state must be an object');
        }

        // queue an event and execute it in a special callback in the generator after all of the listeners are subscribed
        this._stateQueue.push(s);
        if (this._subscribersReady() && this._stateQueue.length === 1) {
            this._processStateQueue();
        }
    }

    constructor(state) {
        this._state = state || {};
        this._resolves = [];
        this._subscribersNum = 0;
        this._stateQueue = [];
    }

    pipe() {
        return new StreamIterable(x => x, this);
    }

    async *[Symbol.asyncIterator]() {
        this._subscribersNum++;
        try {
            while (true) {
                const promise = new Promise(resolve => {
                    this._resolves.push(resolve);
                });
                if (this._subscribersReady() && this._stateQueue.length > 0) {
                    // publish a new event in a microtask to make it run after the last promise.then subscription
                    this._processStateQueue();
                }
                yield await promise;
            }
        } finally {
            this._subscribersNum--;
        }
    }

    _processStateQueue() {
        queueMicrotask(() => {
            const oldestState = this._stateQueue.shift();
            this._state = {
                ...this._state,
                ...oldestState
            };

            this._resolveTo();
        });
    }

    _subscribersReady() {
        return this._subscribersNum > 0 && this._resolves.length === this._subscribersNum;
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
