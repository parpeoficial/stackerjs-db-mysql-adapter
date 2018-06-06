import { Config } from "stackerjs-utils";

module.exports = {
    host: Config.env("DB_HOST"),
    name: Config.env("DB_NAME"),
    user: Config.env("DB_USER"),
    pass: Config.env("DB_PASS"),
    log: Config.env("DB_LOG", 0),
    connection_limit: Config.env("DB_CONNECTION_LIMIT")
};
