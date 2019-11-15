import { escapeHtml } from "./escape-html";
import { StreamIterable } from "../stream/stream-iterable";
import { DIR_TYPE, DIR_ID_TAG_NAME } from "./constants";

// Directive matcher
const DIR_MATCHER = {
    // <div *if=${value}>
    IF: /\*if=$/i,

    // <div (input)=${onInput}>
    OUTPUT: /\((?<eventName>[\w\-]+)\)=$/i,

    // <div id="id" class="one ${value} three">
    TAG_LEFT: /(?<tagName>[\w\-]+)="(?<tagValueLeft>[^"]*)$/i,
    TAG_RIGHT: /^(?<tagValueRight>[^"]*)"/i,

    // <div><span>A</span>${value}<span>C</span></div>
    ELEMENT: /<\/?(?:[\w-]+)[^<>]*\/?>$/i // could be more specific to distinguish <input />, <input>, <div>, </div>
}

export function parseDirectives(strings, variables) {
    let id = 1;
    const directives = [];

    const html = strings.reduce((left, right, index) => {
        let match = null;

        if (match = left.match(DIR_MATCHER.IF)) {
            directives.push({
                id,
                type: DIR_TYPE.IF,
                variable: variables[index - 1]
            });
            return left.substring(0, match.index - 1) + `${DIR_ID_TAG_NAME}="${id++}"` + right;
        } else if (match = left.match(DIR_MATCHER.OUTPUT)) {
            directives.push({
                id,
                type: DIR_TYPE.OUTPUT,
                eventName: match.groups.eventName,
                variable: variables[index - 1]
            });
            return left.substring(0, match.index - 1) + `${DIR_ID_TAG_NAME}="${id++}"` + right;
        } else if (match = left.match(DIR_MATCHER.TAG_LEFT)) {
            const matchRight = right.match(DIR_MATCHER.TAG_RIGHT);
            if (!matchRight) {
                throw new Error('there is no closing " for the tag value to be complete.');
            }
            directives.push({
                id,
                type: DIR_TYPE.TAG,
                variable: variables[index - 1],
                tagName: match.groups.tagName,
                tagValue: match.groups.tagValueLeft + matchRight.groups.tagValueRight
            });
            return left.substring(0, match.index - 1)
                + `${DIR_ID_TAG_NAME}="${id++}"`
                + right.substring(matchRight.groups.tagValueRight.length);
        } else if (match = left.match(DIR_MATCHER.ELEMENT)) {
            directives.push({
                id,
                type: DIR_TYPE.ELEMENT,
                variable: variables[index - 1]
            });
            return left + `<span>${DIR_ID_TAG_NAME}="${id++}"</span>` + right;
        } else { // normal text without variables
            const variable = variables[index - 1];
            if (variable instanceof StreamIterable) {
                throw new Error('Observables are not supported at the specified position');
            }
            const escapedValue = escapeHtml(variables[index - 1] ? variables[index - 1].toString() : '');
            return left + escapedValue + right;
        }
    });

    return {directives, html};
}
