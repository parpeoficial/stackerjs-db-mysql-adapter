import { QueryCriteria } from "./index";



exports.padString = (text, desiredSize, completeWith = '0') =>
{
    if (text.length < desiredSize) {
        while (text.length < desiredSize)
            text = completeWith + text;
    }

    return text;
}


exports.treatValue = (value, treatString = true) =>
{
    if (value instanceof Date)
        return exports.treatValue([
            [
                value.getFullYear(),
                exports.padString((value.getMonth() + 1).toString(), 2),
                exports.padString(value.getDate().toString(), 2)
            ].join('-'),
            [
                exports.padString(value.getHours().toString(), 2),
                exports.padString(value.getMinutes().toString(), 2),
                exports.padString(value.getSeconds().toString(), 2)
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


exports.parseFieldAndTable = (fieldName, tableName) =>
{
    if (tableName && fieldName.indexOf('.') < 0)
        return `${exports.escapeFieldsAndReservedWords(tableName)}.${fieldName}`;

    return fieldName;
}


exports.escapeFieldsAndReservedWords = field =>
{
    let regexDetectSQLFunction = /\([a-zA-Z0-9\-\.\_]+\)/;
    if (regexDetectSQLFunction.test(field))
        return field
    
    if (field.indexOf('.') >= 0)
        return field.split('.')
            .map(f => exports.escapeFieldsAndReservedWords(f))
            .join('.');

    if (field.indexOf('*') >= 0)
        return field;

    return `\`${field}\``;
}


exports.parseFilters = filter => 
{
    if (typeof filter === 'object') {
        let expr = new QueryCriteria();
        return Object.keys(filter).map((field) => {
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