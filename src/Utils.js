import { QueryCriteria } from "./index";



export const padString = (text, desiredSize, completeWith = '0') =>
{
    if (text.length < desiredSize) {
        while (text.length < desiredSize)
            text = completeWith + text;
    }

    return text;
}


export const treatValue = (value, treatString = true) =>
{
    if (value instanceof Date)
        return treatValue([
            [
                value.getFullYear(),
                padString((value.getMonth() + 1).toString(), 2),
                padString(value.getDate().toString(), 2)
            ].join('-'),
            [
                padString(value.getHours().toString(), 2),
                padString(value.getMinutes().toString(), 2),
                padString(value.getSeconds().toString(), 2)
            ].join(':')
        ].join(' '), treatString);

    if (typeof value === 'number')
        return value;

    if (typeof value === 'boolean')
        return value ? 1 : 0;

    if (Array.isArray(value) || typeof value === 'object')
        return JSON.stringify(value);

    if (value === '?' || !treatString)
        return value;

    let regexIsFunction = /[a-zA-Z\_]+\((.*?)\)/
    if (regexIsFunction.test(value))
        return value;

    return `"${value}"`;
}


export const parseFieldAndTable = (fieldName, tableName) =>
{
    let DETECT_FIELD_IS_WRAPPED_BY_FUNCTION = /\([a-z0-9\-\.\_\']+\)/;
    if (DETECT_FIELD_IS_WRAPPED_BY_FUNCTION.test(fieldName))
        return fieldName;

    let DETECT_FIELD_IS_JSON = /[a-z\_]+\-\>\"\$\.[a-z0-9\.\_]+\"/
    if (DETECT_FIELD_IS_JSON.test(fieldName))
        return fieldName;

    let field = fieldName.split('.')
    if (field.length > 2)
        return `${field[0]}->"$.${field.slice(1).join('.')}"`;

    let DETECT_FIELD_HAS_TABLE = /[a-z\_\`]+\.[a-z\_\`\*]+/
    if (tableName && !DETECT_FIELD_HAS_TABLE.test(fieldName))
        return parseFieldAndTable(`${tableName}.${fieldName}`);

    let WRAPPED_BY_APOSTRPHE = /\`[a-z\_]+\`/;
    return fieldName.split('.')
        .map(w => WRAPPED_BY_APOSTRPHE.test(w) || w === '*' ? w : `\`${w}\``)
        .join('.');
}


export const parseFilters = filter => 
{
    if (typeof filter === 'object') {
        let expr = new QueryCriteria();
        return Object.keys(filter).map(field => {
            if (Array.isArray(filter[field])) {
                let [ comp, value ] = filter[field];
                return expr[comp.toLowerCase()](field, value);
            } else if (typeof filter[field] === 'object')
                return Object.keys(filter[field]).map((comp) => {
                    return expr[comp.toLowerCase()](field, filter[field][comp]);
                }).join(' AND ');

            return expr.eq(field, filter[field]);
        }).join(' AND ');
    }

    return filter;
}