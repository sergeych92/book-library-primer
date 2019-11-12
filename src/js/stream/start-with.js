export async function* startWith(stream, value) {
    yield value;
    yield* stream;
}
