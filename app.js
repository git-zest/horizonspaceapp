var express=require('express');
var app=express();
var session=require('express-session')
var bodyparser=require("body-parser");
var express = require('express');
const multer = require('multer');
var router = express.Router();
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var fileSystem = require('fs');
require("dotenv").config();
var mongoose=require('mongoose');
var Schema=mongoose.Schema;
//var MongoClient = require('mongodb').MongoClient;
var logger = require('logger').createLogger('development.log'); // logs to a file
var urlencodedParser = bodyparser.urlencoded({ extended: false })
makeRequest=require('./Model/makeRequest');
accountnumber=require('./Model/dbConnections');

//var multer  = require('multer')

//var schedule = require('node-schedule');
//MongoClient.connect("mongodb://localhost:27017/datacreate");
var db=mongoose.connection
app.use(bodyparser.json());

app.use(session({secret:"kjhdsfdhguhdsghsdhgsdhgideshigfhsdfihfg",resave:false}))
app.use(express.static(__dirname+"/HTML/HTML"))
var expressfilename=__dirname;
var CryptoJS=require('crypto-js');
var axios = require('axios');
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
//////////////////REPORTMODULE//////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////


app.get('/book', function (req,res){
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(__dirname+'/HTML/HTML/index.html');
});

app.get('/transaction', function (req,res){
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(__dirname+'/HTML/HTML/index.html');
});

app.get('/2/api/getcustomerdata/:customername', async function (req,res){
  var customername = req.params.customername;
  MongoClient.connect(process.env.mongo_uri, function(err, db) {
  if (err) throw err;
  var dbo = db.db("rapyd");
  var filter = {'clientname':customername}
  dbo.collection("clientDB").findOne(filter, function(err, result) {
    if (err) throw err;
    console.log(result.TotalPay);
    db.close();
    res.send(result.TotalPay.toString());
  });
});

})


app.get('/2/api/gettransactionlist/:countryfullname/:customername', async function (req,res){
  var countryfullname = req.params.countryfullname;
  var customername = req.params.customername;
  console.log(countryfullname);
  console.log(customername);
  const result= await accountnumber.fnsearch(countryfullname, customername, async function(docs){
    console.log('***********************************************  ');
    console.log(docs[0]);
    var body=null;
    const result=await makeRequest.makeRequest('GET', '/v1/issuing/bankaccounts/'+docs[0].accountnumber, body , function(doc){
        console.log(doc);
        var jsonvl=JSON.parse(doc).data.transactions;
        res.send(jsonvl);
    });
  });
});


app.get('/2/api/getcurrencies', async function (req,res){
    try {
      var body=null
      var dropdownvalue=[]
      const result=await makeRequest.makeRequest('GET', '/v1/data/countries', body , function(doc){
        //console.log(JSON.parse(doc));
        countrylist=JSON.parse(doc).data
        //console.log(countrylist);
        for (var eachcountry in countrylist){
          //console.log(eachcountry);
    				countryname=countrylist[eachcountry].name
    				countrycode=countrylist[eachcountry].iso_alpha2
    				currencycode=countrylist[eachcountry].currency_code
    				jsonvalue={'id':eachcountry,'country':countryname, 'countrycode': countrycode, 'currencycode': currencycode}
    				dropdownvalue.push(jsonvalue)
    		}
    		//console.log(dropdownvalue);
        res.send(dropdownvalue);
      });
     } catch (error) {
       res.json(error);
     }
});

app.get('/2/api/getlistofaccount/:customername', async function (req,res){
    var customername = req.params.customername;
    const result=await accountnumber.fnsearchcustomer( customername, function(docs){
        console.log(docs);
        res.send(docs)
    });
});


app.get('/2/api/geteligiblecountrylist', async function (req,res){
  var body=null
  const result=await makeRequest.makeRequest('GET', '/v1/issuing/bankaccounts/capabilities/country=sg/currency=sgd', body,  function(doc){
    console.log(doc);
  })
})




app.get('/2/api/getrateconversion/:percentage/:totalamount/:currency', async function (req,res){
  var percentage =req.params.percentage;
  var totalamount =req.params.totalamount;
  var currency=req.params.currency;
  //console.log(req.body[2]);
  var options = {
      'method': 'GET',
      'url': 'https://api.exchangerate-api.com/v4/latest/'+process.env.currency,
      'headers': {
      }
  };





  //console.log(options);
  var request = require('request');
  request(options, function (error, response) {
      if (error) throw new Error(error);
      //console.log(JSON.parse(response.body));
      var nethost=JSON.parse(response.body)
      rates = nethost.rates
      //rateskey=Object.keys(rates)
      for(var rt in rates){
        //console.log(rateskey[rt]);
        //console.log(currency);
        var value=rates[rt];
        if(rt==currency){
            //initcur=rateskey[rt]
            console.log(parseInt(value));
            console.log(parseInt(totalamount));
            console.log(parseInt(percentage));
            var paymentvalue = (parseFloat(value)*parseFloat(totalamount)*parseFloat(percentage)/100)
            console.log(paymentvalue);
            res.send(paymentvalue.toString());
          //console.log(rates[rt]);
        }
      }
      //console.log(rateskey);

    });
});

app.post('/2/api/getlistofaccount', async function (req,res){
  var currency =req.body[0];
  var country =req.body[1];
  var customername = req.body[2];
  var countryfullname = req.body[3];
  var customername=req.body[4];
  var body = {
  "currency": currency,
  "country": country,
  "description": "Issuing bank account number to wallet",
  "ewallet": process.env.rapyd_wallet
  };
  console.log(body);

  const result= await accountnumber.searchfinder(countryfullname, customername, async function(model){
  if (model=='na'){
  const result=await makeRequest.makeRequest('POST', '/v1/issuing/bankaccounts', body,  function(doc){
    //console.log(JSON.parse(doc));
    accountnumberdetails=JSON.parse(doc)
    console.log(accountnumberdetails.data.id);
    //console.log(countrylist);
    const result= accountnumber.addCustomerdetails(accountnumberdetails.data.id, customername, country, countryfullname, currency, function(docs){
        console.log(docs);
        res.send(docs)
    });
  })
  }
  else{
    res.send('Success')
  }
  });
});


app.post('/2/api/payment', async function (req,res){
  var currency =req.body[0];
  var country =req.body[1];
  var customername = req.body[2];
  var countryfullname = req.body[3];
  var amount=req.body[4];
  var totalamount=req.body[5];
  const result= await accountnumber.fnsearch(countryfullname, customername, async function(docs){
      console.log(docs);
      var issuingid = docs[0].accountnumber
      body={"issued_bank_account": issuingid,"amount": amount,"currency": currency}
      const result=await makeRequest.makeRequest('POST', '/v1/issuing/bankaccounts/bankaccounttransfertobankaccount', body,  async function(doc){
          console.log(JSON.parse(doc).status.status);
          if(JSON.parse(doc).status.status=='SUCCESS'){
            res.send(JSON.parse(doc).status.status)
            const result= await accountnumber.updateamount(customername,amount,totalamount, async function(model){
            })
          }else{

          }

      })
  })
})


app.get('/2/api/getlistofaccount', async function (req,res){


});

app.listen(8085);

console.log('8085');

console.log("Server started");
