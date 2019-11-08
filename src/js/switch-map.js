// switchToMap must return a cancellable promise (a promise that has cancel and wasCancelled functions)
export async function* switchMapStream(stream, switchToMap) {
    const iterator = stream[Symbol.asyncIterator]();
    let prevEvent = null;
    let prevEventValue = {done: false};
    while (!prevEventValue.done) {
        if (!prevEvent) {
            prevEvent = iterator.next();
        }
        prevEventValue = await prevEvent;
        let switchedTo = null;
        while (!prevEventValue.done) {
            if (!switchedTo) {
                switchedTo = switchToMap(prevEventValue.value);
                switchedTo = switchedTo.catch(err => {
                    if (!switchedTo.wasCancelled()) {
                        throw err;
                    }
                    return {cancelled: true};
                });
            }
            let nextEvent = iterator.next();
            let {switchLate, value, done} = await Promise.race([
                switchedTo.then(e => ({switchLate: false, value: e})),
                nextEvent.then(e => ({switchLate: true, value: e.value, done: e.done}))
            ]);
            if (done) {
                yield await switchedTo;
                prevEventValue = {done};
            } else {
                prevEvent = nextEvent;
                if (switchLate) {
                    switchedTo.cancel();
                    switchedTo = null;
                    prevEventValue = {value};
                } else {
                    yield value;
                    break;
                }
            }
        }
    }
}
