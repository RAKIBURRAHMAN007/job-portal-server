const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k53g2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    // job related apis

    const jobsCollection = client.db('job-portal').collection('jobs');
    const jobsApplicationsCollection = client.db('job-portal').collection('jobApplications');

    app.get('/jobs',async(req,res)=>{
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/jobs',async(req,res)=>{
      const newJob = req.body;
      const result =await jobsCollection.insertOne(newJob);
      res.send(result);
    })

    app.get('/jobs/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await jobsCollection.findOne(query);
      res.send(result);
    })

    
    // job application apis
    app.post('/jobApplications',async(req,res)=>{
      const application = req.body;
      const result = await jobsApplicationsCollection.insertOne(application);
      res.send(result);


    })
 
    app.get('/jobApplications',async(req,res)=>{
      const email = req.query.email;
      const query = {applicant_email: email};
      const result = await jobsApplicationsCollection.find(query).toArray();
      for(const application of result){
        const query1 = {_id : new ObjectId(application.job_id)};
        const job = await jobsCollection.findOne(query1);
        if(job){
          application.title=job.title;
          application.company=job.company;
          application.company_logo=job.company_logo;
          application.location=job.location;
          application.applicationDeadline=job.applicationDeadline;
        }
      }
      res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req,res)=>{
    res.send('job is falling from the sky');
})

app.listen(port,()=>{
    console.log(`job is wating at ${port}`)
})