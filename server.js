const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const imagesPath = path.resolve(__dirname, "images");

app.use(express.json());


let propertiesReader = require("properties-reader");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = "mongodb+srv://dr721:dbcw2024.@cluster0.xyiab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tlsInsecure: true,
});

async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      app.locals.db = client.db('afterschool');
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch(err) {
        console.error("Error",err);
        process.exit(1);
    }
}


run().then(() => {
    app.listen(8765, function () {
        console.log("App started on port 8765");
    });
});

app.use(cors({
    origin: '*'
}));

app.get("/", function (req, res) {
    res.send("Welcome to our webpage");
});

app.param('collectionName',  function(req, res, next, collectionName){
    if (!req.app.locals.db){
        return next(new Error('Database connection not established'));
    }
    req.collection = req.app.locals.db.collection(collectionName);
    console.log(req.collection.collectionName);
    return next();
});


app.get('/:collectionName', async function(req, res, next) {
    try {
      const result = await req.collection.find({}).toArray();
      res.send(result);

    } catch(err) {
      next(err);
    }
});

app.use("/images", express.static(imagesPath));

app.post('/order', async function(req, res) {
  try {
      const { name, phoneNumber, lessonIDs } = req.body;
      const orderData = { name, phoneNumber, lessonIDs };

      // Validate input fields
      if (!name || !phoneNumber || !Array.isArray(lessonIDs)) {
          return res.status(400).send({ error: 'Invalid order data.' });
      }

      const collection = req.app.locals.db.collection('order'); // accesses the order collection

      const result = await collection.insertOne(orderData); // inserts new order into the collection
      res.status(201).send({ message: "Order successfully saved", orderID: result.insertedId }); // sends success response with status code 201
  } catch (err) {
      console.error("Error inserting order:", err);
      res.status(500).send({ error: 'Failed to save the order.' });
  }
});

app.put('/lesson/:id', async (req, res) => {
  try{
    const lessonId = req.params.id; //it gets the lesson id
    const updateData = req.body; //new data to update the lesson

    if(!ObjectId.isValid(lessonId)) {
      return res.status(400).send({error:'Invalid lesson ID.'});
    }

    const collection = req.app.locals.db.collection('lessons'); //accesses the 'lessons' collection

    const result = await collection.updateOne( //updates the availableSpace field (frontend)
      {_id: new ObjectId(lessonId)},
      { $set: { availableSpaces: availableSpaces}}
    );

    if (result.macthedCount === 0) {
      return res.status(404).send({error: 'Lesson not found.'});
    }

    res.status(200).send({ message: 'Lesson updated successfully.'});
  } catch (err){
    console.error('Error updating lesson:', err);
    res.status(500).send({ error: 'Failed to update the lesson.'});
  }
});