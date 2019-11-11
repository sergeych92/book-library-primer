export async function* mapStream(stream, mapTo) {
    for await (let v of stream) {
        yield mapTo(v);
    }
}
