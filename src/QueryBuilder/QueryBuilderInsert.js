import { QueryBuilderQueries } from "./QueryBuilderQueries";

export class QueryBuilderInsert extends QueryBuilderQueries 
{
    parse() 
    {
        return (
            `INSERT INTO ${this.tableName} (` +
            Object.keys(this.fields)
                .map(field => field)
                .join(", ") +
            ") VALUES (" +
            Object.keys(this.fields)
                .map(field => this.fields[field])
                .join(", ") +
            ");"
        );
    }
}
