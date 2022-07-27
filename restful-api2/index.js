const express = require('express');
require('dotenv').config();
const { connect } = require('./MongoUtil');
const MONGO_URI = process.env.MONGO_URI;
const cors = require('cors');
const { ObjectId } = require('mongodb');
const app = express();

app.use(express.json());
app.use(cors());

async function main() {

    const db = await connect(MONGO_URI, "dwad-recipes");

    app.get('/',async function(req,res){
        
    })
}
main()

app.listen(3000, function(){
    console.log('server start...')
})