const express = require('express');
require('dotenv').config();
const { connect } = require('./MongoUtil');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

function checkIfAuthenticationJWT(req,res,next) {
    if(req.headers.authorization) {
        const headers = req.headers.authorization;
        const token = headers.split(' ')[1];

        jwt.verify(token, process.env.TOKEN_SECRET, function(err, tokenData){
            if(err) {
                res.sendStatus(403);
                return;
            }
            req.user = tokenData;
            next();
        })
    } else {
        res.sendStatus(403);
    }
}

async function main() {

    const db = await connect(MONGO_URI, DB_NAME);

    // CREATE - Task 2: Create a Add Recipe Endpoint
    app.post('/recipes/add',[checkIfAuthenticationJWT],async function(req,res){
        let result = await db.collection('recipes').insertOne({
            'title': req.body.title,
            'ingredients': req.body.ingredients,
            'prep_time': req.body.prep_time,
            'user_id': ObjectId(req.user.user_id)
        })
        res.status(201);
        res.send(result);
    })

    // SEARCH - Task 3: Create a Get all Recipes Endpoint
    app.get('/recipes',[checkIfAuthenticationJWT],async function(req,res){
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
        res.status(200);
        res.send(result);
    })

    // UPDATE - Task 4: Create a Update Recipe Endpoint
    app.put('/recipes/:id',[checkIfAuthenticationJWT],async function(req,res){
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

    // DELETE - Task 5: Create a Delete Recipe Endpoint
    app.delete('/recipes/:id',[checkIfAuthenticationJWT],async function(req,res){
        await db.collection('recipes').deleteOne({
            '_id': ObjectId(req.params.id)
        })
        res.status(200);
        res.send(result);
    })

    // CREATE EMBEDDED DOCUMENT - Task 6: Create an endpoint to add a review to a recipe
    app.post('/recipes/:id/reviews',[checkIfAuthenticationJWT],async function(req,res){
        let result = await db.collection('recipes').updateOne({
            '_id': ObjectId(req.params.id)
        },{
            '$push': {
                'reviews': {
                    '_id': ObjectId(),
                    'email': req.body.email,
                    'content': req.body.content,
                    'rating': req.body.rating
                }
            }
        })
        res.status(200);
        res.send(result);
    })

    // DISPLAY - Task 7: Get recipe details
    app.get('/recipes/:id/reviews',[checkIfAuthenticationJWT],async function(req,res){
        let result = await db.collection('recipes').findOne({
            '_id': ObjectId(req.params.id)
        },{
            'projection': {
                '_id': 1,
                'title': 1,
                'ingredients': 1,
                'reviews': 1
            }
        })
        res.status(200);
        res.send(result);
    })

    // UPDATE - Task 8: Update a review for a recipe
    app.put('/recipes/:id/reviews/:reviewid',[checkIfAuthenticationJWT],async function(req,res){
        let review = await db.collection('recipes').findOne({
            '_id': ObjectId(req.params.id),
            'reviews._id': ObjectId(req.params.reviewid)
        },{
            'projection': {
                'reviews.$': 1,
            }
        })

        let result = await db.collection('recipes').updateOne({
            '_id': ObjectId(req.params.id),
            'reviews._id': ObjectId(req.params.reviewid)
        },{
            '$set': {
                'reviews.$.email': req.body.email ? req.body.email : review.email,
                'reviews.$.content': req.body.content ? req.body.content : review.content,
                'reviews.$.rating': req.body.rating ? req.body.rating : review.rating
            }
        })
        res.status(200);
        res.send(result);
    })

    // SIGNUP USER
    app.post('/users',async function(req,res){
        let newUser = {
            'email': req.body.email,
            'password': req.body.password
        }
        let result = await db.collection('users').insertOne(newUser);
        res.status(201);
        res.json({
            'message': 'New user created successfully!',
            'result': result
        })
    })

    // LOGIN
    app.post('/login',async function(req,res){
        let user = await db.collection('users').findOne({
            'email': req.body.email,
            'password': req.body.password
        })

        if(user) {
            let token = jwt.sign({
                'email': req.body.email,
                'user_id': user._id
            },process.env.TOKEN_SECRET,{
                'expiresIn': '15m'
            })
            res.json({
                'accessToken': token
            })
        } else {
            res.status(401)
            res.json({
                'message': 'Invalid email and password!'
            })
        }
    })

    // VIEW PROFILE 
    app.get('/users/:userid',[checkIfAuthenticationJWT],async function(req,res){
        res.json({
            'email': req.user.email,
            'user_id': req.user.user_id,
            'message': 'You are viewing your profile'
        })
    })

}
main()

app.listen(3000, function(){
    console.log('server start...')
})