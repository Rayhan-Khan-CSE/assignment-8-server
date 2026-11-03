import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
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
const joinedCollection = db.collection("joined")

app.post('/createEvent', async(req,res) =>{
    const data = req.body
    const result = await destinationCollection.insertOne(data);
    console.log(result)
    res.send(result)
})

app.post('/joined', async(req,res) =>{
  const data = req.body
    const result = await joinedCollection.insertOne(data);
    console.log(result)
    res.send(result)
})

app.get('/my-events/:email', async(req,res) =>{
  const {email} = req.params
  const result = await joinedCollection.find({email:email}).toArray()
  res.send(result)
})

app.get('/events', async(req,res) =>{
  const result = await destinationCollection.find().toArray()
  res.send(result)
})

app.get('/events/:id', async(req,res) =>{
  const {id} = req.params;
  const result = await destinationCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})

app.patch('/events/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const preEvent = await destinationCollection.findOne({
    _id: new ObjectId(id)
  });
  const result1 = await destinationCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );
  const result2 = await joinedCollection.updateMany(
    { title: preEvent.title },
    { $set: updatedData }
  );
  res.send({
    destinationUpdated: result1.modifiedCount,
    joinedUpdated: result2.modifiedCount
  });
});

app.delete('/events/:id', async (req, res) => {
    const { id } = req.params;
    const event = await destinationCollection.findOne({
        _id: new ObjectId(id)
    });
    const result1 = await destinationCollection.deleteOne({
        _id: new ObjectId(id)
    });
    const result2 = await joinedCollection.deleteMany({
        title: event.title
    });
    res.send({
        destinationDeleted: result1.deletedCount,
        joinedDeleted: result2.deletedCount
    });

});

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(PORT, () =>{
    console.log(`Server is running at ${PORT}`);
})