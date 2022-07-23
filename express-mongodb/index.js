const express = require('express');
const hbs = require('hbs');
const waxon = require('wax-on');
const dotenv = require('dotenv').config(); // must show before MONGO_URI
const { connect } = require('./MongoUtil');

const app = express();
app.set('view engine', 'hbs');
waxon.on(hbs.handlebars);
waxon.setLayoutPath('./views/layouts');

app.use(express.urlencoded({
    extended: false
}));

const MONGO_URI = process.env.MONGO_URI;

async function main(){
    const db = await connect(MONGO_URI, 'food');
    app.get('/',async function(req,res){
        let foodRecord = await db.collection('food_records').find({}).limit(10).toArray();
        // res.send(data);
        res.render('food-record',{
            'foodRecord': foodRecord 
        })
    })

    // CREATE is easiest here, compared to axios READ
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
}
main();

app.listen(3000, function(){
    console.log('server start!!!!!')
})