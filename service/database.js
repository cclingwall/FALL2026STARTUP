const { MongoClient } = require('mongodb');

let client;

async function connectDatabase() {
  const { userName, password, hostname } = require('./dbConfig.json');
  const uri = `mongodb+srv://${encodeURIComponent(userName)}:${encodeURIComponent(password)}@${hostname}/?authSource=admin`;
  client ??= new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  const database = client.db('pitch_royale');
  await database.command({ ping: 1 });
  return database;
}

module.exports = { connectDatabase };
