import { QueryBuilderQueries } from "./QueryBuilderQueries";

export class QueryBuilderDelete extends QueryBuilderQueries 
{
    parse() 
    {
        return (
            `DELETE FROM ${this.tableName}` +
            (this._where ? ` WHERE ${this._where}` : "") +
            ";"
        );
    }
}
