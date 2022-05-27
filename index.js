const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER1}:${process.env.DB_PASSWORD}@cluster0.whfsa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run() {
  try {
    await client.connect();
    const partsCollection = client.db('computerParts').collection('parts');
    
    app.get('/part', async (req, res) => {
      const query = {};
      const cursor = partsCollection.find(query);
      const parts = await cursor.toArray();
      res.send(parts);
    });
   

    ///part details in purchase page
    app.get('/part/:id', async(req , res) =>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        console.log(query)
        const partDetails = await partsCollection.findOne(query);
        res.send(partDetails);
      })
    
     

     

   
  }
  finally {

  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello !')
})

app.listen(port, () => {
  console.log(` listening on port ${port}`)
})