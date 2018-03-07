[![Travis](https://img.shields.io/travis/parpeoficial/stackerjs-db-mysql-adapter.svg)](https://travis-ci.org/parpeoficial/stackerjs-db-mysql-adapter)
[![Test Coverage](https://api.codeclimate.com/v1/badges/69a83aebba7a1d188f93/test_coverage)](https://codeclimate.com/github/parpeoficial/stackerjs-db-mysql-adapter/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/69a83aebba7a1d188f93/maintainability)](https://codeclimate.com/github/parpeoficial/stackerjs-db-mysql-adapter/maintainability)
[![Dependencies](https://img.shields.io/david/parpeoficial/stackerjs-db-mysql-adapter.svg)](https://david-dm.org/parpeoficial/stackerjs-db-mysql-adapter)
[![npm](https://img.shields.io/npm/dt/stackerjs-db-mysql-adapter.svg)](https://www.npmjs.com/package/stackerjs-db-mysql-adapter)


[![NPM](https://nodei.co/npm/stackerjs-db-mysql-adapter.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/stackerjs-db-mysql-adapter/)

![StackerJS](https://s3-sa-east-1.amazonaws.com/parpe.prod/StackerJS-logo.png)

# Database: MySQL Adapter
An MySQL adapter for StackerJS apps with ORM interacting with MySQL databases.

## QueryBuilder

### Insert
```javascript
import { QueryBuilder } from 'stackerjs-db-mysql-adapter';

let query = new QueryBuilder()
    .insert()
    .set({
        'full_name': 'mysql adapter',
        'age': 2
    })
    .into('person')
    .parse();

    // INSERT INTO person (`full_name`, `age`) VALUES ("mysql adapter", 2);
```

### Select
```javascript
import { QueryBuilder, QueryCriteria } from 'stackerjs-db-mysql-adapter';

let criteria = new QueryCriteria(),
    query = new QueryBuilder()
        .select()
        .set('id', ['full_name', 'name'], 'age')
        .from('person')
        .where(
            criteria.andX(
                criteria.eq('active', true),
                criteria.gte('age', 18),
                criteria.like('name', '%george%')
            )
        )
        .parse();

    // SELECT `person`.`id`, `person`.`full_name` AS name, `person`.`age` FROM person
    // WHERE (`active` = 1 AND `age` >= 18 AND `name` LIKE "%george%");
```

### Update
```javascript
import { QueryBuilder } from 'stackerjs-db-mysql-adapter';

let query = new QueryBuilder()
    .update()
    .set({
        'full_name': 'still mysql adapter'
    })
    .into('person')
    .where({
        'id': 1
    })
    .parse();

    // UPDATE person SET `full_name` = "still mysql adapter" WHERE `id` = 1;
```

### Delete
```javascript
import { QueryBuilder } from 'stackerjs-db-mysql-adapter';

let query = new QueryBuilder()
    .delete()
    .into('person')
    .where({
        'id': 1
    })
    .parse();

    // DELETE FROM person WHERE `id` = 1;    
```


## Filtering
You can build filters using String, Object or QueryCriteria class

| Comparision | String | Object | Query Criteria |
| --- | --- | --- | --- |
| Equal | field = value | { field: value } or { field: [ 'eq': value ] } or { field: { 'eq': value } } | new QueryCriteria.eq(field, value) |
| Non equal | field <> value | { field: [ 'neq': value ] } or { field: { 'neq': value } } | new QueryCriteria.neq(field, value) |