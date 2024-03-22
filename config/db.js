const mysql = require("mysql2");


let config = {
    host: "database-2.c1k2wsqgk8ql.ap-southeast-1.rds.amazonaws.com",
    user: "admin",
    password: "BIGMOM_LUFFY_TH123",
    database: "bookheaven",
  };

  const connection = mysql.createConnection(config);


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Database is connected');
});

function queryCallback(sql, values, callback) {
    connection.query(sql, values, callback);
}

// Function to execute queries using promises
function queryPromise(sql, values) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, function(err, results, fields) {
            if (err) {
                reject(err);
            } else {
                resolve([results, fields]);
            }
        });
    });
}

module.exports = {
    connection: connection,
    queryCallback: queryCallback,
    queryPromise: queryPromise
};