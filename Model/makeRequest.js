const https = require('https');
const crypto = require('crypto');
require("dotenv").config();
const accessKey = process.env.rapyd_access_key;
const secretKey = process.env.rapyd_secret_key;
const log = false;
var request = require('request');
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
async function makeRequest(method, urlPath, body , callback) {
    try {
        httpMethod = method;
        httpBaseURL = process.env.base_uri;
        httpURLPath = urlPath;
        salt = generateRandomString(8);
        idempotency = new Date().getTime().toString();
        timestamp = Math.round(new Date().getTime() / 1000);
        console.log(salt);
        console.log(timestamp);
        signature = sign(httpMethod, httpURLPath, salt, timestamp, body)
        console.log(signature);
        console.log(httpURLPath);
        const options = {
            hostname: httpBaseURL,
            port: 443,
            path: httpURLPath,
            method: httpMethod,
            headers: {
                'Content-Type': 'application/json',
                salt: salt,
                timestamp: timestamp,
                signature: signature,
                access_key: process.env.rapyd_access_key,
                idempotency: idempotency
            }
        }
        console.log(body);
        doc = await httpRequest(httpBaseURL, httpURLPath, httpMethod, salt, timestamp, signature, body, log, function(doc){
          //console.log(doc);
          return callback(doc)
        });
        //callback(doc)

    }
    catch (error) {
        console.error("Error generating request options");
        throw error;
    }
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function sign(method, urlPath, salt, timestamp, body) {

    try {
        console.log(method);
        console.log(accessKey);
        console.log(secretKey);
        let bodyString = "";
        if (body) {
            bodyString = JSON.stringify(body);
            bodyString = bodyString == "{}" ? "" : bodyString;
        }

        let toSign = method.toLowerCase() + urlPath + salt + timestamp + accessKey + secretKey + bodyString;
        log && console.log(`toSign: ${toSign}`);

        let hash = crypto.createHmac('sha256', secretKey);
        hash.update(toSign);
        const signature = Buffer.from(hash.digest("hex")).toString("base64")
        log && console.log(`signature: ${signature}`);

        return signature;
    }
    catch (error) {
        console.error("Error generating signature");
        throw error;
    }
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function generateRandomString(size) {
    try {
        return crypto.randomBytes(size).toString('hex');
    }
    catch (error) {
        console.error("Error generating salt");
        throw error;
    }
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

async function httpRequest(httpBaseURL, httpURLPath, httpMethod, salt, timestamp, signature, body, log, callback) {
  if (body==null){
    var options = {
          'method': httpMethod,
          'url': httpBaseURL+httpURLPath,
          'headers': {
            'Content-Type': 'application/json',
            'access_key': process.env.rapyd_access_key,
            'salt': salt,
            'timestamp': timestamp,
            'signature': signature
          }
    }
  }else{
    //console.log(body)
    var options ={
                  'method': httpMethod,
                  'url': httpBaseURL+httpURLPath,
                  'headers': {
                    'Content-Type': 'application/json',
                    'access_key': process.env.rapyd_access_key,
                    'salt': salt,
                    'timestamp': timestamp,
                    'signature': signature
                  },
                  body: JSON.stringify(body)
                };
    }
    //console.log(options);
    await request(options, async function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                return callback(response.body);
    });
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
exports.makeRequest = makeRequest;
