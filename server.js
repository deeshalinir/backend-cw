const express = require("express");
const app = express();
const path = require("path");

const imagePath = path.resolve(__dirname, "images");

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