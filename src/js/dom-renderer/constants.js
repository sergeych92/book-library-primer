export const DIR_TYPE = {
    IF: 'IF',
    OUTPUT: 'OUTPUT',
    ATTR: 'ATTR',
    ELEMENT: 'ELEMENT'
};

export const DIR_ID_ATTR_NAME = 'data-directive-id';

export function getIdAttrCode(id, space = true) {
    if (space) {
        return ` ${DIR_ID_ATTR_NAME}-${id}="true" `;
    } else {
        return `${DIR_ID_ATTR_NAME}-${id}="true"`;
    }
}