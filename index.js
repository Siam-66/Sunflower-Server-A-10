const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mmlf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const sunflowerCollection = client.db('sunflowerDB').collection('sunflower');
    const userCollection = client.db('sunflowerDB').collection('users');
    const applicationCollection = client.db('sunflowerDB').collection('applications');

// for fetch data
app.get('/sunflower',async(req, res)=>{
    const cursor = sunflowerCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})

// Fetch the six most recently added visas
app.get('/latestSunflowers', async (req, res) => {
  try {
    const cursor = sunflowerCollection.find().sort({ _id: -1 }).limit(6); 
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching latest sunflowers:", error);
    res.status(500).send({ error: "Failed to fetch latest sunflowers" });
  }
});


// for connect with mongoDB
app.post('/sunflower',async(req,res)=>{
    const newSunflower = req.body;
    console.log(newSunflower);
    const result = await sunflowerCollection.insertOne(newSunflower);
    res.send(result);
})

// for visa details data
app.get('/sunflower/:id', async(req, res)=> {
  const id = req.params.id;
  const query={_id: new ObjectId(id)}
  const result =await sunflowerCollection.findOne(query);
  res.send(result);
})

// for update data
app.put('/sunflower/:id', async(req, res)=> {
  const id = req.params.id;
  const filter ={_id: new ObjectId(id)}
  const options = {upsert:true};
  const updatedSunflower = req.body;
  const sunflower ={
    $set: {
      countryName:updatedSunflower.countryName, 
      visaType:updatedSunflower.visaType,  
      processingTime:updatedSunflower.processingTime,   
      fee:updatedSunflower.fee, 
      validity:updatedSunflower.validity, 
      applicationMethod:updatedSunflower.applicationMethod,
    }
  }
  const result = await sunflowerCollection.updateOne(filter,sunflower,options);
  res.send(result);
})



// for delete data
app.delete('/sunflower/:id', async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await sunflowerCollection.deleteOne(query);
  res.send(result);
})

// user api
app.post('/users',async(req, res)=>{
  const newUser =req.body;
  console.log('creating new user',newUser);
  const result = await userCollection.insertOne(newUser);
  res.send(result);
})

// user fetch
app.get('/users',async(req, res)=>{
  const cursor = userCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

// applications

app.post('/applications',async(req, res)=>{
  const newApplication =req.body;
  console.log('creating new Applications',newApplication);
  const result = await applicationCollection.insertOne(newApplication);
  res.send(result);
})

// applications fetch
app.get('/applications',async(req, res)=>{
  const cursor = applicationCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

// for delete data
app.delete('/applications/:id', async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await applicationCollection.deleteOne(query);
  res.send(result);
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Sunflower is blooming oil')
})
app.listen(port,()=>{
    console.log(`Sunflower is blooming on port: ${port}`)
})