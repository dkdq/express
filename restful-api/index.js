const express = require('express');
require('dotenv').config();
const { connect } = require('./MongoUtil');
const MONGO_URI = process.env.MONGO_URI;
const cors = require('cors');
const { ObjectId } = require('mongodb');
const app = express();

app.use(express.json());
app.use(cors());

async function main() {

    const db = await connect(MONGO_URI, "food");

    app.get('/',function(req,res){
        res.send('Hello')
    })

    // CREATE
    app.post('/sighting',async function(req,res){
        let description = req.body.description;
        let food = req.body.food;
        let datetime = req.body.datetime ? new Date(req.body.datetime) : new Date();
        let result = await db.collection('sighting').insertOne({
            'description': description,
            'food': food,
            'datetime': datetime
        })
        res.status(201);
        res.send(result);
    })

    // SEARCH ENGINE
    app.get('/sighting',async function(req,res){
        let criteria = {};
        if(req.query.description) {
            criteria['description'] = {
                '$regex': req.query.description, '$options': 'i'
            }
        }

        if(req.query.food) {
            criteria['food'] = {
                '$in': [req.query.food]
            }
        }

        let result = await db.collection('sighting').find(criteria).toArray();
        res.status(200);
        res.send(result);
    })

    // UPDATE
    app.put('/sighting/:id',async function(req,res){
        let description = req.body.description;
        let food = req.body.food;
        let datetime = req.body.datetime ? new Date(req.body.datetime) : new Date();
        let result = await db.collection('sighting').updateOne({
            '_id': ObjectId(req.params.id)
        },{
            '$set': {
                'description': description,
                'food': food,
                'datetime': datetime
            }
        })
        res.status(200);
        res.json(result);
    })

    // DELETE
    app.delete('/sighting/:id',async function(req,res){
        let result = await db.collection('sighting').deleteOne({
            '_id': ObjectId
        })
        res.status(200);
        res.json({
            'status': 'ok'
        });
    })
}
main()

app.listen(3000, function(){
    console.log('server start...')
})