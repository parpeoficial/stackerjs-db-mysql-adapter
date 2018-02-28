import { QueryBuilderQueries } from './QueryBuilder/QueryBuilderQueries';
import { treatValue, parseFieldAndTable } from './Utils';


export class QueryCriteria
{

    like(field, value)
    {
        value = value.indexOf('%') >= 0 ? value : treatValue(`%${value}%`);
        return `${parseFieldAndTable(field)} LIKE ${value}`;   
    }

    eq(field, value)
    {
        return `${parseFieldAndTable(field)} = ${treatValue(value)}`;
    }

    neq(field, value)
    {
        return `${parseFieldAndTable(field)} <> ${treatValue(value)}`;
    }

    lt(field, value)
    {
        return `${parseFieldAndTable(field)} < ${treatValue(value)}`;
    }

    lte(field, value)
    {
        return `${parseFieldAndTable(field)} <= ${treatValue(value)}`;
    }

    gt(field, value)
    {
        return `${parseFieldAndTable(field)} > ${treatValue(value)}`;
    }

    gte(field, value)
    {
        return `${parseFieldAndTable(field)} >= ${treatValue(value)}`;
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