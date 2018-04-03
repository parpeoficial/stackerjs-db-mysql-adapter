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

    where(where) 
    {
        this._where = parseFilters(where);
        return this;
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
