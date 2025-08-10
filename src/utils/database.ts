import dotenv from 'dotenv';
import { connect } from 'mongoose';

dotenv.config({ quiet: true });

export default async function connecMongo() {
  try {
    const mongo_uri = process.env.MONGO_URI;
    const conn = await connect(mongo_uri!);
    console.log(`Database Connected Successfully`);
  } catch (error) {
    console.log('Mongo Error: ', error);
    process.exit(1);
  }
}
