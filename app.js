var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var gateway = require('./lib/gateway');

var nunjucks = require('nunjucks');

var app = express();

app.use(logger('dev'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Mount folder for resources (css, js, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support form-encoded bodies (for the token endpoint)

nunjucks.configure('views', {
  autoescape: true,
  cache: false,
  express   : app
});

app.engine( 'html', nunjucks.render ) ;
app.set( 'view engine', 'html' ) ;

app.set('json spaces', 4);

/* routes */
app.use('/', require('./routes/index'));
app.use('/portal/v1/ca', require('./routes/ca'));
app.use('/portal/v1/dpp', require('./routes/dpp'));
app.use('/portal/v1', require('./routes/portal'));
app.use('/dpp', require('./routes/dpp'));
app.use('/mm-stub/v1', require('./routes/mm-stub'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.path = req.method + " " + req.protocol + '://' + req.get('host') + req.originalUrl;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

  console.log(JSON.stringify(err));
  console.log(err.stack);
});

if (process.env.gateway) {
    (async() => {
        await gateway.createMicronet();
        //await gateway.createDevice("00:c0:ca:97:d0:8e");
        //await gateway.onboard("DPP:C:81/1;M:00:c0:ca:97:d0:8e;I:DAWG;K:MDkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDIgACxWymZEfYXbrRKItdfNrdv39oXwueoWwfP5znPik9hIE=;;");
    })()
}

module.exports = app;
