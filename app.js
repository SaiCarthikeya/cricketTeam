const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

app.use(express.json());

let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("server Connected");
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;
  `;
  const dbResponse = await db.all(getPlayersQuery);
  const players = dbResponse.map(convertDbObjectToResponseObject);
  response.send(players);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const postPlayersQuery = `
    INSERT INTO cricket_team (player_name, jersey_number, role) VALUES ('${playerName}', ${jerseyNumber}, '${role}');`;
  const dbResponse = await db.run(postPlayersQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const playerId = request.params.playerId;
  const getPlayerQuery = `
  SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const dbResponse = await db.get(getPlayerQuery);
  const newPlayer = convertDbObjectToResponseObject(dbResponse);
  response.send(newPlayer);
});

app.put("/players/:playerId/", async (request, response) => {
  const playerId = request.params.playerId;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;
  const dbResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const playerId = request.params.playerId;
  const deletePlayerQuery = `
  DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  const dbResponse = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

const getData = async () => {
  let data = await db.get(`SELECT * FROM cricket_team WHERE player_id = 2;`);
  console.log(data);
};

(async () => {
  await initializeServerAndDb();
  await getData();
  console.log("Done");
})();

module.exports = app;
