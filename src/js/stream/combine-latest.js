async function nextValue(iteratorArr, promiseArr, valueArr, infinitePromise) {
    const fastest = await Promise.race(promiseArr);
    if (fastest.done) {
        valueArr[fastest.index].done = true;
        valueArr[fastest.index].init = true;
        promiseArr[fastest.index] = infinitePromise;
    } else {
        valueArr[fastest.index] = fastest;
        promiseArr[fastest.index] =
            iteratorArr[fastest.index]
                .next()
                .then(v => ({...v, index: fastest.index, init: true}));
    }
}

export async function* combineLatest(streamArr) {
    if (!Array.isArray(streamArr)) {
        throw new Error('streamArr must be an array of streams');
    }
    if (!streamArr.length) {
        return;
    }

    const infinitePromise = new Promise(_ => {});
    const iteratorArr = streamArr.map(s => s[Symbol.asyncIterator]());
    const promiseArr = iteratorArr.map((iter, index) =>
        iter.next()
            .then(v => ({...v, index, init: true})));
    const valueArr = promiseArr.map((_, index) => ({value: undefined, done: false, init: false, index}));

    while (valueArr.some(v => !v.init)) {
        await nextValue(iteratorArr, promiseArr, valueArr, infinitePromise);
    }
    yield valueArr.map(v => v.value);

    await nextValue(iteratorArr, promiseArr, valueArr, infinitePromise);
    while ((valueArr.some(v => !v.done))) {
        yield valueArr.map(v => v.value);
        await nextValue(iteratorArr, promiseArr, valueArr, infinitePromise);
    }
}
