import mysql from "mysql2";
import genericPool from "generic-pool";
import { Config } from "stackerjs-utils";

export class Connection 
{
    static connect() 
    {
        this.pool = genericPool.createPool(this.factory, this.parameters);
        return Promise.resolve(true);
    }

    static isConnected() 
    {
        if (!this.pool) return false;
        return true;
    }

    static query(query, parameters = []) 
    {
        if (!this.isConnected()) this.connect();

        return new Promise((resolve, reject) => 
        {
            if (this.parameters.log) console.log(query);
            this.pool
                .acquire()
                .then(connection => 
                {
                    connection.query(query, parameters, (err, result) => 
                    {
                        this.pool.release(connection);
                        return err ? reject(err) : resolve(result);
                    });
                })
                .catch(err => reject(err));
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
        this.pool.drain().then(() => 
        {
            this.pool.clear();
            this.pool = null;
        });
        return Promise.resolve(true);
    }
}

Connection.factory = {
    create: function() 
    {
        return mysql.createConnection({
            host: Config.get("db.host"),
            database: Config.get("db.name"),
            user: Config.get("db.user"),
            password: Config.get("db.pass")
        });
    },
    destroy: function(client) 
    {
        client.end();
    }
};

Connection.parameters = {
    evictionRunIntervalMillis:
        Config.get("db.connection.idle_timeout") || 60000,
    idleTimeoutMillis: Config.get("db.connection.idle_timeout") || 30000,
    min: Config.get("db.connection.min") || 2,
    max: Config.get("db.connection.limit") || 10,
    log: Config.get("db.log") || false
};

Connection.pool = null;
