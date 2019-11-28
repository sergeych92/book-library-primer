export async function attachIfDirective(element, directive) {
    if (directive.isObservable) {
        let detachedEl = document.createComment('if');
        let attachedEl = element;
        let swapEls = () => {
            let buffer = attachedEl;
            attachedEl = detachedEl;
            detachedEl = buffer;
        };
        let shown = true;
        for await (let event of directive.variable) {
            const nextShown = !!event;
            if (shown !== nextShown) {
                attachedEl.replaceWith(detachedEl);
                swapEls();
                shown = nextShown;
            }
        }
    } else {
        if (!directive.variable) {
            element.remove();
        }
    }
}
