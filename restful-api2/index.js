const express = require('express');
require('dotenv').config();
const { connect } = require('./MongoUtil');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const app = express();

app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

async function main() {

    const db = await connect(MONGO_URI, DB_NAME);

    // CREATE
    app.post('/recipes/add',async function(req,res){
        let result = await db.collection('recipes').insertOne({
            'title': req.body.title,
            'ingredients': req.body.ingredients,
            'prep_time': req.body.prep_time
        })
        res.status(200);
        res.send(result);
    })

    // SEARCH
    app.get('/recipes',async function(req,res){
        let criteria = {};
        if(req.query.title) {
            criteria.title = {
                '$regex': req.query.title, '$options': 'i'
            }
        }

        if(req.query.ingredients) {
            criteria.ingredients = {
                '$regex': req.query.ingredients, '$options': 'i'
            }
        }

        if(req.query.min_prep) {
            criteria.prep_time = {
                '$gte': parseInt(req.query.min_prep)
            }
        }

        if(req.query.max_prep) {
            criteria.prep_time = {
                '$lte': parseInt(req.query.max_prep)
            }
        }

        let result = await db.collection('recipes').find(criteria, {
            'projection': {
                'title': 1,
                'prep_time': 1
            }
        }).toArray();
        res.send(result)
    })

    // UPDATE
    app.put('/recipes/:id',async function(req,res){
        let recipe = await db.collection('recipes').findOne({
            '_id': ObjectId(req.params.id)
        })

        let result = await db.collection('recipes').updateOne({
            '_id': ObjectId(req.params.id)
        },{
            '$set': {
                'title': req.body.title ? req.body.title : recipe.title,
                'ingredients': req.body.ingredients ? req.body.ingredients : recipe.description,
                'prep_time': req.body.prep_time ? req.body.prep_time : recipe.prep_time
            }
        })
        res.status(200);
        res.send(result);
    })

    // DELETE
    app.delete('/recipes/:id',async function(req,res){
        await db.collection('recipes').deleteOne({
            '_id': ObjectId(req.params.id)
        })
        res.status(200);
        res.json({
            'status': 'ok'
        })
    })
}
main()

app.listen(3000, function(){
    console.log('server start...')
})