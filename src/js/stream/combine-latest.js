export async function* combineLatest(streamArr) {
    if (!Array.isArray(streamArr)) {
        throw new Error('streamArr must be an array of streams');
    }
    if (!streamArr.length) {
        return;
    }

    const infinitePromise = new Promise(_ => {});
    const iteratorVector = streamArr.map(s => s[Symbol.asyncIterator]());
    let valueVector = await Promise.all(
        iteratorVector.map(iter => iter.next())
    );
    if (valueVector.every(({done}) => !done)) {
        yield valueVector.map(({value}) => value);

        const promiseVector = iteratorVector.map(
            (iter, index) => iter.next().then(v => ({...v, index}))
        );
        while (valueVector.some(({done}) => !done)) {
            const fastestValue = await Promise.race(promiseVector);
            if (fastestValue.done) {
                valueVector[fastestValue.index].done = true;
                promiseVector[fastestValue.index] = infinitePromise;
            } else {
                valueVector[fastestValue.index].value = fastestValue.value;
                yield valueVector.map(({value}) => value);
                promiseVector[fastestValue.index] =
                    iteratorVector[fastestValue.index].next().then(v => ({...v, index: fastestValue.index}));
            }
        }
    }
}
