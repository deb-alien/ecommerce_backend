import dotenv from 'dotenv';
import { connect } from 'mongoose';

dotenv.config({ quiet: true });

/**
 * Connects to the MongoDB database
 * @function connectMongo
 * @returns {Promise<void>} Resolves when the database connection is established
 * @throws {Error} If the connection to the database fails
 * @description
 * This function connects to the MongoDB database using the MONGO_URI environment variable.
 * The MONGO_URI must be in the format of
 * mongodb://username:password@host:port/database
 * The function will throw an error if the connection fails.
 * The function will log a message to the console when the connection is established.
 */
export default async function connectMongo(): Promise<void> {
    try {
        const mongo_uri = process.env.MONGO_URI;
        await connect(mongo_uri!);
        console.log(`Database Connected Successfully`);
    } catch (error) {
        console.log('Mongo Error: ', error);
        throw error && process.exit(1);
    }
}
