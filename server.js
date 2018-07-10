#!/bin/env node
//  OpenShift sample Node application
var http = require('http'),
    express = require('express'),
    path = require('path'),
    fs      = require('fs'),
    util = require('util'),
    jade = require('jade'),
    nodemailer = require('nodemailer');


/**
 *  Define the sample application.
 */
var DalorzoApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.port      = process.env.PORT || 5000;        

        var mailOptions = {
            host: "smtp.bizmail.yahoo.com",
            secureConnection: true,
            port: 465,
            auth: {
                user: "ventas@dalorzo.com",
                pass: "grcpayutrnmmtdws"
            }
        };
        self.transport = nodemailer.createTransport(mailOptions);
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        //self.zcache['index.html'] = fs.readFileSync('./web/index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string=} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        var styles = ['Barkwood','Charcoal','Hickory','Slate','Whethered']

        self.routes['/template'] = function(req, res) {
            //res.setHeader('Content-Type', 'text/html');
            //res.send(self.cache_get('index.html'));
            res.render('mail',{name:'Edwin Dalorzo'});
        };

        self.routes['/'] = function(req, res) {
            res.render('home');
        };

        self.routes['/index.html'] = function(req, res) {
            res.render('home');
        };

        self.routes['/galeria.html'] = function(req, res) {
            res.render('gallery');
        };

        self.routes['/cotizar.html'] = function(req, res) {
            res.render('quote');
        };

        self.routes['/tejas/:style.html'] = function(req, res){
            var style = req.params['style'];
            var options = styles.filter(function(available){
                return available !== style;
            });
            console.log(options);
            res.render('style',{style: style, styles: options});
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();

        self.app = express();

        /*
        self.app.configure('development', function() {
            self.app.use(express.logger('dev'));
            self.app.locals.pretty = true;
        });
        */

        self.app.use(express.static(path.join(__dirname, 'web')));
        self.app.set('views', __dirname + '/views');
        self.app.set('view engine', 'jade');

        self.app.use(express.json());
        self.app.use(express.urlencoded());

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            if(self.routes.hasOwnProperty(r)){
                self.app.get(r, self.routes[r]);
            }
        }

        self.app.post('/mail', function(req, res){
            var data = req.body;
            if(data.phone){
                data.message += util.format('\n\nTeléfono: %s', data.phone);
            }
            var messageOptions = {
                from: util.format("%s <%s>", data.name, 'ventas@dalorzo.com'),
                replyTo: util.format("%s <%s>", data.name, data.from),
                to: "ventas@dalorzo.com",
                cc:"Edwin Dalorzo <edwin@dalorzo.com>, Yamileth Dalorzo <ydalorzo@hotmail.com>",
                subject: "Solicitud de Información",
                text: data.message
            };
            self.transport.sendMail(messageOptions, function(error, responseStatus){
                if(!error){
                    jade.renderFile('views/mail.jade',{name: data.name }, function(err, html) {
                        messageOptions = {
                            from: 'Instalaciones Dalorzo <ventas@dalorzo.com>',
                            to: data.from,
                            subject: "Solicitud de Información",
                            html: html
                        };

                        self.transport.sendMail(messageOptions, function(error, responseStatus){
                            if(error){
                                console.log(error);
                            }
                            res.send(200, responseStatus.message);
                        });
                    });

                } else {
                    res.send(500, error);
                }
            });
        });
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        http.createServer(self.app).listen(self.port, function() {
            console.log('%s: Node server started on port %d ...',
                Date(Date.now() ), self.port);
        });

    };

};


/**
 *  Application start-up
 */
var dalorzoApp = new DalorzoApp();
dalorzoApp.initialize();
dalorzoApp.start();

