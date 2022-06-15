// const express = require('express');
// const hbs = require('hbs');
// const wax = require('wax-on');
// const MongoUtil = require('./MongoUtil');

// const dotenv = require('dotenv').config();

// const app = express();
// app.set('view engine','hbs');
// wax.on(hbs.handlerbars);
// wax.setLayoutPath('./views/layout');

// app.use(express.urlencoded({
//     extended:false
// }));

// const MONGO_URI = process.env.MONGO_URI;

// app.get('/',function(req,res){
//     res.send(data);
// });

// app.listen(3000, function(){
//     console.log('hello world');
// })

// 1. cd, npm init, express, hbs, wax-on, mongodb, dotenv, index.js, .env, 
const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const MongoUtil = require("./MongoUtil.js");
require('dotenv').config() // 2.
// console.log(process.env.MONGO_URI)

// 4.
const DATABASE = 'tgc18-animal-shelter';
const PETS = 'pets';

async function main() {
    /* 1. SETUP EXPRESS */
    let app = express();

    // 1B. SETUP VIEW ENGINE
    app.set("view engine", "hbs");

    // 1C. SETUP STATIC FOLDER
    app.use(express.static("public"));

    // 1D. SETUP WAX ON (FOR TEMPLATE INHERITANCE)
    wax.on(hbs.handlebars);
    wax.setLayoutPath("./views/layouts");

    const app = express();
    app.set('view engine','hbs');

    // 1E. ENABLE FORMS
    app.use(express.urlencoded({ extended: false }));

    // 1F. Connect to Mongo
    // await MongoUtil.connect(process.env.MONGO_URI, 'tgc18-animal-shelter'); // 3.
    await MongoUtil.connect(process.env.MONGO_URI, 'DATABASE'); // 4.
    console.log("connected to DB");

    // app.get('/', function (req, res) {
    //     res.send(data);
    // });
    // 4. READ - pre-create mongo data 5. views/layouts, base.hbs
    app.get('/', async function (req, res) {
        let pets = await db.collection(PETS).find({}).toArray();
        res.render('all-pets',{
            'pets': pets //pets
        });
    });

    // 6. CREATE - add-animal.hbs
    app.get('/create', async function(req,res){
        res.render('add-animal.hbs');
    })

    // 7. CREATE 8. open form add input data
    app.post('/create', async function(req,res){
        let newDocument = {
            'name': req.body.name,
            'age': req.body.age,
            'breed': req.body.breed,
            'problems': req.body.problems.split(','),
            'tags': req.body.tags.split(',')
        }
        await db.collection(PETS).insertOne(newDocument);
        res.redirect('/')
    })

    app.listen(3000, function () {
        console.log('hello world');
    })
}
main();