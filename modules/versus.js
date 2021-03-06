var http = require('http');



/**
 * General data structure
 *
 * {
 *    originalTerm: String,
 *    terms: {
 *      [term] : {
 *          search: boolean
 *          count:  number,
 *          matches: [String]
 *       }
 *     }
 * }
 * @type {Object}
 */
exports.Versus = (function() {

  function Versus() {
    this.terms_array = [];
    this.terms = {};
    this.atbat = [];
    this.iteration = 0;
  };


  Versus.prototype.analyze = function(query, done) {
    this.atbat.push(query);
    this.terms_array.push(query);
    this.iteration = 0;
    this.analyze_one(done);
  };

  /**
   * Removes item from list and searches its related items,
   * until stopping criteria is met
   * @param done
   */
  Versus.prototype.analyze_one = function(done) {
    var self=this;

    if (this.atbat.length>0 && this.iteration<12  ) {

      var current_term = this.atbat.shift();

        this.search_bing(current_term, function(list) {

          self.terms[current_term]=list;

          console.log('['+current_term+']');

          for (var i=0; i<list.length && i<7; i++) {

            var match = list[i].trim();
            if (!(self.terms[match])) {
              console.log("...["+ match+']');
              self.terms_array.push(match);
              self.terms[match]=[];
              self.atbat.push(match);
            }
          }

          self.iteration += 1;

          self.analyze_one(done);
        });
    }
    else {
      console.log(this.atbat.length +": "+this.iteration);
      done(this);
    }
  };

  // searches Bing and calls the callback functin with a sorted array of string

  Versus.prototype.search_bing =function(query, callback) {

    var self = this;

    http.get({
        host:'api.bing.com',
        path:'/osjson.aspx?query=' + encodeURIComponent(query+' vs ')
    },
    function (response) {
      var str = '';

      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {

        callback(self.parse_bing(str));
      });
    }).end();
  };


  Versus.prototype.parse_bing = function (str) {

    var data = JSON.parse(str);
    var original = data[0],
      versus = data[1],
      match, matches = [],
      len = original.trim().length + 1;

    for (var i = 0; i < versus.length; i++) {
      match = versus[i].split(' vs ');
      if (match.length > 1) {
        matches.push(match[1].trim());
      }
    }

    return matches;
  };

  return Versus;
})();
