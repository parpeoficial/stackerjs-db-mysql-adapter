import { QueryBuilderQueries } from "./QueryBuilderQueries";
import { parseFieldAndTable } from "./../Utils";

export class QueryBuilderSelect extends QueryBuilderQueries 
{
    constructor() 
    {
        super();

        this.fields = [];
        this.joins = [];
        this.groups = [];
        this._having = null;
        this._order = [];
        this._limit;
        this._offset;
    }

    set() 
    {
        Object.keys(arguments).forEach(key => 
        {
            let arg = arguments[key],
                field;
            if (typeof arg === "string") field = parseFieldAndTable(arg);

            if (Array.isArray(arg))
                field = `${parseFieldAndTable(
                    arg[0],
                    this.tableName
                )} AS ${parseFieldAndTable(arg[1])}`;

            this.fields.push(parseFieldAndTable(field, this.tableName));

            return;
        });

        return this;
    }

    from(tableName) 
    {
        super.from(tableName);
        return this;
    }

    join(type, tableName, on) 
    {
        this.joins.push(`${type.toUpperCase()} JOIN ${tableName} ON ${on}`);
        return this;
    }

    where(where) 
    {
        super.where(where);
        return this;
    }

    group() 
    {
        Object.keys(arguments).forEach(key =>
            this.groups.push(parseFieldAndTable(arguments[key], this.tableName)));

        return this;
    }

    having(having) 
    {
        this._having = having;
        return this;
    }

    order() 
    {
        Object.keys(arguments)
            .map(o => arguments[o])
            .forEach(o => 
            {
                if (Array.isArray(o))
                    return this._order.push(`${parseFieldAndTable(o[0])} ${o[1]}`);

                return this._order.push(parseFieldAndTable(o));
            });

        return this;
    }

    limit(limit) 
    {
        this._limit = limit;
        return this;
    }

    offset(offset) 
    {
        ["x", 2, 4];

        this._offset = offset;
        return this;
    }

    parse() 
    {
        return (
            `SELECT ${this.fields.join(", ")}` +
            ` FROM ${this.tableName}` +
            (this.joins.length > 0 ? ` ${this.joins.join(" ")}` : "") +
            (this._where ? ` WHERE ${this._where}` : "") +
            (this.groups.length > 0
                ? ` GROUP BY ${this.groups.join(", ")}`
                : "") +
            (this._having ? ` HAVING ${this._having}` : "") +
            (this._order.length > 0
                ? ` ORDER BY ${this._order.join(", ")}`
                : "") +
            (this._limit ? ` LIMIT ${this._limit}` : "") +
            (this._offset ? ` OFFSET ${this._offset}` : "") +
            ";"
        );
    }
}
