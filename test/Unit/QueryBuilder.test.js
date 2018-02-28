import { expect } from 'chai';
import { QueryBuilder, QueryCriteria } from './../../lib';


describe('Unit/QueryBuilderTest', () => 
{

    describe('InsertQueryBuilderTest', () => 
    {
        it('Should create query the common way', () => 
        {
            expect(new QueryBuilder()
                .insert()
                .into('table_name')
                .set({
                    'name': 'person name',
                    'birth_year': 1992,
                    'status': true
                })
                .parse()).to.be.equal(
                    'INSERT INTO table_name (`name`, `birth_year`, `status`) ' +
                    'VALUES ("person name", 1992, 1);'
                );
        });

        it('Should create query the detailed way', () => 
        {
            expect(new QueryBuilder()
                .insert()
                .into('logs')
                .set('user_id', 1)
                .set('message', 'Inserted something on database')
                .set('when', new Date('2017-10-20 16:50:00'))
                .parse()).to.be.equal(
                    'INSERT INTO logs (`user_id`, `message`, `when`) ' +
                    'VALUES (1, "Inserted something on database", "2017-10-20 16:50:00");'
                );
        });
    });

    describe('SelectQueryBuilderTest', () => 
    {
        it('Should do a test', () => 
        {
            expect(new QueryBuilder()
                .select()
                .from('table')
                .set(['CONCAT(LOWER(table.first_name), " ", table.last_name)', 'full_name'])
                .parse())
                .to.be.equal(
                    'SELECT CONCAT(LOWER(table.first_name), " ", table.last_name) AS `full_name` ' +
                    'FROM table;'
                );
        });

        it('Should filter by where with function', () => 
        {
            expect(new QueryBuilder()
                .select()
                .set('*')
                .from('table')
                .where({
                    'UPPER(name)': [ 'like', 'UPPER("%stackerjs%")' ],
                    'last_name': { 'like': 'mysql' },
                    'active': true
                }).parse())
                .to.be.equal(
                    'SELECT * FROM table WHERE UPPER(name) LIKE UPPER("%stackerjs%") AND `last_name` LIKE "%mysql%" AND `active` = 1;'
                );
        });

        it('Should test parsing functions with number parameters', () => 
        {
            expect(new QueryBuilder()
                .select()
                .from('table')
                .set(['ACOS(COS(RADIANS(-23.120381)))', 'radius'])
                .parse())
                .to.be.equal(
                    'SELECT ACOS(COS(RADIANS(-23.120381))) AS `radius` FROM table;'
                );
        });

        it('Should create a select query without trouble', () => 
        {
            expect(new QueryBuilder()
                .select()
                .from('table_name')
                .set('id', 'name', 'table_name.active')
                .parse()).to.be.equal(
                    'SELECT `table_name`.`id`, `table_name`.`name`, `table_name`.`active` ' +
                    'FROM table_name;'
                );
        });

        it('Should JOIN queries', () => 
        {
            expect(new QueryBuilder()
                .select()
                .from('table_name')
                .set('table_name.*')
                .join('LEFT', 'other_table', 'table_name.id = other_table.fk_id')
                .parse()).to.be.equal(
                    'SELECT `table_name`.* FROM table_name ' +
                    'LEFT JOIN other_table ON table_name.id = other_table.fk_id;'
                );
        });

        it('Should GROUP query results', () => 
        {
            expect(new QueryBuilder()
                .select()
                .from('table_name')
                .set('*')
                .group('table_name.average')
                .parse()).to.be.equal(
                    'SELECT `table_name`.* FROM table_name ' +
                    'GROUP BY `table_name`.`average`;'
                );
        });

        it('Should LIMIT and OFFSET results', () => 
        {
            expect(new QueryBuilder()
                .select()
                .from('table_name')
                .set('id', ['first_name', 'name'])
                .limit(10)
                .offset(20)
                .parse()).to.be.equal(
                    'SELECT `table_name`.`id`, `table_name`.`first_name` AS `name` ' +
                    'FROM table_name LIMIT 10 OFFSET 20;'
                );
        });

        it('Should filter queries without trouble', () => 
        {
            expect(new QueryBuilder()
                .select()
                .from('table_name')
                .set('*')
                .where('active = 1')
                .parse()).to.be.equal(
                    'SELECT `table_name`.* FROM table_name WHERE active = 1;'
                );
        });

        it('Should filter query using QueryCriteria', () => 
        {
            let criteria = new QueryCriteria();
            expect(new QueryBuilder()
                .select()
                .from('table_name')
                .set('*')
                .where(criteria.andX(
                    criteria.eq('active', 1), 
                    criteria.gt('value', 100), 
                    criteria.lt('value', 1000)
                )).parse()).to.be.equal(
                    'SELECT `table_name`.* FROM table_name ' +
                    'WHERE (`active` = 1 AND `value` > 100 AND `value` < 1000);'
                );
        });
        
        it('Should test queries with HAVING', () => 
        {
            let criteria = new QueryCriteria();
            expect(
                new QueryBuilder()
                    .select()
                    .set('*')
                    .from('table_name')
                    .having(
                        criteria.eq('active', false)
                    )
                    .parse()
            ).to.be.equal(
                'SELECT * FROM table_name ' +
                'HAVING `active` = 0;' 
            );
        });

        it('Should test queries with ORDER', () => 
        {
            expect(
                new QueryBuilder()
                    .select()
                    .set('*')
                    .from('table_name')
                    .order(['name DESC'])
                    .parse()
            ).to.be.equal('SELECT * FROM table_name ORDER BY name DESC;');
        });
    });

    describe('UpdateQueryBuilderTest', () => 
    {
        it('Should create update query without trouble', () => 
        {
            expect(new QueryBuilder()
                .update()
                .into('table_name')
                .set('name', 'other person')
                .set('status', false)
                .parse()).to.be.equal(
                    'UPDATE table_name SET `name` = "other person", `status` = 0;'
                );
        });

        it('Should create filtered update query', () => 
        {
            let criteria = new QueryCriteria();
            expect(new QueryBuilder()
                .update()
                .into('table_name')
                .set('active', false)
                .where(criteria.orX(criteria.neq('active', false), criteria.lte('birth_date', new Date('1992-12-30 08:25:01'))))
                .parse()).to.be.equal(
                    'UPDATE table_name SET `active` = 0 ' +
                    'WHERE (`active` <> 0 OR `birth_date` <= "1992-12-30 08:25:01");'
                );
        });
    });

    describe('DeleteQueryBuilderTest', () => 
    {
        it('Should create a delete query without trouble', () => 
        {
            expect(new QueryBuilder()
                .delete()
                .from('table_name')
                .parse()).to.be.equal('DELETE FROM table_name;');
        });

        it('Should create a delete filtered query', () => 
        {
            let criteria = new QueryCriteria();
            expect(new QueryBuilder()
                .delete()
                .from('table_name')
                .where(criteria.gte('id', 3))
                .parse()).to.be.equal('DELETE FROM table_name WHERE `id` >= 3;');
        });
    });

    describe('Querying with JSON selector', () => 
    {
        it('Should make a SELECT query', () => 
        {
            expect(new QueryBuilder()
                .select()
                .set('person.document.id', 'person->"$.address.city"')
                .from('table')
                .parse())
            .to.be.equal('SELECT person->"$.document.id", person->"$.address.city" FROM table;')
        });
    });
});
