const express = require('express');
const hbs = require('hbs');
const waxon = require('wax-on');
const axios = require('axios');

const app = express();

app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({
    'extended': false
}))

waxon.on(hbs.handlebars);
waxon.setLayoutPath('./views/layouts');

//register a custom helper
hbs.handlebars.registerHelper('ifEquals',function(arg1, arg2, options){
    if (arg1==arg2) {
        options.fn(this);
    } else {
        options.inverse(this);
    }
})

app.get('/',function(req,res){
    res.render('index');
})

app.get('/about-us',function(req,res){
    res.render('about-us');
})

app.get('/hello/:name',function(req,res){
    let name = req.params.name;
    res.render('hello',{
        'name': name
    });
})

app.get('/fruits',function(req,res){
    let dishes = [
        {
            'name': 'Mango ice-cream',
            'calories': 700
        },
        {
            'name': 'Durian ice-cream',
            'calories': 1000
        }
    ]

    res.render('fruits',{
        'fruits':['apples','banana','cranberries'],
        'dishes': dishes,
        'drinks': 'milo peng'
    })
})

app.get('/add-fruits',function(req,res){
    res.render('add-fruits');
})

app.post('/add-fruits',function(req,res){
    console.log(req.body);
    let fruits = req.body.fruitName;
    let claories = req.body.calories;

    res.send('form received');
})

app.get('/add-food',function(req,res){
    res.render('add-food');
})

app.post('/add-food',function(req,res){
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
    
    // tags = tags || [];
    // tags = Array.isArray(tags) ? tags : [tags]; 

    res.render('results',{
        'foodName': foodName,
        'meal': meal,
        'calories': calories,
        'tags': tags 
    });
})

// look up table
const fruitPrices = {
    'durian': 15,
    'apple': 8,
    'banana': 2,
    'orange': 6
}

app.get('/add-price',function(req,res){
    res.render('add-price');
})

app.post('/add-price',function(req,res){

    let fruits = [];
    if(Array.isArray(req.body.item)) {
        fruits = req.body.item
    } else { 
        if (req.body.item) {
            fruits = [req.body.item]
        }
    }

    let total = 0;
    for (let eachFruit of fruits) {
        // if (eachFruit == "durian") {
        //     total += 15;
        // }
        // if (eachFruit == "apple") {
        //     total += 8;
        // }
        // if (eachFruit == "banana") {
        //     total += 2;
        // }
        // if (eachFruit == "orange") {
        //     total += 6;
        // }
        // =========================
        // switch(eachFruit) {
        //     case 'durian':
        //         total += 15;
        //         break;
        //     case 'apple':
        //         total += 8;
        //         break;
        //     case 'banana':
        //         total += 2;
        //         break;
        //     case 'orange':
        //         total += 8;
        //         break;
        // }
        // =====look up table=======
            let price = fruitPrices[eachFruit];
            total += price;
    }
    // res.send("Total = " + total);
    res.render('total',{
        'total': total
    })
})

// CRUD - sighting.hbs
const BASE_API_URL = 'https://ckx-restful-api.herokuapp.com/';


// Read
app.get('/sighting',async function(req,res){
    try{
        let response = await axios.get(BASE_API_URL + 'sightings');
        res.render('sighting',{
            'foodSighting': response.data
        })
    } catch(e) {
        console.log(e);
        res.send("Error!")
    }
})

// CREATE
app.get('/sighting/create',function(req,res){
    res.render('food-form')
})

app.post('/sighting/create',async function(req,res){
    // let data = {
    //     'description' :req.body.description,
    //     'food': req.body.food.split(','),
    //     'date': req.body.datetime
    // }
    // await axios.post(BASE_API_URL + 'sightings', data);

    await axios.post(BASE_API_URL + 'sightings', {
        'description': req.body.description,
        'food': req.body.food.split(','),
        'datetime': req.body.datetime
    })
    res.redirect('/sighting')
})

// UPDATE
app.get('/sighting/edit/:id',async function(req,res){
    let ID = req.params.id;
    let response = await axios.get(BASE_API_URL + 'sighting/' + ID);
    let foodSighting = response.data;
    // res.send(response.data);
    res.render('food-form-edit', {
        'description': foodSighting.description,
        'food': foodSighting.food,
        'datetime': foodSighting.datetime.slice(0,-1)
    })
})

app.post('sighting/edit/:id',async function(req,res){
    let ID = req.params.id;
    await axios.put(BASE_API_URL + 'sighting/' + ID, {
        'description': req.body.description,
        'food': req.body.food.split(','),
        'datetime': req.body.datetime
    })
    res.redirect('/sighting')
})

// DELETE
app.get('/sighting/delete/:id',async function(req,res){
    let ID = req.params.id;
    let response = await axios.get(BASE_API_URL + 'sighting/' + ID);
    let foodSighting = response.data;
    // res.send(foodSighting); 
    res.render('food-comfirm-delete',{
        'foodSighting': foodSighting
    })
})

app.post('/sighting/delete/:id',async function(req,res){
    let ID = req.params.id
    await axios.delete(BASE_API_URL + 'sighting/' + ID, {
        'description': description,
        'food': food,
        'datetime': datetime
    })
    res.redirect('/sighting')
})

app.listen(3000, function(){
    console.log('server started')
})