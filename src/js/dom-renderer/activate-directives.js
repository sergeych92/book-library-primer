import { DIR_TYPE, DIR_ID_TAG_NAME } from "./constants";

function attachOutputDirective(element, directive) {
    element.addEventListener(directive.eventName, e => {
        directive.variable.call(e, e);
    });
}

async function attachAttrDirective(element, directive) {
    element.setAttribute(directive.attrValueLeft + directive.attrValueRight);
    for await (let event of directive.variable) {
        element.setAttribute(directive.attrValueLeft + event + directive.attrValueRight);
    }
}

async function attachElementDirective(element, directive) {
    for await (let event of directive.variable) {
        element.textContent = event;
    }
}

async function attachIfDirective(element, directive) {
    let detachedEl = new Comment('if');
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
}

export function activateDirectives(rootEl, directives) {
    for (let dir of directives) {
        const element = rootEl.querySelector(`[${DIR_ID_TAG_NAME}="${dir.id}"]`);
        if (!element) {
            throw new Error('Parsing error. Cannot find an element by tag id');
        }
        element.removeAttribute(DIR_ID_TAG_NAME);

        if (dir.type === DIR_TYPE.OUTPUT) {    
            attachOutputDirective(element, dir);
        } else if (dir.type === DIR_TYPE.ATTR) {
            attachAttrDirective(element, dir);
        } else if (dir.type === DIR_TYPE.ELEMENT) {
            attachElementDirective(element, dir);
        } else if (dir.type === DIR_TYPE.IF) {
            attachIfDirective(element, dir);
        } else {
            throw new Error(`Unknown type ${dir.type} is detected.`);
        }
    }

    return rootEl;
}