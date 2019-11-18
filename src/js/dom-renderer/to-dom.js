import { parseDirectives } from "./directive-parser";
import { activateDirectives } from "./activate-directives";

export function toDom(strings, ...variables) {
    const {directives, html} = parseDirectives(strings, variables);
    
    const template = document.createElement('template');
    template.innerHTML = html;

    return activateDirectives(template.content, directives);
}
