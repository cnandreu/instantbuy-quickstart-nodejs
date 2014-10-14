/**
 * Copyright 2014 Carlos Andreu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

//Configure the values below

var CONSTANTS = {
	MERCHANT_ID : 'your_id_goes_here',
	MERCHANT_SECRET : 'your_merchant_secret',
	MERCHANT_NAME : 'name_with_which_you_signed_up_merchant_account',
	CLIENT_ID : 'your_client_id_from_api_console',
	ORIGIN : 'http://localhost:3000/'
};

//Dependencies

var jwt = require('jwt-simple');
var bodyParser = require('body-parser');
var express = require('express');

//Express Application

var app = express();

//Utilities

var Utils = {
	toDollars : function (microdollars) {
		return (parseFloat((microdollars/1000000)).toFixed(2)).toString();
	},
	timeStamp : function () {
		return Math.round(Date.now() / 1000);
	}
};

//Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


//REST APIs

app.get('/config', function (req, res) {
	res.send({CLIENT_ID: CONSTANTS.CLIENT_ID});
});

app.post('/masked-wallet', function (req, res) {

	var estimatedTotalPrice = parseFloat(req.body.estimatedTotalPrice);
	var currencyCode = req.body.currencyCode;

	if (typeof estimatedTotalPrice === 'undefined' ||
		typeof currencyCode === 'undefined') {
		res.status(500).send('Bad request, expected estimatedTotalPrice and currencyCode and in the request.');
		return;
	}

	var mwr = {
		aud : 'Google',
		iat : Utils.timeStamp(),
		exp : Utils.timeStamp() + 3600,
		iss : CONSTANTS.MERCHANT_ID,
		typ : 'google/wallet/online/masked/v2/request',
		request : {
			clientId : CONSTANTS.CLIENT_ID,
			merchantName : CONSTANTS.MERCHANT_NAME,
			origin : CONSTANTS.ORIGIN,
			pay : {
				estimatedTotalPrice : Utils.toDollars(estimatedTotalPrice),
				currencyCode : currencyCode
			},
			ship : {}
		}
	};

	var googleTransactionId = req.body.googleTransactionId;
	if (googleTransactionId) {
		mwr.request.googleTransactionId = googleTransactionId;
	}

	var token = jwt.encode(mwr, CONSTANTS.MERCHANT_SECRET);
	res.send(token);
});

app.put('/masked-wallet', function (req, res) {

	var jwtToken = req.body.jwt;
	var googleTransactionId = req.body.googleTransactionId;

	if (typeof jwtToken === 'undefined' ||
		typeof googleTransactionId === 'undefined') {
		res.status(500).send('Bad request, expected jwt and googleTransactionId and in the request.');
		return;
	}

	var mwr = jwt.decode(jwtToken, null, true);
	mwr.iat = Utils.timeStamp();
	mwr.exp = Utils.timeStamp() + 3600;
	mwr.request.googleTransactionId = googleTransactionId;
	mwr.request.ship = {};

	var token = jwt.encode(mwr, CONSTANTS.MERCHANT_SECRET);
	res.send(token);
});

app.post('/full-wallet', function (req, res) {

	var cartData = req.body.cart;
	var totalPrice = Utils.toDollars(cartData.totalPrice);
	var currencyCode = cartData.currencyCode;
	var lineItems = cartData.lineItems;

	for (var i = 0; i < lineItems.length; i++) {
		var currentItem = lineItems[i];

		if (typeof currentItem === 'object') {
			if (typeof currentItem.totalPrice !== 'undefined') {
				currentItem.totalPrice = Utils.toDollars(currentItem.totalPrice);
			}

			if (typeof currentItem.unitPrice !== 'undefined') {
				currentItem.unitPrice = Utils.toDollars(currentItem.unitPrice);
			}
		}
	}

	var googleTransactionId = req.body.googleTransactionId;

	var fwr = {
		iat : Utils.timeStamp(),
		exp : Utils.timeStamp() + 3600,
		typ : 'google/wallet/online/full/v2/request',
		aud : 'Google',
		iss : CONSTANTS.MERCHANT_ID,
		request : {
			merchantName : CONSTANTS.MERCHANT_NAME,
			googleTransactionId : googleTransactionId,
			origin : CONSTANTS.ORIGIN,
			cart : {
				totalPrice : totalPrice,
				currencyCode : currencyCode,
				lineItems : lineItems
			}
		}
	};

	var token = jwt.encode(fwr, CONSTANTS.MERCHANT_SECRET);
	res.send(token);
});

app.post('/notify-transaction-status', function (req, res) {

	var jwtToken = req.body.jwt;

	var fullToken = jwt.decode(jwtToken, null, true);
	var fullResponse = fullToken.response;

	var nts = {
		iat : Utils.timeStamp(),
		exp : Utils.timeStamp() + 3600,
		typ : 'google/wallet/online/transactionstatus/v2',
		wud : 'Google',
		iss : CONSTANTS.MERCHANT_ID,
		request : {
			merchantName : CONSTANTS.MERCHANT_NAME,
			googleTransactionId : fullResponse.googleTransactionId,
			status : 'SUCCESS'
		}
	};

	var token = jwt.encode(nts, CONSTANTS.MERCHANT_SECRET);
	res.send(token);
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
