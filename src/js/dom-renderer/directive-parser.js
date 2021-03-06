import { escapeHtml } from "./escape-html";
import { StreamIterable } from "../stream/stream-iterable";
import { DIR_TYPE, getIdAttrCode } from "./constants";

// Directive matcher
const DIR_MATCHER = {
    // <div *if=${value}>
    IF: /\*if=$/i,

    // <div (input)=${onInput}>
    OUTPUT: /\((?<eventName>[\w\-]+)\)=$/i,

    // <div id="id" class="one ${value} three">
    ATTR_LEFT: /(?<attrName>[\w\-]+)="(?<attrValueLeft>[^"]*)$/i,
    ATTR_RIGHT: /^(?<attrValueRight>[^"]*)"/i,

    // <div><span>A</span>Hello!!123${value}<span>C</span></div>
    ELEMENT_MID_END: /<\/?(?:[\w\-]+)[^<>]*\/?>[^<>]*$/i,
    // ${value}Hello!!$<div id="one"></div>
    ELEMENT_START: /^[^<>]*<(?:[\w\-]+)[^<>]*>/i
};

export function parseDirectives(strings, variables) {
    let id = 1;
    const directives = [];

    const html = strings.reduce((left, right, index) => {
        let match = null;
        const variable = variables[index - 1];
        const isObservable = variable instanceof StreamIterable;

        if (match = left.match(DIR_MATCHER.IF)) {
            directives.push({
                id,
                variable,
                isObservable,
                type: DIR_TYPE.IF
            });
            return left.substring(0, match.index - 1) + getIdAttrCode(id++) + right;
        } else if (match = left.match(DIR_MATCHER.OUTPUT)) {
            if (typeof variable !== 'function') {
                throw new Error('Event listeners must be functions.');
            }
            directives.push({
                id,
                variable,
                type: DIR_TYPE.OUTPUT,
                eventName: match.groups.eventName,
            });
            return left.substring(0, match.index - 1) + getIdAttrCode(id++) + right;
        } else if (match = left.match(DIR_MATCHER.ATTR_LEFT)) {
            const matchRight = right.match(DIR_MATCHER.ATTR_RIGHT);
            if (!matchRight) {
                throw new Error('there is no closing " for the tag value to be complete.');
            }
            if (isObservable) {
                directives.push({
                    id,
                    variable,
                    type: DIR_TYPE.ATTR,
                    attrName: match.groups.attrName,
                    attrValueLeft: match.groups.attrValueLeft,
                    attrValueRight: matchRight.groups.attrValueRight
                });
                return left.substring(0, match.index - 1)
                    + getIdAttrCode(id++)
                    + right.substring(matchRight.groups.attrValueRight.length + 1); // +1 is for "
            } else {
                return left + escapeHtml(variable) + right;
            }
        } else if (match = (left.match(DIR_MATCHER.ELEMENT_MID_END) || right.match(DIR_MATCHER.ELEMENT_START))) {
            const isNode = variable instanceof Node;
            const isDirective = !!(!isNode && !isObservable && variable && variable.directive);
            if (isNode && isObservable) {
                throw new Error('Dom elements generated from observables are not supported.');
            }
            // TODO: validate that the given directive has all necessary parameters provided
            if (isObservable || isNode || isDirective) {
                directives.push({
                    id,
                    variable,
                    type: DIR_TYPE.ELEMENT,
                    isObservable,
                    isNode,
                    isDirective
                });
                return left + `<span ${getIdAttrCode(id++, false)}></span>` + right;
            } else {
                return left + escapeHtml(variable) + right;
            }
        } else { // normal text without variables
            if (isObservable) {
                throw new Error('Observables are not supported at the specified position');
            }
            return left + escapeHtml(variable) + right;
        }
    });

    return {directives, html};
}
