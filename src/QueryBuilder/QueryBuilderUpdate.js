import { QueryBuilderQueries } from "./QueryBuilderQueries";
import { treatValue } from "../Utils";


export class QueryBuilderUpdate extends QueryBuilderQueries
{

    parse()
    {
        return `UPDATE ${this.tableName} SET ` +
            Object.keys(this.fields)
                .map(field => `${field} = ${treatValue(this.fields[field])}`)
                .join(', ') +
            (this._where ? ` WHERE ${this._where}` : '') +
            ';';
    }

}