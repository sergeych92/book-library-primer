import { parseDirectives } from "./directive-parser";

export function renderDom(strings, ...variables) {
    const {directives, html} = parseDirectives(strings, variables);
    
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
}
