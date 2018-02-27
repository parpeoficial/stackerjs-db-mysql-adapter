import { QueryBuilderQueries } from "./QueryBuilderQueries";


export class QueryBuilderUpdate extends QueryBuilderQueries
{

    parse()
    {
        return `UPDATE ${this.tableName} SET ` +
            Object.keys(this.fields)
                .map(field => `${field} = ${this.fields[field]}`)
                .join(', ') +
            (this._where ? ` WHERE ${this._where}` : '') +
            ';';
    }

}