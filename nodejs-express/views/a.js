const { default: axios } = require("axios");

// read
app.get('/sighting',async function(req,res){
    let response = await axios.get(base_api_url + 'sighting');
    let foodSighting = response.data;
    res.render('sighting',{
        'foodSighting': response.data
    })
})

//create
app.get('/sighitng/create',async function(req,res){
    res.render('food-form')
})

app.post('sighting/create',async function(req,res){
    let response = await axios.post(base_api_url + 'sighting', {
        'description': req.bodydescription,
        'food': req.body.food.split(','),
        'datetime': req.body.datetime
    })
    res.redirect('/sighting')
})

//update
app.get('sighting/edit/:id',async function(req,res){
    let id = req.params.id
    let response = await axios.get(base_api_url + 'sighting/' + id);
    let foodSighting = response.data
    res.render('food-form-edit',{
        'description': foodSighting.description,
        'food': foodSighting.food,
        'datetime': foodSighting.datetime.slice(0,-1)
    })
})

app.post('sighting/edit/:id',async function(req,res){
    let id = req.params.id;
    let response = await axios.put(base_api_url + 'sighting/' + id, {
        'description': req.body.description,
        'food': req.body.food.split(','),
        'datetime': req.body.datetime
    })
    res.redirect('/sighting')
})

//delete
app.get('/sighting/delete/:id',async function(req,res){
    let id = req.params.id
    let response = await axois.delete(base_api_url + 'sighting/' + id);
    let foodSighitng = response.data
    res.render('form-delete',{
        'foodSighitng': foodSighitng
    })
    res.redirect('/sighting')
})

app.post('/sighting/delete/:id',async function(req,res){
    let id = req.params.id;
    let response = await axios.delete(base_api_url + 'sighting/' + id);
    let foodSighting = response.data
    res.render('form-delete',{
        'description': foodSighting.description,
        'food': foodSighting.food,
        'datetime': foodSighting.datetime
    })
    res.redirect('/sighting')
})