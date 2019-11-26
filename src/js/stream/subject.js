import { StreamIterable } from "./stream-iterable";

export class Subject {
    constructor(state) {
        this._state = state || {};
        this._resolves = [];
        this._subscribersNum = 0;
        this._stateQueue = [];
    }

    // s is a state or a map function prevState => nextState
    setState(s) {
        // queue an event and execute it in a special callback in the generator after all of the listeners are subscribed
        this._stateQueue.push(s);
        if (this._subscribersReady() && this._stateQueue.length === 1) {
            this._processStateQueue();
        }
    }

    pipe() {
        return new StreamIterable(x => x, this);
    }

    [Symbol.asyncIterator]() {
        this._subscribersNum++;

        const iterator = {
            stopped: false,
            [Symbol.asyncIterator]() {
                return this;
            },
            next: async () => {
                if (iterator.stopped) {
                    return {done: true};
                } else {
                    const promise = new Promise(resolve => {
                        this._resolves.push(resolve);
                    });
                    if (this._resolves.length > this._subscribersNum) {
                        throw new Error('You should not request a new value until you have processed the previous one.')
                    }
                    if (this._subscribersReady() && this._stateQueue.length > 0) {
                        // publish a new event in a microtask to make it run after the last promise.then subscription
                        this._processStateQueue();
                    }
                    return {
                        value: await promise,
                        done: false
                    };
                }
            },
            return: async (returnValue) => {
                if (!iterator.stopped) {
                    iterator.stopped = true;
                    this._subscribersNum--;
                    if (this._subscribersReady() && this._stateQueue.length > 0) {
                        this._processStateQueue();
                    }
                }
                return {done: true, value: returnValue};
            }
        };

        return iterator;
    }

    _processStateQueue() {
        queueMicrotask(() => {
            const oldestState = this._stateQueue.shift();
            if (typeof oldestState === 'function') {
                // if it's a mapper, then call it with the prevState as an argument
                const mapper = oldestState;
                this._state = {
                    ...this._state,
                    ...mapper(this._state)
                };
            } else {
                this._state = {
                    ...this._state,
                    ...oldestState
                };
            }
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
