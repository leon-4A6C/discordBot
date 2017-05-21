var https = require("https");
var qs = require("querystring");

function Cleverbot(options) {
  if (!options) {
    throw new TypeError("Cleverbot needs options");
  }
  this.options = options;
  if (!this.options.cs) {
    this.options.cs = '';
  }
}

Cleverbot.prototype = {
  path: function(msg) {
    path = "/getreply?";
    query = {
      key: this.options.key,
      input: msg,
      cs: this.options.cs
    }
    return path + qs.stringify(query);
  },

  say: function(msg, callback) {
    var output,
        error;

    const options = {
      hostname: 'www.cleverbot.com',
      port: 443,
      path: this.path(msg),
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      var body = "";
      res.on('data', (d) => {
        body += d;
      });
      res.on("end", (i) => {
        try {
          var responseBody = JSON.parse(body);
          this.options.cs = responseBody.cs;
          callback(responseBody.output, error);
        } catch (e) {
          callback(body, e);
        }
      });
    });
    req.on('error', (e) => {
      console.error(e);
    });
    req.end();
  }
};

module.exports = Cleverbot;
