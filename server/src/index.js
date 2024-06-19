import "dotenv/config";
import express from "express";
import cors from "cors";
import socketio from "socket.io";
import models, { sequelize } from "./models";

const app = express();
app.use(cors());
app.use(express.json());

// Expose all games' status
app.get("/api/v1/status", async (req, res) => {
  // Get all games
  const games = await models.Game.findAll();
  console.log("games", games);
  res.send(games);
});

// Expose all the inputs on games
app.get("/api/v1/inputs", async (req, res) => {
  // TODO: Get all game play inputs for replay
  // TODO: add historical inputs in game object
  const games = await models.Game.findAll();
  console.log("games", games);
  res.send(games);
});

// Reset backend status from exported status
app.post("/api/v1/reset/status", async (req, res) => {
  console.log("req.body = ", req.body)

  console.log("sequelize", sequelize);
  console.log("models.Game", models.Game);
  await models.Game.truncate();
  
  let { games } = req.body;
  console.log("games", games);
  for (let i = 0; i < games.length; i ++) {
     await models.Game.create(games[i]);
  }
  console.log("done!");
  res.send("done!");
});

sequelize.sync({ force: false }).then(() => {
  const server = app.listen(process.env.PORT, () =>
    console.log(`👂 Chess server listening on port ${process.env.PORT}`)
  );

  const io = socketio.listen(server);

  io.on("connection", (socket) => {
    console.log(`✅ Player ${socket.id} connected`);

    socket.on("move", async (msg) => {
      console.log(`move to game ${msg.gameInfo.id}`);

      const { board, move } = msg;
      const gameId = msg.gameInfo.id;

      console.log('move.msg', msg);

      socket.to(gameId).emit("move", move);
      await models.Game.update(
        { board },
        {
          where: { id: gameId },
        }
      );
    });

    socket.on("createGame", async (msg) => {
      const { gameId, userId } = msg;
      socket.join(gameId);
      const game = {
        id: gameId,
        board: "start",
        players: {},
      };

      console.log('createGame.msg', msg);

      game.players[userId] = "white";
      game.players = JSON.stringify(game.players);

      await models.Game.create(game);
    });

    const joinGame = async (game, userId) => {
      socket.join(game.id);

      //Check if this player has joined this game before
      if (!game.players.hasOwnProperty(userId)) {
        game.players[userId] = "black";
      }

      console.log('startGame.game, userId', game, userId);

      io.in(game.id).emit("startGame", game);
    };

    socket.on("joinGame", async (msg) => {
      const { gameId, userId } = msg;

      const game = await models.Game.findOne({
        where: {
          id: gameId,
        },
      });
      console.log('joinGame.msg', msg);

      if (game !== null) {
        game.players = JSON.parse(game.players);
        joinGame(game, userId);
      } else {
        io.to(socket.id).emit(
          "joinError",
          "No such game exists or has already ended"
        );
      }
    });

    socket.on("resignFromTheGame", async (gameInfo) => {
      console.log('resignFromTheGame.gameInfo', gameInfo);
      const gameId = gameInfo.id;
      console.log(`Ending game ${gameId}`);
      io.in(gameId).emit("endGame");

      await models.Game.destroy({
        where: { id: gameId },
      });
    });

    socket.on("disconnect", () => {
      console.log(`🎮 🚫Player disconnected`);
    });
  });
});
