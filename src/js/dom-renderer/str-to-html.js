import { escapeHtml } from "./escape-html";

export function strToHtml(strings, ...params) {
    const combined = strings.reduce((acc, current, index) => {
        const escapedValue = escapeHtml(params[index - 1] ? params[index - 1].toString() : '');
        return acc + escapedValue + current;
    });
    const template = document.createElement('template');
    template.innerHTML = combined;
    return template.content;
}
