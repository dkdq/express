// 1.
const express=require('express');

// 1b. require in hbs
const hbs=require('hbs');

// 2. create the express application
let app=express();

// 2b. tell Express that we want to use hbs as the template engine
app.set('view engine', 'hbs');

// 3. put in the route
app.get('/', function(req,res){
    res.render('index.hbs');
})

// 4. start server
app.listen(3000, function(){
    console.log('server started');
})
