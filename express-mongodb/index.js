const express = require('express');
const hbs = require('hbs');
const waxon = require('wax-on');
require('dotenv').config(); // must show before MONGO_URI
const { connect } = require('./MongoUtil');
const { ObjectId } = require('mongodb');

const app = express();

app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: false
}));

waxon.on(hbs.handlebars);
waxon.setLayoutPath('./views/layouts');

const helpers = require('handlebars-helpers')({
    'handlebars': hbs.handlebars 
})

const MONGO_URI = process.env.MONGO_URI;
const FOOD = 'food';
const PETS = 'pets';

async function main(){
    const db = await connect(MONGO_URI, FOOD);

    // read
    app.get('/',async function(req,res){
        let foodResponse = await db.collection('food_records').find({}).limit(10).toArray();
        // res.send(data);
        res.render('food-record',{
            'foodRecord': foodResponse
        })
    })

    // create
    app.get('/add-food',async function(req,res){
        res.render('add-food')
    })

    app.post('/add-food',async function(req,res){
        console.log(req.body);
        let foodName = req.body.foodName;
        let calories = req.body.calories;
        let meal  = req.body.meal;
        let tags = req.body.tags;

        if(!tags) {
            tags = []
        } else {
            if(Array.isArray(tags) == false) {
                tags = [tags]
            }
        }

        await db.collection('food_records').insertOne({
            'foodName': foodName,
            'meal': meal,
            'calories': calories,
            'tags': tags
        })
        // res.send('New food records inserted')
        res.redirect('/')
    })
    
    // update
    app.get('/update-food/:id',async function(req,res){
        let id = req.params.id;
        let foodResponse = await db.collection('food_records').findOne({
            '_id': ObjectId(id)
        })
        res.render('update-food',{
            'foodRecord': foodResponse
        })
    })

    app.post('/update-food/:id',async function(req,res){
        console.log(req.body);
        let id = req.params.id;
        let foodName = req.body.foodName;
        let calories = req.body.calories;
        let meal  = req.body.meal;
        let tags = req.body.tags;

        if(!tags) {
            tags = []
        } else {
            if(Array.isArray(tags) == false) {
                tags = [tags]
            }
        }

        await db.collection('food_records').updateOne({
            '_id': ObjectId(id)
        },{
            '$set': {
                'foodName': foodName,
                'meal': meal,
                'calories': calories,
                'tags': tags
            }
        })
        res.redirect('/')
    })

    // delete
    app.get('/delete-food/:id',async function(req,res){
        let id = req.params.id;
        let foodResponse = await db.collection('food_records').findOne({
            '_id': ObjectId(id)
        })
        res.render('delete-food',{
            'foodRecord': foodResponse
        })
    })

    app.post('/delete-food/:id ',async function(req,res){
        let id = req.params.id;
        await db.collection('food_records').deleteOne({
            '_id': ObjectId(id)
        })
        res.redirect('/')
    })

    // EMBEDDED DOCUMENT READ
    app.get('/:id/note',async function(req,res){
        let foodResponse = await db.collection('food_records').findOne({
            '_id': ObjectId(req.params.id)
        })
        res.render('all-note',{
            'foodRecord': foodResponse
        })
    })

    // EMBEDDED DOCUMENT CREATE
    app.get('/:id/note/add',async function(req,res){
        let foodResponse = await db.collection('food_records').findOne({
            '_id': ObjectId(req.params.id)
        },{
            'projection': {
                'foodName': 1
            }
        })
        res.render('add-note',{
            'foodRecord': foodResponse
        })
    })

    app.post('/:id/note/add',async function(req,res){
        await db.collection('food_records').updateOne({
            '_id': ObjectId(req.params.id)
        },{
            '$push': {
                'note': {
                    '_id': ObjectId(),
                    'comment': req.body.comment
                }
            }
        })
        res.redirect(`/${req.params.id}/note`)
    })

    // EMBEDDED DOCUMENT UPDATE
    app.get('/:id/note/:noteid/update',async function(req,res){
        let foodResponse = await db.collection('food_records').findOne({
            '_id': ObjectId(req.params.id)
        },{
            'projection': {
                'note': {
                    '$elemMatch': {
                        '_id': ObjectId(req.params.noteid)
                    }
                }
            }
        })
        // res.send(foodResponse);
        let noteUpdate = foodResponse.note[0].comment ;
        res.render('update-note',{
            'comment': noteUpdate
        })
    })

    app.post('/:id/note/:noteid/update',async function(req,res){
        await db.collection('food_records').updateOne({
            '_id': ObjectId(req.params.id),
            'note._id': ObjectId(req.params.noteid)
        },{
            '$set': {
                'note.$.comment': req.body.comment
            }
        })
        res.redirect(`/${req.params.id}/note`)
    })

    // EMBEDDED DOCUMENT DELETE
    app.get('/:id/note/:noteid/delete',async function(req,res){
        let foodResponse = await db.collection('food_records').findOne({
            '_id': ObjectId(req.params.id),
            'note._id': ObjectId(req.params.noteid)
        },{
            'projection': {
                'note.$': 1
            }
        })
        // res.send(foodResponse);
        let noteDelete = foodResponse.note[0].comment;
        res.render('delete-note',{
            'note': noteDelete
        })
    })

    app.post('/:id/note/:noteid/delete',async function(req,res){
        await db.collection('food_records').updateOne({
            '_id': ObjectId(req.params.id)
        },{
            '$pull': {
                'note': {
                    '_id': ObjectId(req.params.noteid)
                }
            }
        })
        res.redirect(`/${req.params.id}/note`)
    })

    // read2
    app.get('/pet-record',async function(req,res){
        let petResponse = await db.collection('pet_records').find({}).toArray();
        res.render('pet-record',{
            'petRecord': petResponse
        })
    })

    // create2
    app.get('/add-pet',async function(req,res){
        res.render('add-pet')
    })

    app.post('/add-pet',async function(req,res){
        console.log(req.body);
        let name = req.body.name;
        let age = req.body.age;
        let breed = req.body.breed;
        let problems = req.body.problems.split(',');
        let hdb = req.body.hdb == 'true';
        let tags = req.body.tags

        if(!tags) {
            tags = []
        } else {
            if(Array.isArray(tags) == false) {
                tags = [tags]
            }
        }

        await db.collection('pet_records').insertOne({
            'name': name,
            'age': age,
            'breed': breed,
            'problems': problems,
            'tags': tags,
            'hdb': hdb
        })
        res.redirect('/pet-record')
    })

    // update2
    app.get('/update-pet/:id',async function(req,res){
        let id = req.params.id;
        let petResponse = await db.collection('pet_records').findOne({
            '_id': ObjectId(id)
        })
        res.render('update-pet',{
            'petRecord': petResponse
        })
    })

    app.post('/update-pet/:id',async function(req,res){
        console.log(req.body);
        let id = req.params.id;
        let name = req.body.name;
        let age = req.body.age;
        let breed = req.body.breed;
        let problems = req.body.problems.split(',');
        let tags = req.body.tags;
        let hdb = req.body.hdb == 'true';

        await db.collection('food_records').updateOne({
            '_id': ObjectId(id)
        },{
            $set: {
                'name': name,
                'age': age,
                'breed': breed,
                'problems': problems,
                'tags': tags,
                'hdb': hdb
            }
        })
        res.redirect('/pet-record')
    })

    // delete2
    app.get('/delete-pet/:id',async function(req,res){
        let id = req.params.id;
        let petResponse = await db.collection('pet_records').findOne({
            '_id': ObjectId(id)
        })
        res.render('delete-pet',{
            'petRecord': petResponse
        })
    })

    app.post('/delete-pet/:id',async function(req,res){
        let id = req.params.id;
        await db.collection('pet_records').deleteOne({
            '_id': ObjectId(id)
        })
        res.redirect('/pet-record')
    })

}
main();

app.listen(3000, function(){
    console.log('server start!!!!!')
})