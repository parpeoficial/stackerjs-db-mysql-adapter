import mysql from "mysql";
import { Config } from "stackerjs-utils";

export class Connection 
{
    static connect() 
    {
        this.pool = mysql.createPool(this.parameters);
        return Promise.resolve(true);
    }

    static isConnected() 
    {
        if (!this.pool) return false;
        return !this.pool._closed;
    }

    static query(query, parameters = []) 
    {
        if (!this.isConnected()) this.connect();

        return new Promise((resolve, reject) => 
        {
            if (Config.get("db.log")) console.log(query);
            this.pool.getConnection((err, connection) => 
            {
                if (err) return reject(err);
                connection.query(query, parameters, (err, result) => 
                {
                    connection.release();
                    return err ? reject(err) : resolve(result);
                });
            });
        }).then(result => 
        {
            if (Array.isArray(result)) return result;
            return {
                affectedRows: result.affectedRows,
                changedRows: result.changedRows,
                lastInsertedId: result.insertId
            };
        });
    }

    static disconnect() 
    {
        return new Promise((resolve, reject) => 
        {
            if (this.isConnected())
                this.pool.end(err => 
                {
                    if (err) return reject(err);
                    this.pool = null;
                    return resolve(true);
                });

            return resolve(true);
        });
    }
}

Connection.parameters = {
    host: Config.get("db.host"),
    database: Config.get("db.name"),
    user: Config.get("db.user"),
    password: Config.get("db.pass"),
    waitForConnections: true,
    queueLimit: 0,
    connectionLimit: Config.get("db.connection_limit") || 10
};

Connection.pool = null;
