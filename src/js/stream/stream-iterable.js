import { throttle } from "./throttle";
import { switchMap } from "./switch-map";
import { mapStream } from "./map-stream";

export class StreamIterable {
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

    constructor(stream) {
        this._stream = stream;
    }

    [Symbol.asyncIterator]() {
        return this._stream[Symbol.asyncIterator]();
    }
}