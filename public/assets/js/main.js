Parse.initialize('12345','12345');
Parse.serverURL = 'http://marcin-ziolek.usermd.net/parse';

var getQueryVariable = function(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
};

var token = getQueryVariable('token'),
    msg = document.getElementById('msg'),
    login = document.getElementById('login');