import { QueryBuilderQueries } from "./QueryBuilderQueries";
import { parseFieldAndTable } from "../Utils";


export class QueryBuilderTable extends QueryBuilderQueries
{

    constructor()
    {
        super(...arguments);
        this.checkIfExists = false;
        this.type = 'CREATE';
    }

    set(fields, value=null)
    {
        if (typeof fields === 'object')
            Object.keys(fields).forEach(f => this.set(f, fields[f]));
        else
            this.fields[fields] = value;

        return this;
    }

    create(table)
    {
        this.tableName = table;
        this.type = 'CREATE';
        return this;
    }

    drop(table)
    {
        this.tableName = table;
        this.type = 'DROP';
        return this;
    }

    ifExists()
    {
        this.checkIfExists = true;
        return this;
    }

    ifNotExists()
    {
        return this.ifExists();
    }

    parse()
    {
        if (this.type === 'CREATE')
            return `CREATE TABLE ${this.checkIfExists ? 'IF NOT EXISTS' : ''} ${this.tableName} (${this.parseFields()});`;

        return `DROP TABLE ${this.checkIfExists ? 'IF EXISTS' : ''} ${this.tableName};`
    }

    parseFields()
    {
        return Object.keys(this.fields)
            .map(field => {
                let { type, size, required, defaultValue } = this.fields[field];
                return [
                    `${parseFieldAndTable(field)}`,
                    type === 'pk' ? `INTEGER PRIMARY KEY AUTO_INCREMENT` : `${type}${size ? `(${size})` : ''}`,
                    required ? 'NOT NULL' : 'NULL',
                    typeof defaultValue !== 'undefined' ? `DEFAULT ${defaultValue}` : ''
                ].join(' ').trim()
            })
            .join(', ');
    }

}