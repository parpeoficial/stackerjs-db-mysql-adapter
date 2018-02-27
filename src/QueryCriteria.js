import { QueryBuilderQueries } from './QueryBuilder/QueryBuilderQueries';
import { treatValue, parseFieldAndTable } from './Utils';


export class QueryCriteria
{

    like(field, value)
    {
        value = treatValue(value.indexOf('%') >= 0 ? value : `%${value}%`);
        return `${parseFieldAndTable(field)} LIKE ${value}`;   
    }

    eq(field, value)
    {
        value = treatValue(value);
        return `${parseFieldAndTable(field)} = ${value}`;
    }

    neq(field, value)
    {
        value = treatValue(value);
        return `${parseFieldAndTable(field)} <> ${value}`;
    }

    lt(field, value)
    {
        value = treatValue(value);
        return `${parseFieldAndTable(field)} < ${value}`;
    }

    lte(field, value)
    {
        value = treatValue(value);
        return `${parseFieldAndTable(field)} <= ${value}`;
    }

    gt(field, value)
    {
        value = treatValue(value);
        return `${parseFieldAndTable(field)} > ${value}`;
    }

    gte(field, value)
    {
        value = treatValue(value);
        return `${parseFieldAndTable(field)} >= ${value}`;
    }

    andX() 
    {
        return `(${this.intersect(arguments, 'AND')})`;
    }

    orX() 
    {
        return `(${this.intersect(arguments, 'OR')})`;
    }

    intersect(whatToInsersect, intersectWith)
    {
        return Object.keys(whatToInsersect)
            .map(key => whatToInsersect[key])
            .join(` ${intersectWith.trim()} `)
    }

}