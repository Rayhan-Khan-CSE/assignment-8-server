import express from 'express';
import { MongoClient } from 'mongodb';
import 'dotenv/config';
import cors from "cors";

const app = express();
const PORT = 5000;
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoClient = await connectToMongoDB();
const db = mongoClient.db("hermione")
const destinationCollection = db.collection("destination")

app.post('/createEvent', async(req,res) =>{
    const data = req.body
    const result = await destinationCollection.insertOne(data);
    console.log(result)
    res.send(result)
})

app.get('/events', async(req,res) =>{
  const result = await destinationCollection.find().toArray()
  res.send(result)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(PORT, () =>{
    console.log(`Server is running at ${PORT}`);
})