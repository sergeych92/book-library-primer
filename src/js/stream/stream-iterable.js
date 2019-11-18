import { throttle } from "./throttle";
import { switchMap } from "./switch-map";
import { mapStream } from "./map-stream";
import { startWith } from "./start-with";
import { combineLatest } from "./combine-latest";
import { tap } from "./tap";
import { filter } from "./filter";
import { withLatestFrom } from "./with-latest-from";

export class StreamIterable {
    constructor(func, ...params) {
        this._func = func;
        this._params = params;
    }

    pipe() {
        return this;
    }

    throttle(timeout = 500) {
        return new StreamIterable(throttle, this, timeout);
    }

    switchMap(switchMapTo) {
        return new StreamIterable(switchMap, this, switchMapTo);
    }

    map(mapTo) {
        return new StreamIterable(mapStream, this, mapTo);
    }

    startWith(value) {
        return new StreamIterable(startWith, this, value);
    }

    combineLatest(...streams) {
        return new StreamIterable(combineLatest, [this, ...streams]);
    }

    tap(callback) {
        return new StreamIterable(tap, this, callback);
    }

    filter(filterFunc) {
        return new StreamIterable(filter, this, filterFunc);
    }

    withLatestFrom(...streams) {
        return new StreamIterable(withLatestFrom, this, streams);
    }

    async *[Symbol.asyncIterator]() {
        yield* this._func.apply(undefined, this._params);
    }
}