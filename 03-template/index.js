const express = require('express');
const hbs = require('hbs');
const waxon = require('wax-on');

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

app.get('/fruits', function(req,res){
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

app.get('/add-price', function(req,res){
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
 
app.listen(3000, function(){
    console.log('server started')
})