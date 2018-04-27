import { parseFilters, parseFieldAndTable, treatValue } from "../Utils";
import { Connection } from "../Connection";

export class QueryBuilderQueries 
{
    constructor() 
    {
        this.tableName;
        this.fields = {};
        this._where;
    }

    into(tableName) 
    {
        this.tableName = tableName;
        return this;
    }

    from(tableName) 
    {
        return this.into(tableName);
    }

    set(fields, value = null) 
    {
        if (typeof fields === "object")
            Object.keys(fields).map(field => this.set(field, fields[field]));

        if (typeof fields === "string")
            this.fields[parseFieldAndTable(fields)] = this.treatValue(value);

        return this;
    }

    where(where, type = "AND") 
    {
        where = parseFilters(where);
        if (where.length && where.substr(0) !== "(")
            where = `(${where})`;

        if (where !== "()") 
        {
            if (!this._where)
                this._where = where;
            else
                this._where += ` ${type} ${where}`;
        }

        return this;
    }

    andWhere(where) 
    {
        return this.where(where, "AND");
    }

    orWhere(where) 
    {
        return this.where(where, "OR");
    }

    treatValue(value, treatString = true) 
    {
        return treatValue(value, treatString);
    }

    execute() 
    {
        return Connection.query(this.parse());
    }
}
