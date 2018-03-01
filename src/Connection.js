import mysql from 'mysql';
import { Config } from 'stackerjs-utils';


export class Connection
{

    constructor()
    {
        this.conn;

        this.parameters = {
            'host': Config.get('db.host'),
            'name': Config.get('db.name'),
            'user': Config.get('db.user'),
            'pass': Config.get('db.pass'),
        }
    }

    query(query, parameters = [])
    {
        if (!this.isConnected())
            this.connect();

        return new Promise((resolve, reject) => 
        {
            this.conn.query(query, parameters, (err, result) => {
                this.disconnect();
                if (err)
                    return reject(err);

                resolve(result);
            });
        })
        .then(result => {
            if (Array.isArray(result))
                return result;

            return {
                'affectedRows': result.affectedRows,
                'changedRows': result.changedRows,
                'lastInsertedId': result.insertId
            }
        });
    }

    isConnected()
    {
        return this.conn && !this.conn._closed;
    }

    connect()
    {
        let { host, name, user, pass } = this.parameters;
        this.conn = mysql.createConnection({
            host,
            'database': name,
            user,
            'password': pass
        });

        this.conn.connect();
    }

    disconnect()
    {
        if (this.conn)
            this.conn.destroy();
            
        this.conn = null;
    }

}