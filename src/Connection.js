import mysql from "mysql";
import { Config } from "stackerjs-utils";

export class Connection 
{
    static query(query, parameters = []) 
    {
        if (!this.isConnected()) this.connect();

        return new Promise((resolve, reject) => 
        {
            if (Config.get("db.log")) console.log(query);
            this.pool.getConnection((err, connection) =>
                err
                    ? reject(err)
                    : connection.query(query, parameters, (err, result) => 
                    {
                        if (err) return reject(err);

                        connection.release();
                        return resolve(result);
                    }));
        }).then(result => 
        {
            if (Array.isArray(result)) return result;
            return {
                affectedRows: result.affectedRows,
                changedRows: result.changedRows,
                lastInsertedId: result.insertId,
            };
        });
    }

    static isConnected() 
    {
        if (!this.pool) return false;

        return !this.pool._closed;
    }

    static connect() 
    {
        this.pool = mysql.createPool(this.parameters);

        return Promise.resolve(true);
    }

    static disconnect() 
    {
        return new Promise((resolve, reject) =>
            this.isConnected()
                ? this.pool.end(err => 
                {
                    if (err) return reject(err);

                    this.pool = null;
                    resolve(true);
                })
                : resolve(true));
    }
}
Connection.parameters = {
    host: Config.get("db.host"),
    database: Config.get("db.name"),
    user: Config.get("db.user"),
    password: Config.get("db.pass"),
};
Connection.pool = null;
