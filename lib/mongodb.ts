import { MongoClient, type Db } from "mongodb";

let cachedClientPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Falta la variable de entorno MONGODB_URI. Copia .env.local.example a .env.local y complétala."
    );
  }

  if (!cachedClientPromise) {
    const client = new MongoClient(uri, { family: 4 });
    cachedClientPromise = client.connect();
  }

  return cachedClientPromise;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB;
  if (!dbName) {
    throw new Error(
      "Falta la variable de entorno MONGODB_DB. Copia .env.local.example a .env.local y complétala."
    );
  }

  const client = await getClientPromise();
  return client.db(dbName);
}
