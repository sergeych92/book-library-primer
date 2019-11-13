import { throttle } from "./throttle";
import { switchMap } from "./switch-map";
import { mapStream } from "./map-stream";
import { startWith } from "./start-with";
import { combineLatest } from "./combine-latest";
import { tap } from "./tap";
import { filter } from "./filter";

export class StreamIterable {
    pipe() {
        return this;
    }

    throttle(timeout = 500) {
        return new StreamIterable
        (
            throttle(this._stream, timeout)
        );
    }

    switchMap(switchMapTo) {
        return new StreamIterable
        (
            switchMap(this._stream, switchMapTo)
        );
    }

    map(mapTo) {
        return new StreamIterable
        (
            mapStream(this._stream, mapTo)
        );
    }

    startWith(value) {
        return new StreamIterable
        (
            startWith(this._stream, value)
        );
    }

    combineLatest(...streams) {
        return new StreamIterable
        (
            combineLatest([this._stream, ...streams])
        );
    }

    tap(callback) {
        return new StreamIterable
        (
            tap(this._stream, callback)
        );
    }

    filter(filterFunc) {
        return new StreamIterable
        (
            filter(this._stream, filterFunc)
        );
    }

    constructor(stream) {
        this._stream = stream;
    }

    [Symbol.asyncIterator]() {
        return this._stream[Symbol.asyncIterator]();
    }
}