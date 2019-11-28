import { DIR_TYPE, getIdAttrCode, DIR_ID_ATTR_NAME } from "./constants";
import { EventStream } from "../stream/event-stream";
import { attachElementDirective } from "./attach-element-directive";
import { attachIfDirective } from "./attach-if-directive";

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
