import { QueryBuilderQueries } from './QueryBuilderQueries';
import { treatValue } from '../Utils';


export class QueryBuilderInsert extends QueryBuilderQueries
{

    parse()
    {
        return `INSERT INTO ${this.tableName} (` +
            Object.keys(this.fields).map(field => field).join(', ') +
        ') VALUES (' +
            Object.keys(this.fields)
                .map(field => treatValue(this.fields[field])).join(', ') + 
        ');';
    }

}