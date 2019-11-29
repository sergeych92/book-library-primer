export function updateArrayOfElements(anchorEl, prevArray, nextArray, directive) {
    if (!Array.isArray(nextArray)) {
        for (let item of prevArray) {
            item.element.remove();
        }
        return [];
    }

    // Remove elmenents from prevArray that are not in the new array
    const keyName = directive.key;
    const nextKeys = new Set(nextArray.map(d => d[keyName]));
    for (let item of prevArray) {
        if (!nextKeys.has(item.keyValue)) {
            item.element.remove();
            item.isRemoved = true;
            directive.onDelete.call(undefined, item.componentInstance);
        }
    }
    const prevArrayRemoved = prevArray.filter(d => !d.isRemoved);

    const keyValueToPrev = new Map(
        prevArrayRemoved.map(d => [d.keyValue, d])
    );

    let prevInsertedEl = anchorEl;
    for (let item of nextArray) {
        let linkedPrevItem = keyValueToPrev.get(item[keyName]);
        if (!linkedPrevItem) { // create new
            const newComponent = new directive.component();
            newComponent.bind(item);
            directive.onCreate.call(undefined, newComponent);

            linkedPrevItem = {
                keyValue: item[keyName],
                componentInstance: newComponent,
                element: newComponent.element
            };
            keyValueToPrev.set(linkedPrevItem.keyValue, linkedPrevItem);
        }

        if (linkedPrevItem.element.previousElementSibling !== prevInsertedEl) {
            prevInsertedEl.after(linkedPrevItem.element);
            prevInsertedEl = prevInsertedEl.nextElementSibling;
        }
    }

    return nextArray.map(d => keyValueToPrev.get(d[keyName]));
}
