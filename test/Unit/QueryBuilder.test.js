import { expect } from "chai";
import { QueryBuilder, QueryCriteria, Connection } from "./../../lib";

describe("Unit/QueryBuilderTest", () => 
{
    describe("Creating table", () => 
    {
        it("Should create a table", done => 
        {
            new QueryBuilder()
                .table()
                .create("user")
                .set({
                    id: { type: "pk", required: true },
                    first_name: { type: "varchar", size: 100, required: true },
                    last_name: { type: "varchar", size: 100, required: true },
                    extra: { type: "json" },
                    birthday: { type: "date" },
                    active: { type: "integer", defaultValue: 0 }
                })
                .execute()
                .then(response => expect(response.affectedRows).to.be.equal(0))
                .then(() => done());
        });

        it("Should create a table if not exists", done => 
        {
            new QueryBuilder()
                .table()
                .ifNotExists()
                .create("user_messages")
                .set({
                    id: { type: "pk", required: true },
                    sender_id: { type: "integer", required: true },
                    receiver_id: { type: "integer", required: true },
                    message: { type: "varchar", size: 120, required: true },
                    sent_at: {
                        type: "datetime",
                        required: true,
                        defaultValue: "CURRENT_TIMESTAMP"
                    }
                })
                .execute()
                .then(response => expect(response.affectedRows).to.be.equal(0))
                .then(() => done());
        });

        it("Should check if table exists", done => 
        {
            new QueryBuilder()
                .table()
                .exists("user_messages")
                .execute()
                .then(response => expect(response).to.be.true)
                .then(() => done());
        });
    });

    describe("InsertQueryBuilderTest", () => 
    {
        it("Should create query the common way", done => 
        {
            new QueryBuilder()
                .insert()
                .into("user")
                .set({
                    first_name: "A person",
                    last_name: "name",
                    extra: {
                        address: { country: "Brazil" },
                        points: { sender: 10, receiver: 9.5 }
                    }
                })
                .execute()
                .then(response => 
                {
                    expect(response.affectedRows).to.be.equal(1);
                    expect(response.lastInsertedId).to.be.equal(1);
                })
                .then(() => done());
        });

        it("Should create query the detailed way", done => 
        {
            new QueryBuilder()
                .insert()
                .into("user")
                .set("first_name", "Another")
                .set("last_name", "person")
                .set("birthday", new Date("2017-05-15 09:00:01"))
                .set("extra", {
                    address: { country: "Portugal" },
                    points: { sender: 3, receiver: 2.75 }
                })
                .set("active", true)
                .execute()
                .then(response => expect(response.affectedRows).to.be.equal(1))
                .then(() => done());
        });

        it("Should insert data for posterior testing", done => 
        {
            new QueryBuilder()
                .insert()
                .into("user_messages")
                .set({
                    sender_id: 1,
                    receiver_id: 2,
                    message: "Give me some credit"
                })
                .execute()
                .then(response =>
                    expect(response.lastInsertedId).to.be.equal(1)
                )
                .then(() => done());
        });
    });

    describe("SelectQueryBuilderTest", () => 
    {
        it("Should insert multiple data", done => 
        {
            new Connection()
                .query(
                    "INSERT INTO user_messages (sender_id, receiver_id, message) VALUES " +
                        "(1, 2, \"Hello\")," +
                        "(2, 1, \"Hello man\")," +
                        "(1, 2, \"u okay ?\")," +
                        "(2, 1, \"yea, and u ?\")," +
                        "(1, 2, \"eveything good\")"
                )
                .then(() => done());
        });

        it("Should select selecting field using alias", done => 
        {
            new QueryBuilder()
                .select()
                .from("user")
                .set([
                    "CONCAT(LOWER(user.first_name), \" \", user.last_name)",
                    "full_name"
                ])
                .execute()
                .then(results => 
                {
                    expect(results).to.be.an("array");
                    expect(results).to.be.lengthOf(2);
                    expect(results[0]).to.have.property("full_name");
                })
                .then(() => done());
        });

        it("Should filter by where with function", done => 
        {
            new QueryBuilder()
                .select()
                .set("*")
                .from("user")
                .where({
                    "UPPER(last_name)": { eq: "UPPER(\"person\")" },
                    active: true,
                    "extra->address->country": ["like", "\"%tugal%\""]
                })
                .execute()
                .then(results => 
                {
                    expect(results).to.be.lengthOf(1);
                    expect(results[0].last_name).to.be.equal("person");
                })
                .then(() => done());
        });

        it("Should JOIN queries", done => 
        {
            new QueryBuilder()
                .select()
                .from("user")
                .set("user_messages.*")
                .join(
                    "INNER",
                    "user_messages",
                    "user.id = user_messages.sender_id"
                )
                .execute()
                .then(results => 
                {
                    expect(results).to.be.an("array");
                    expect(results).to.be.lengthOf(6);
                })
                .then(() => done());
        });

        it("Should filter by IN and NOT IN", done => 
        {
            let criteria = new QueryCriteria();
            new QueryBuilder()
                .select()
                .set("*")
                .from("user_messages")
                .where(
                    criteria.andX(
                        criteria.in("sender_id", [2]),
                        criteria.notin("sender_id", [1])
                    )
                )
                .execute()
                .then(results => expect(results).to.be.lengthOf(2))
                .then(() => done());
        });

        it("Should GROUP query results", done => 
        {
            new QueryBuilder()
                .select()
                .from("user_messages")
                .set(["COUNT(*)", "total"])
                .group("sender_id")
                .execute()
                .then(results => expect(results).to.be.lengthOf(2))
                .then(() => done());
        });

        it("Should LIMIT and OFFSET results", done => 
        {
            new QueryBuilder()
                .select()
                .from("user")
                .set("id", ["first_name", "name"])
                .limit(1)
                .offset(1)
                .execute()
                .then(response =>
                    expect(response[0].name).to.be.equal("Another")
                )
                .then(() => done());
        });

        it("Should filter queries without trouble", done => 
        {
            new QueryBuilder()
                .select()
                .from("user")
                .set("*")
                .where("active = 1")
                .execute()
                .then(results => expect(results).to.be.lengthOf(1))
                .then(() => done());
        });

        it("Should filter query using QueryCriteria", done => 
        {
            let criteria = new QueryCriteria();
            new QueryBuilder()
                .select()
                .from("user")
                .set("*")
                .where(
                    criteria.andX(
                        criteria.eq("active", 1),
                        criteria.like("first_name", "other"),
                        criteria.eq("extra", null)
                    )
                )
                .execute()
                .then(results => expect(results).to.be.lengthOf(0))
                .then(() => done());
        });

        it("Should execute subquery", done => 
        {
            new QueryBuilder()
                .select()
                .set("*")
                .from("user_messages")
                .where({
                    sender_id: {
                        in: new QueryBuilder()
                            .select()
                            .set("id")
                            .from("user"),
                        neq: null
                    }
                })
                .execute()
                .then(results => expect(results).to.be.lengthOf(6))
                .then(() => done());
        });

        it("Should test queries with HAVING", done => 
        {
            let criteria = new QueryCriteria();
            new QueryBuilder()
                .select()
                .set(["COUNT(*)", "total"])
                .from("user_messages")
                .group("sender_id")
                .having(criteria.neq("total", 2))
                .execute()
                .then(results => expect(results[0].total).equal(4))
                .then(() => done());
        });

        it("Should test queries with ORDER", done => 
        {
            new QueryBuilder()
                .select()
                .set("last_name", ["extra->points->sender", "sender_points"])
                .from("user")
                .order(["extra->points->sender", "DESC"], "last_name")
                .execute()
                .then(results => 
                {
                    expect(results).to.be.lengthOf(2);
                    expect(results[0]).to.have.property("sender_points");
                    expect(results[0].sender_points).to.be.equal("10");
                })
                .then(() => done());
        });
    });

    describe("UpdateQueryBuilderTest", () => 
    {
        it("Should create update query without trouble", done => 
        {
            new QueryBuilder()
                .update()
                .into("user")
                .set("last_name", "UPPER(last_name)")
                .execute()
                .then(response => expect(response.changedRows).to.be.equal(2))
                .then(() => done());
        });

        it("Should create filtered update query", done => 
        {
            let criteria = new QueryCriteria();
            new QueryBuilder()
                .update()
                .into("user")
                .set("active", true)
                .set("extra", null)
                .where(
                    criteria.andX(
                        criteria.gt("extra->points->sender", 6),
                        criteria.lt("extra->points->sender", 11)
                    )
                )
                .execute()
                .then(response => expect(response.changedRows).to.be.equal(1))
                .then(() => done());
        });
    });

    describe("DeleteQueryBuilderTest", () => 
    {
        it("Should create a delete query", done => 
        {
            new QueryBuilder()
                .delete()
                .from("user_messages")
                .execute()
                .then(response => expect(response.affectedRows).to.be.equal(6))
                .then(() => done());
        });

        it("Should create a delete filtered query", done => 
        {
            let criteria = new QueryCriteria();
            new QueryBuilder()
                .delete()
                .from("user")
                .where(
                    criteria.orX(criteria.gte("id", 2), criteria.lte("id", 0))
                )
                .execute()
                .then(response => expect(response.affectedRows).to.be.equal(1))
                .then(() => done());
        });
    });

    describe("Dropping table", () => 
    {
        it("Should drop a table", done => 
        {
            new QueryBuilder()
                .table()
                .drop("user")
                .execute()
                .then(response => expect(response.affectedRows).to.be.equal(0))
                .then(() => done());
        });

        it("Should drop a table if exists", done => 
        {
            new QueryBuilder()
                .table()
                .ifExists()
                .drop("user_messages")
                .execute()
                .then(response => expect(response.affectedRows).to.be.equal(0))
                .then(() => done());
        });
    });
});
