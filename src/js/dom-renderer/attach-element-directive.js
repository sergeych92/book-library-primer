function updateArrayOfElement(anchorEl, prevArray, nextArray, directive) {
    if (!Array.isArray(nextArray)) {
        return [];
    }
    const enrichedNextArray = nextArray.map(data => ({
        element: null,
        keyValue: data[directive.key],
        data
    }));

    //Remove items
    const nextArrayMap = new Map(
        enrichedNextArray.map(d => ([d.keyValue, d]))
    );
    for (let item of prevArray) {
        if (!nextArrayMap.has(item.keyValue)) {
            item.element.remove();
        }
    }

    // Set isAdded to newly added items and link their elements
    const prevArrayMap = new Map(
        prevArray.map((d, i) => ([d.keyValue, {...d, index: i}]))
    );
    for (let item of enrichedNextArray) {
        if (prevArrayMap.has(item.keyValue)) {
            item.element = prevArrayMap.get(item.keyValue).element;
        } else {
            item.isAdded = true;
        }
    }

    

    return enrichedNextArray;
}

export async function attachElementDirective(element, directive) {
    if (directive.isNode) {
        element.replaceWith(directive.variable);
    } else if (directive.isObservable) {
        let textNode = document.createElement('');
        element.replaceWith(textNode);
        element = null;

        for await (let str of directive.variable) {
            const newTextNode = document.createTextNode(str);
            textNode.replaceWith(newTextNode);
            textNode = newTextNode;
        }
    } else if (directive.isDirective) {
        if (directive.directive === 'for') {
            const anchorEl = document.createComment('for-root');
            element.replaceWith(anchorEl);
            element = null;

            let prevArray = [];
            for await (let nextArray of directive.variable) {
                prevArray = updateArrayOfElement(
                    anchorEl,
                    prevArray,
                    nextArray,
                    directive
                );
            }
        } else if (directive.directive === 'if') {
            throw new Error('An if element directive is not supported.');
        } else {
            throw new Error('An element directive with this explicit type is not supported.');
        }
    }
}
