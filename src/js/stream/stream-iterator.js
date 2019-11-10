import { throttleStream } from "./throttle-stream";
import { switchMapStream } from "./switch-map";

export class StreamIterator {
    throttle(timeout = 500) {
        return new StreamIterator(
            throttleStream(this._stream, timeout)
        );
    }


    switchMap(switchToMap) {
        return new StreamIterator(
            switchMapStream(this._stream, switchToMap)
        );
    }

    constructor(stream) {
        this._stream = stream;
    }

    [Symbol.asyncIterator]() {
        return this._stream;
    }
}