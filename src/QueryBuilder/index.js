import { QueryBuilderInsert } from './QueryBuilderInsert';
import { QueryBuilderUpdate } from './QueryBuilderUpdate';
import { QueryBuilderDelete } from './QueryBuilderDelete';
import { QueryBuilderSelect } from './QueryBuilderSelect';


export class QueryBuilder
{

    insert()
    {
        return new QueryBuilderInsert();
    }

    update()
    {
        return new QueryBuilderUpdate();
    }

    delete()
    {
        return new QueryBuilderDelete();
    }

    select()
    {
        return new QueryBuilderSelect();
    }

}