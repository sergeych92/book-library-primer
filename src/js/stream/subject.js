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

        this._resolveTo(this._state);
    }

    constructor(state) {
        this._state = state || {};
        this._resolves = [];
    }

    pipe() {
        return new StreamIterable(x => x, this);
    }

    async *[Symbol.asyncIterator]() {
        while (true) {
            yield await new Promise(resolve => {
                this._resolves.push(resolve);
            })
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
