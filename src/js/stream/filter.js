export async function* filter(stream, filterFunc) {
    for await (let event of stream) {
        if (filterFunc(event)) {
            yield event;
        }
    }
}
