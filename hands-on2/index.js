const express=require('express');
const hbs=require('hbs');
const waxon=require('wax-on');

const app=express();
app.set('view engine','hbs');
app.use(express.static('public'));

waxon.on(hbs.handlebars);
waxon.setLayoutPath('views/layouts');

// enable form
app.use(express.urlencoded({
    'extended':false
}))

// create GET route
app.get('/',(req,res)=>{
    res.send('hello');
})

// add form route
app.get('/add-bmi', (req,res)=>{
    res.render('add-bmi');
})

app.post('/add-bmi',(req,res)=>{
    console.log(req.body);
    res.send(req.body);
})

// start server
app.listen(3000, function(){
    console.log('server started');
})