import { updateArrayOfElements } from "./update-array-of-elements";

export async function attachElementDirective(element, directive) {
    const explicitType = directive.variable;
    if (directive.isNode) {
        element.replaceWith(directive.variable);
    } else if (directive.isObservable) {
        let textNode = document.createTextNode('');
        element.replaceWith(textNode);
        element = null;

        for await (let str of directive.variable) {
            const newTextNode = document.createTextNode(str);
            textNode.replaceWith(newTextNode);
            textNode = newTextNode;
        }
    } else if (directive.isDirective) {
        if (explicitType.directive === 'for') {
            const anchorEl = document.createComment('for-root');
            element.replaceWith(anchorEl);
            element = null;

            let prevArray = [];
            for await (let nextArray of explicitType.variable) {
                prevArray = updateArrayOfElements(
                    anchorEl,
                    prevArray,
                    nextArray,
                    explicitType
                );
            }
        } else if (explicitType.directive === 'if') {
            throw new Error('An if element directive is not supported.');
        } else {
            throw new Error('An element directive with this explicit type is not supported.');
        }
    }
}
