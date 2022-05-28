const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER1}:${process.env.DB_PASSWORD}@cluster0.whfsa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
};


async function run() {
  try {
    await client.connect();
    const partsCollection = client.db('computerParts').collection('parts');
    const orderCollection = client.db('computerParts').collection('orders');
    const userCollection = client.db('computerParts').collection('user');
    
    app.get('/part', async (req, res) => {
      const query = {};
      const cursor = partsCollection.find(query);
      const parts = await cursor.toArray();
      res.send(parts);
    });
   
    // get user
    app.get('/user', async(req, res) =>{
      const users = await userCollection.find().toArray();
      res.send(users)
    })

    app.get('/part/:id', async(req , res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const part = await partsCollection.findOne(query);
      res.send(part);
    })
    
    

    app.get('/orders/:id', verifyJWT, async(req, res) =>{
      const customer = req.query.customer;
      const decodedEmail = req.decoded.email
      if(customer === decodedEmail){
        const query = {customer:customer};
      const orders = await orderCollection.find(query).toArray()
     return res.send(orders)
      }
     else{
       return res.status(403).send({meassage:'forbidden access'});
     }
    })


  


      // send data to database from client side
    app.post('/orders', async(req,res)=>{
      const orders = req.body;
      const result = await orderCollection.insertOne(orders);
      res.send(result);

    }) 
        // updated user
    // app.post('/users', async(req,res)=>{
    //   const users = req.body;
    //   const result = await userCollection.insertOne(users);
    //   res.send(result);

    // }) 


    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
      res.send({ result, token });
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