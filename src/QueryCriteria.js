import { QueryBuilderQueries } from './QueryBuilder/QueryBuilderQueries';
import { treatValue } from './Utils';


export class QueryCriteria
{

    like(field, value)
    {
        value = treatValue(value.indexOf('%') >= 0 ? value : `%${value}%`);
        return `${field} LIKE ${value}`;   
    }

    eq(field, value)
    {
        value = treatValue(value);
        return `${field} = ${value}`;
    }

    neq(field, value)
    {
        value = treatValue(value);
        return `${field} <> ${value}`;
    }

    lt(field, value)
    {
        value = treatValue(value);
        return `${field} < ${value}`;
    }

    lte(field, value)
    {
        value = treatValue(value);
        return `${field} <= ${value}`;
    }

    gt(field, value)
    {
        value = treatValue(value);
        return `${field} > ${value}`;
    }

    gte(field, value)
    {
        value = treatValue(value);
        return `${field} >= ${value}`;
    }

    andX() 
    {
        return '(' + 
            Object.keys(arguments).map(key => `${arguments[key]}`).join(' AND ') +
            ')';
    }

    orX(criteriaLeftSide, criteriaRightSide) 
    {
        return '(' + 
            Object.keys(arguments).map(key => `${arguments[key]}`).join(' OR ') +
            ')';
    }

}