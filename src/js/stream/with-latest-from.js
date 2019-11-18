import { combineLatest } from "./combine-latest";

export async function* withLatestFrom(stream, streamArr) {
    if (!Array.isArray(streamArr)) {
        throw new Error('streamArr must be an array');
    }

    let latestValues = null;
    (async () => {
        for await (let values of combineLatest(streamArr)) {
            latestValues = values;
        }
    })();

    for await (let event of stream) {
        if (latestValues) {
            yield [event, ...latestValues];
        }
    }
}
