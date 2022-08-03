var app = angular.module('homescreen', ['ngRoute','ngFileSaver','ui.bootstrap']);

app.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
	$routeProvider.when('/',{
		templateUrl: '/Base.html'
	});

	$routeProvider.when('/book',{
		templateUrl: '/registration.html'
	});

	$routeProvider.when('/transaction',{
		templateUrl: '/Transaction.html'
	});

	$routeProvider.otherwise({
       redirectTo: '/'
  });

	$locationProvider.html5Mode({
	  enabled: true,
	  requireBase: false
	});
}]);

app.controller('transactionpage', function($scope,$http,$location,$rootScope){
	$scope.username='McMike'
	$scope.customerdetails = ''
	$scope.tabledetails = ''
	$http.get('/2/api/getlistofaccount/'+$scope.username)
	.then(function successCallback(response)
	{
		console.log(response.data);
		$scope.customerdetails=response.data
	}, function errorCallback(response) {

	});

	$scope.gettransaction=function(id){
		console.log(id.countryfullname);
		//$scope.countryvalue=id.countryfullname
		$http.get('/2/api/gettransactionlist/'+id.countryfullname+'/'+$scope.username)
		.then(function successCallback(response)
		{
			console.log(response.data);
			$scope.tabledetails=response.data;
			//$scope.country=response.data
		}, function errorCallback(response) {

		});

	}




});

app.controller('bookingpage', function($scope,$http,$location,$rootScope){

	$scope.session='1'
	$scope.amount=''
	$scope.country=[]
	$scope.username='McMike'
	$scope.countryvalue=0
	$scope.errormessage=''
	$scope.payment=''
	$scope.percentage=[]





	for(let i = 1; i <= 20; i++) {
    // multiply i with number
		const number = 5;
    const result = i * number;
		var jsonvalue = {"p": result}
		$scope.percentage.push(jsonvalue);
	}
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////

	$http.get('/2/api/getcustomerdata/'+$scope.username,[])
	.then(function successCallback(response)
	{
		console.log(response.data);
		$scope.amount=response.data
	}, function errorCallback(response) {

	});
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	$http.get('/2/api/getcurrencies',[])
	.then(function successCallback(response)
	{
		console.log(response.data);
		$scope.country=response.data
	}, function errorCallback(response) {

	});
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	$http.get('/2/api/geteligiblecountrylist',[])
	.then(function successCallback(response)
	{
		console.log(response.data);
		$scope.country=response.data
	}, function errorCallback(response) {

	});
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	$http.get('/2/api/getlistofaccount',[])
	.then(function successCallback(response)
	{
		console.log(response.data);
		$scope.country=response.data
	}, function errorCallback(response) {

	});
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	$scope.setcurrency=function(id){
		console.log(id);
		$scope.countryvalue=id
	}
	//////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////
	$scope.setamount=function(id){
		console.log(id);
		$http.get('/2/api/getrateconversion/'+id.p+'/'+$scope.amount+'/'+$scope.code)
		.then(function successCallback(response)
		{
			console.log(response.data);
			$scope.amt=response.data
		}, function errorCallback(response) {

		});
	}
	//////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////
	console.log($scope.session);
	$scope.Navigate = function () {
			$scope.session='2'
	}
	//////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////
	console.log($scope.status)
	//////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////
	$scope.Proceed = function () {
		console.log($scope.status);
		console.log($scope.countryvalue);
		var countryvl = $scope.countryvalue
		var currency = countryvl.currencycode
		var country = countryvl.countrycode
		var countryname = countryvl.country
		$http.post('/2/api/getlistofaccount',[currency, country, $scope.username, countryname, $scope.username])
		.then(function successCallback(response)
		{
			console.log(response.data);
			$scope.errormessage=response.data;
			if (response.data='success'){
				$scope.payment='3'
				$scope.code=currency
			}
		}, function errorCallback(response) {

		});
		////
	}
	//////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////
	$scope.paynow = function () {
		console.log($scope.status);
		console.log($scope.countryvalue);
		var countryvl = $scope.countryvalue
		var currency = countryvl.currencycode
		var country = countryvl.countrycode
		var countryname = countryvl.country
		var amount = $scope.amt
		$http.post('/2/api/payment',[currency, country, $scope.username, countryname, amount, $scope.amount])
		.then(function successCallback(response)
		{
			console.log(response.data);
			$scope.errormessage=response.data;
			if (response.data=='SUCCESS'){
				$scope.payment='3'
				$scope.errormessage='PaymentSuccess'
				$scope.code=currency
			}else{
				$scope.payment='3'
				$scope.errormessage='PaymentFailure'
				$scope.code=currency
			}
		}, function errorCallback(response) {

		});


	}

})
