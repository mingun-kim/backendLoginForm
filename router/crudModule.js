const pg = require("pg");
const client = pg.Client;
const pgInit = require("../pgConn");

const crudModule = {
    get: async(seq) => {
        const pgConn = new client(pgInit);
    
        const error = await pgConn.connect();
        if (error) {
            console.log("ERROR", error);
            return false;
        }
        
        let testQuery = "SELECT * FROM secondsch.user_info WHERE seq=$1";
        let param = [seq];

        const results = await pgConn.query(testQuery, param)
        await pgConn.end();
        if (results.rows.length) {
            return results.rows[0];
        }
    },
    getId: async(id) => {
        const pgConn = new client(pgInit);
    
        const error = await pgConn.connect();
        if (error) {
            console.log("ERROR", error);
            return false;
        }
        
        let testQuery = "SELECT * FROM secondsch.account WHERE id=$1";
        let param = [id];

        const results = await pgConn.query(testQuery, param)
        await pgConn.end();
        if (results.rows.length) {
            return false;
        } else {
            return true;
        }
    },
    post: async(id, pw) => {
        const pgConn = new client(pgInit);
    
        const error = await pgConn.connect();
        if (error) {
            console.log("ERROR", error);
            return false;
        }

        let testQuery = "SELECT * FROM secondsch.account WHERE id=$1 AND pw=$2";
        let param = [id, pw];

        const results = await pgConn.query(testQuery, param)
        await pgConn.end();
        if (results.rows.length) {
            results.rows[0].success = true;
            return results.rows[0];
        }
    },
    postSignUp: async(id, pw, name, age, email) => {
        const since = new Date().toISOString();
        const paramLogin = [id, pw];
        const paramInfo = [name, age, email, since];
        const pgConn = new client(pgInit);
    
        const error = await pgConn.connect();
        if (error) {
            console.log("ERROR", error);
            return false;
        }
        
        let testQuery = "INSERT INTO secondsch.account(id, pw) VALUES($1, $2)";

        try {
            const errLogin = await pgConn.query(testQuery, paramLogin);
            
        } catch (error) {
            console.log(error);
            return false;
        }

        testQuery = "INSERT INTO secondsch.user_info(name, age, email, since) VALUES($1, $2, $3, $4)";

        try {
            const errInfo = await pgConn.query(testQuery, paramInfo);
            
        } catch (error) {
            console.log(error);
            return false;
        }

        await pgConn.end();
        return true;
    },
    put: async(seq, id, name, age, email) => {
        const paramLogin = [id, seq];
        const paramInfo = [name, age, email, seq];
        const pgConn = new client(pgInit);
    
        const error = await pgConn.connect();
        if (error) {
            console.log("ERROR", error);
            return false;
        }
        
        let testQuery = "UPDATE secondsch.account SET id=$1 WHERE seq=$2";

        const errLogin = await pgConn.query(testQuery, paramLogin);

        testQuery = await "UPDATE secondsch.user_info SET name=$1, age=$2, email=$3 WHERE seq=$4";

        const errInfo = await pgConn.query(testQuery, paramInfo);

        await pgConn.end();
        return true;
    },
    putPw: async(seq, pw) => {
        const param = [pw, seq];
        const pgConn = new client(pgInit);
    
        const error = await pgConn.connect();
        if (error) {
            console.log("ERROR", error);
            return false;
        }
        
        let testQuery = "UPDATE secondsch.account SET pw=$1 WHERE seq=$2";

        const err = await pgConn.query(testQuery, param);

        await pgConn.end();
        return true;
    },
    delete: async(seq) => {
        const param = [seq];
        const pgConn = new client(pgInit);
    
        const error = await pgConn.connect();
        if (error) {
            console.log("ERROR", error);
            return false;
        }
        
        let testQuery = "DELETE FROM secondsch.account WHERE seq=$1";

        const errLogin = await pgConn.query(testQuery, param);

        testQuery = await "DELETE FROM secondsch.user_info WHERE seq=$1";

        const errInfo = await pgConn.query(testQuery, param);

        await pgConn.end();
        return true;
    },
}

module.exports = crudModule;