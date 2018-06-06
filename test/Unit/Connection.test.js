import { expect } from "chai";
import { Connection } from "./../../src";

describe("Unit/ConnectionTest", function() 
{
    const conn = Connection;

    this.timeout(40000);
    before(() => conn.query("DROP TABLE IF EXISTS stackerjs;"));

    describe("Executing queries", () => 
    {
        it("Should create", done => 
        {
            conn.query("CREATE TABLE stackerjs ( name VARCHAR(100) NOT NULL );")
                .then(response => 
                {
                    expect(response).to.have.property("affectedRows");
                    expect(response).to.have.property("changedRows");
                    expect(response).to.have.property("lastInsertedId");
                })
                .then(() => done());
        });

        it("Should execute an INSERT query", done => 
        {
            conn.query("INSERT INTO stackerjs VALUES (\"stackerjs-db\"), (\"stackerjs\"), (\"stackerjs-http\"), (\"stackerjs-utils\");")
                .then(response => 
                {
                    expect(response.affectedRows).to.be.equal(4);
                })
                .then(() => done());
        });

        it("Should execute a SELECT query", done => 
        {
            conn.query("SELECT * FROM stackerjs;")
                .then(results => 
                {
                    expect(results).to.be.an("Array");
                    expect(results).to.be.lengthOf(4);
                })
                .then(() => done());
        });

        it("Should test massive queries", done => 
        {
            Promise.all(Array.from(Array(1000).keys()).map(item =>
                conn.query(`INSERT INTO stackerjs VALUES ('${item.toString()}');`))).then(() => done());
        });

        it("Should drop", done => 
        {
            conn.query("DROP TABLE stackerjs;")
                .then(response => 
                {
                    expect(response).to.have.property("affectedRows");
                    expect(response).to.have.property("changedRows");
                    expect(response).to.have.property("lastInsertedId");
                })
                .then(() => done());
        });

        it("Should present error if query is invalid", done => 
        {
            conn.query("SELECT * FROM invalid_table;")
                .catch(err =>
                    expect(() => 
                    {
                        throw err;
                    }).to.throw())
                .then(() => done());
        });

        after(() => conn.disconnect());
    });
});
