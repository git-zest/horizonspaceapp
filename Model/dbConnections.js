var mongoose=require('mongoose');
var Schema=mongoose.Schema;
mongoose.Promise = require('bluebird');
var db=mongoose.connection;
var bcrypt=require('bcryptjs');
var MongoClient = require('mongodb').MongoClient;
var customer=new Schema({
		accountnumber:String,
		country:String,
		countryfullname:String,
		currency:String,
		customerdetails: String
});

var customerObj=mongoose.model('customer',customer);

module.exports.Mongosearch=function(accountnumber, callback) {
  mongoose.connect(process.env.mongo_uri, function(err) {
	if(err){
		console.log('DB error occured'+err);
    mongoose.connection.close();
		docs="DB Fail";
		callback(docs);
	}

  usernamefind = {}
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  customerObj.find(usernamefind,function(err,docs){
			db.close();
			mongoose.connection.close();
			callback(docs);
	});
  });
}


module.exports.fnsearch=function(country, customername, callback) {
  mongoose.connect(process.env.mongo_uri, function(err) {
	if(err){
		console.log('DB error occured'+err);
    mongoose.connection.close();
		docs="DB Fail";
		callback(docs);
	}

  usernamefind = {"countryfullname": country,"customerdetails":customername}
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  customerObj.find(usernamefind,function(err,docs){
			db.close();
			mongoose.connection.close();
			return callback(docs);
	});
  });
}



module.exports.fnsearchcustomer=function( customername, callback) {
  mongoose.connect(process.env.mongo_uri, function(err) {
	if(err){
		console.log('DB error occured'+err);
    mongoose.connection.close();
		docs="DB Fail";
		callback(docs);
	}

  usernamefind = {"customerdetails":customername}
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  customerObj.find(usernamefind,function(err,docs){
			db.close();
			mongoose.connection.close();
			return callback(docs);
	});
  });
}


module.exports.updateamount=function(customername, amountpaid, amounttotal, callback) {
	var remainingamount= parseFloat(amounttotal)-parseFloat(amountpaid)
	console.log(remainingamount);
	MongoClient.connect(process.env.mongo_uri, function(err, db) {
  if (err) throw err;
  var dbo = db.db("rapyd");
  var myquery = { clientname: customername };
  var newvalues = { $set: {clientname: customername, TotalPay: remainingamount.toString() } };
  dbo.collection("clientDB").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  });
});
}


module.exports.searchfinder=function(country, customername, callback) {
  mongoose.connect(process.env.mongo_uri, function(err) {
	if(err){
		console.log('DB error occured'+err);
    mongoose.connection.close();
		docs="DB Fail";
		callback(docs);
	}

  usernamefind = {"countryfullname": country,"customerdetails":customername}
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  customerObj.find(usernamefind,function(err,docs){
			db.close();
			mongoose.connection.close();
			if (docs.length>=1){
					model='found'
					callback(model);
			}
			else{
				model='na'
				callback(model);
			}

	});
  });
}



module.exports.addCustomerdetails=function(accountnumber, customername, country,countryfullname, currency, callback) {
  mongoose.connect(process.env.mongo_uri, function(err) {
	if(err){
		console.log('DB error occured'+err);
    mongoose.connection.close();
		docs="Error";
		callback(docs);
	}
  createUserObj=new customerObj({"accountnumber":accountnumber,"countryfullname":countryfullname,"country":country, "currency":currency,"customerdetails":customername});
  createUserObj.save(function(err){
    if(err){
      db.close();
			mongoose.connection.close();
      model='Error'
      return callback(model)
    }
    else{
      db.close();
			mongoose.connection.close();
      model='Success'
      return callback(model)
    }
  })
})
}
