'use strict'
const aws = require("aws-sdk");
const dynamodb = new aws.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const TTL_IN_SECONDS = 60;
const awsServerlessExpress= require('aws-serverless-express')
const app = require("../app");
function getExpirationTime() {
  return Math.floor(Date.now() / 1000) + TTL_IN_SECONDS;
}

let corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN,
  "Access-Control-Allow-Credentials": true,
};
let createResponse = ({ statusCode, body, headers, isBase64Encoded }) => {
  let result = {
    isBase64Encoded: isBase64Encoded == true || false,
    statusCode: statusCode || 200,
    headers: headers || {},
    body: JSON.stringify(body || {}),
  };
  return result;
};

const server = awsServerlessExpress.createServer(app);
exports.handler = async (event, context) => {
  const promise = new Promise((resolve, reject) => {
      let payload = null;
      console.log('\n--------------->' + event);
      try {
          payload = JSON.parse(event.body);
      } catch (err) {
          return resolve(createResponse({
              "statusCode": 400,
              "headers": corsHeaders,
              "body": {
                  "success": false,
                  "reason": "unable to parse request body, expected valid JSON format"
              }
          }));
      }
      if(payload.hasOwnProperty('id')){
          let query = {
              TableName: TABLE_NAME,
              KeyConditionExpression: '#id = :id',
              ExpressionAttributeNames:{
                  "#id": "id"
                  },
              ExpressionAttributeValues: { ':id': payload.id }
          };
          dynamodb.query(query).promise()
          .then(res=>{
              if (res.length>0)
                  resolve(createResponse({
                      "statusCode": 403,
                      "headers": corsHeaders,
                      "body": {
                          "success": false,
                          "message": 'EL id ya existe'
                  }
                  }));
              else{
                  dynamodb.put({
                      TableName: TABLE_NAME,
                      Item: payload
                  }).promise()
                  .then(() => {
                      resolve(createResponse({
                          "statusCode": 200,
                          "headers": corsHeaders,
                          "body": {
                              "success": true,
                              "dataOwner": 'newDataOwner',
                              "objectId": 'newObjectId'
                          }
                      }));
                  })
                  .catch((err) => {
                      console.error(err);
                      resolve(createResponse({
                          "statusCode": 500,
                          "headers": corsHeaders,
                          "body": {
                              "success": false,
                              "reason": "an unexpected error occurredXD",
                              "error": err
                          }
                      }));
                  });
              }
          })

      }
      else{
          let queryParams;
          // if we don't have both partition and sort keys, we must query using an
          // appropriate secondary index
          console.log(`querying table index`);
          queryParams = {
              TableName: TABLE_NAME,
              KeyConditionExpression: '#username = :username',
              ExpressionAttributeNames:{
                  "#username": "username"
                  },
              ExpressionAttributeValues: { ':username': payload.username }
          };

      let promise = dynamodb.query(queryParams).promise()
      .then(result => {
          resolve(createResponse({
              "statusCode": 200,
              "headers": corsHeaders,
              "body": result
          }));
      })
      .catch((err) => {
          console.error(err);
          resolve(createResponse({
              "statusCode": 500,
              "headers": corsHeaders,
              "body": {
                  "success": false,
                  "reason": "an unexpected error occurred",
                  "error": err
              }
          }));
      });
      }

  });

  awsServerlessExpress.proxy(server, event, context);
};
