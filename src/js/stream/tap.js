export async function* tap(stream, callback) {
    for await (let event of stream) {
        callback(event);
        yield event;
    }
}
