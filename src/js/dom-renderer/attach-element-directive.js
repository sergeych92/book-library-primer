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
            const anchorReference = document.createComment('for-root');
            element.replaceWith(anchorReference);
            element = null;

            /*
            1
            2
            3
            4

            4
            1
            2
            3
            */

            let prevArray = [];
            for await (let nextArray of directive.variable) {
                const diffResult = diffArrays(prevArray, nextArray, directive.key);
                for (let row of diffResult.created) {

                }
            }
        } else if (directive.directive === 'if') {
            throw new Error('An if element directive is not supported.');
        } else {
            throw new Error('An element directive with this explicit type is not supported.');
        }
    }
}
