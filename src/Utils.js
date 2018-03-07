import { escape } from 'mysql';
import { QueryCriteria } from "./index";


const DETECT_FIELD_IS_WRAPPED_BY_FUNCTION = /\([a-z0-9\-\.\_\'\*]+\)/,
    DETECT_FIELD_IS_JSON = /[a-z\_]+\-\>\"\$\.[a-z0-9\.\_]+\"/,
    DETECT_FIELD_IS_PARSED_JSON = /[a-zA-Z\_]+\-\>/,
    DETECT_FIELD_HAS_TABLE = /[a-z\_\`]+\.[a-z\_\`\*]+/,
    WRAPPED_BY_APOSTROPHE = /\`[a-z\_]+\`/;


const parseDateToDateTimeString = value => [
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
    ].join(' ');


const padString = (text, desiredSize, completeWith = '0') =>
{
    if (text.length < desiredSize) {
        while (text.length < desiredSize)
            text = completeWith + text;
    }

    return text;
}


export const treatValue = value =>
{
    if (value && typeof value.parse === 'function')
        return `(${value.parse().slice(0, -1)})`;

    if (value instanceof Date)
        return treatValue(parseDateToDateTimeString(value));

    if (Array.isArray(value) || typeof value === 'object')
        return treatValue(JSON.stringify(value));

    let regexIsFunction = /[a-zA-Z\_]+\((.*?)\)/
    if (regexIsFunction.test(value))
        return value;

    return escape(value);
}


export const parseFieldAndTable = (fieldName, tableName) =>
{
    if (DETECT_FIELD_IS_WRAPPED_BY_FUNCTION.test(fieldName))
        return fieldName;

    if (DETECT_FIELD_IS_JSON.test(fieldName))
        return fieldName;

    if (DETECT_FIELD_IS_PARSED_JSON.test(fieldName))
        return (fields => `${fields.splice(0, 1)}->"$.${fields.join('.')}"`)(fieldName.split('->'));

    if (tableName && !DETECT_FIELD_HAS_TABLE.test(fieldName))
        return parseFieldAndTable(`${tableName}.${fieldName}`);

    return fieldName.split('.')
        .map(w => WRAPPED_BY_APOSTROPHE.test(w) || w === '*' ? w : `\`${w}\``)
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
            } else if (typeof filter[field] === 'object' && typeof filter[field].parse !== 'function')
                return Object.keys(filter[field]).map((comp) => {
                    return expr[comp.toLowerCase()](field, filter[field][comp]);
                }).join(' AND ');

            return expr.eq(field, filter[field]);
        }).join(' AND ');
    }

    return filter;
}