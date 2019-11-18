import { DIR_TYPE, getIdAttrCode, DIR_ID_ATTR_NAME } from "./constants";
import { EventStream } from "../stream/event-stream";

function attachOutputDirective(element, directive) {
    let outputStream = new EventStream({
        domEl: element,
        eventName: directive.eventName
    });

    directive.variable.call(element, outputStream, element);
}

async function attachAttrDirective(element, directive) {
    element.setAttribute(directive.attrName, directive.attrValueLeft + directive.attrValueRight);
    for await (let event of directive.variable) {
        element.setAttribute(directive.attrName, directive.attrValueLeft + event + directive.attrValueRight);
    }
}

async function attachElementDirective(element, directive) {
    if (directive.isNode) {
        element.replaceWith(directive.variable);
    } else {
        for await (let event of directive.variable) {
            element.textContent = event;
        }
    }
}

async function attachIfDirective(element, directive) {
    if (directive.isObservable) {
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
    } else {
        if (!directive.variable) {
            element.remove();
        }
    }
}

export function activateDirectives(rootEl, directives) {
    for (let dir of directives) {
        const element = rootEl.querySelector(`[${getIdAttrCode(dir.id, false)}]`);
        if (!element) {
            throw new Error('Parsing error. Cannot find an element by tag id');
        }
        element.removeAttribute(`${DIR_ID_ATTR_NAME}-${dir.id}`);

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
