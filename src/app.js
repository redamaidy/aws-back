'use strict'
const express = require('express')
const cors = require('cors')
const app = express()
var bodyParser = require('body-parser')
const AWS = require("aws-sdk")
const TABLE_NAME = process.env.TABLE_NAME;
AWS.config.update({
    region: "us-east-1"
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
 app.use(cors())
// create application/json parser
var jsonParser = bodyParser.json()
app.get('/', (req, res) => {
    res.status(200).json({"res":1233333});
})
let corsHeaders = {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN,
    "Access-Control-Allow-Credentials": true,
  };
module.exports = app
function createResponse ({body, headers }){
    let result = {
      headers: headers || {},
      body: body,
    };
    return result;
  };
app.post('/add',jsonParser , (req, res) => {
    let payload = req.body;
    addUser(payload).then(r=>{
        console.log(r);
        res.status(200).json(r);
    }).catch(e=>{
        console.log(e);
        res.status(400).json(e)
    })
    
});
app.post('/verify',jsonParser , (req, res) => {

    let payload = req.body;
    getUser(payload)
    .then(r=>{
        //console.log(r);
        let comp = compare(r, payload);
        res.status(comp.status).json(comp.response);
    }).catch(e=>{
        console.log('err---------->',e);
        res.status(400).json(e)
    })
    
});
function addUser(payload){
    return new Promise((resolve, reject) => {
        dynamodb.put({
            TableName: 'tablaXD',
            Item: payload
        }).promise()
        .then(() => {
            console.log('then');
            resolve(createResponse({
                "headers": corsHeaders,
                "body": {
                    "message": "OK",
                    "user": payload
                }
            }));
        })
        .catch((err) => {
            console.error('err---->'+err);
            resolve(createResponse({
                "headers": corsHeaders,
                "body": {
                    "message": "User not created",
                    "user": {}
                }
            }));
        });
    });
}
function getUser(payload){
    return new Promise((resolve, reject)=>{
        let query = {
            TableName: 'tablaXD',
            KeyConditionExpression: '#username = :username',
            ExpressionAttributeNames:{
                "#username": "username"
                },
            ExpressionAttributeValues: { ':username': payload.username}
        };
        dynamodb.query(query).promise()
          .then(res=>{
            if(res.Items.length>0){
                resolve(res.Items);
            }else{
                reject();
            }
          })
          .catch(err=>{
            console.log('err------------->',err);
            reject();
          })
    });
}
function compare(r, payload){
    for(let i of r)
        if(i.password == payload.password)
            return {"status":200,"response":createResponse({
                "headers": corsHeaders,
                "body": {"user":i,"message":'OK'}
            })};
    return {"status":400,"response":createResponse({
        "headers": corsHeaders,
        "body": {"user":{},"message":'Wrong Password'}
    })}
}