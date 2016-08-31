var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sprintf = require('sprintf').sprintf();
var bodyParser = require('body-parser');

server.listen(8080, function() {
    console.log("ES booted up at port 8080");
});

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var socket = null, queue = [];

app.post('/data', function (req, res) {
    var event = req.body.data;
    if (socket == null) {
        queue.push(event);
        console.log("No visualiser connected, adding event to queue");
    } else {
        socket.emit('event', {data: event});
        console.log("Sent event to visualiser", event)
    }
    res.json({error: false, message: 'data recieved'});
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.htm');
})

io.on('connection', function (s) {
    console.log("visualiser connected to es")
    socket = s;
    s.emit('event', {data: {category: 'status', message: 'connected to es'}});

    while (queue.length) {
        s.emit('event', {data: queue.shift()});
    }
}); 