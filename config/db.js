import { Config } from "stackerjs-utils";

module.exports = {
    host: Config.env("db.host"),
    name: Config.env("db.name"),
    user: Config.env("db.user"),
    pass: Config.env("db.pass")
};
