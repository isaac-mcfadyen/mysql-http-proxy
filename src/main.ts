import polka from "polka";
import mysql from "mysql";
import util from "util";
import { config } from "dotenv";
import bodyParser from "body-parser";
const { json } = bodyParser;

// Load the dotenv config.
config();

console.log("[INFO] Connecting to DB...");
const connection = mysql.createConnection(process.env.CONNECTION_STRING);
const queryDb = util.promisify(connection.query).bind(connection);
console.log("[INFO] Connected!");

console.log("[INFO] Starting server...");
polka()
  .use(json())
  .post("/query", async (req, res) => {
    // Get the JSON encoded body.
    const { query } = req.body;

    // If the query is undefined, return an error.
    if (query === undefined) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No query provided." }));
      return;
    }

    let response: any = [];
    try {
      // Run the query on the DB.
      response = await queryDb(query);
    } catch (e: any) {
      console.log(e);
      response = { error: e.message };
    }

    // Return the response.
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
  })
  .listen(3001, () => {
    console.log("[INFO] Server started on port 3001");
  });
