export function* typingStream() {
    const codeInputControl = document.querySelector('.library form input[name=code]');
    let listener = null;
    codeInputControl.addEventListener('input', e => {
        if (listener) {
            listener(e.target.value);
            listener = null;
        }
    });

    while (true) {
        yield new Promise(resolve => {
            listener = resolve;
        });
    }
}

export async function* throttledStream(keydownStream, timeout = 500) {
    let upcomingValue = keydownStream.next();
    while (true) {
        let lastValue = await upcomingValue.value;
        upcomingValue = null;
        while (true) {
            if (!upcomingValue) {
                upcomingValue = keydownStream.next();
            }
            let {late, nextValue} = await Promise.race([
                new Promise(resolve => setTimeout(() => resolve({late: true}), timeout)),
                upcomingValue.value.then(str => ({late: false, nextValue: str}))
            ]);
            if (late) {
                break;
            } else {
                lastValue = nextValue;
                upcomingValue = null;
            }
        }
        yield lastValue;
    }
}
