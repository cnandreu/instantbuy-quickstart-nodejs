# Setup the Node.js Instant Buy Quickstart sample  using Express

## Notes
* This is not an official sample. This code is not affiliated with, endorsed, or sponsored by [Google](http://google.com).
* The `server.js` is heavily based on [instantbuy_server.rb](https://github.com/googlewallet/instantbuy-quickstart-ruby/blob/master/instantbuy_server.rb) from  the [instantbuy-quickstart-ruby](https://github.com/googlewallet/instantbuy-quickstart-ruby) project.
* The `index.html` is heavily based on [_index.html](https://github.com/googlewallet/instantbuy-quickstart-ruby/blob/master/_index.html) from  the [instantbuy-quickstart-ruby](https://github.com/googlewallet/instantbuy-quickstart-ruby) project.

## Prerequisites:

* You must have the following values from the [Google API console](https://code.google.com/apis/console/):
	* MERCHANT_ID
	* MERCHANT_SECRET
	* MERCHANT_NAME
	* CLIENT_ID
* You must have [Node.js](http://nodejs.org/) installed. The sample was tested with `v0.10.29`. You can check the version with: `node -v`.

## Getting Started

1. Clone this github repository
2. Update the `CONSTANTS` variable inside `server.js`.
3. Run `npm install` to install dependencies
4. Run `node server.js`
5. Visit `http://localhost:3000`