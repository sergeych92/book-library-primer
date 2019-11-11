export async function* throttle(eventStream, timeout) {
    const iterator = eventStream[Symbol.asyncIterator]();
    let upcomingValue = iterator.next();
    let lastValue = {done: false};
    while (!lastValue.done) {
        lastValue = await upcomingValue;
        upcomingValue = null;
        while (!lastValue.done) {
            if (!upcomingValue) {
                upcomingValue = iterator.next();
            }
            let {late, nextValue, done} = await Promise.race([
                new Promise(resolve => setTimeout(() => resolve({late: true}), timeout)),
                upcomingValue.then(({value, done}) => ({late: false, nextValue: value, done}))
            ]);
            if (done || late) {
                yield lastValue.value;
            } else {
                upcomingValue = null;
            }
            if (late) {
                break;
            }
            lastValue = {value: nextValue, done};
        }
    }
}
