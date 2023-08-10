var express = require('express');
const { Server } = require("socket.io");
const gameManager = require("./gameManager");
var cors = require('cors');
const fs = require('fs');
const session = require('express-session');


var app = express();
app.use(express.static("public"));
app.use(cors({
   origin: "http://localhost:3000",
   credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(session({
   secret: "secret",
   resave: false,
   saveUninitialized: true
}));


const http = require('http');
const s = http.createServer(app);
const io = new Server(s,{
   cors: {
     origin: "http://localhost:3000"
   }
});


app.post('/auth', function (req, res) {
   if(req.session.isAuth === false) return res.json({status : "failed"});
   if(req.session.isAuth) {
       return res.json({status : "loggedIn", name: req.session.name});
   }
   if(req.session.try === undefined) req.session.try = 0;
   if(!req.body.username && !req.body.password) {
       return res.json({status : "login", tries : req.session.try});
   }
   if (req.body.count !== (req.session.try + 1)) return res.json({ status: "restart" });
   req.session.try++;
   var name = req.body.username;
   var password = req.body.password;
   const filePath = `./users/${name}.json`;
   if (fs.existsSync(filePath)) {
       const userJSON = JSON.parse(fs.readFileSync(filePath));
       if (password === userJSON.password) {
           req.session.isAuth = true;
           req.session.name = name;
           res.json({status : "success"});
       }
       else if(req.session.try === 3){
           req.session.isAuth = false;
           return res.json({status : "failed"});
       }
       else res.json({status : "failure"});
   }
   else {
       if(req.session.try === 3){
           req.session.isAuth = false;
           return res.json({status : "failed"});
       }
       res.json({status : "failure"});
   }
});

app.post("/logout", (req, res) => {
   if(req.session.isAuth === undefined) return res.json("invalid");
   req.session.isAuth = undefined;
   req.session.try = undefined;
   res.json("success");
});

io.on('connection', (socket) => {
   gameManager.manager(socket);
});

s.listen(8081,
   function () {
       console.log('ExpressJS is running on port 8081');
   }
);