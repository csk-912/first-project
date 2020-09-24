const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyparser = require('body-parser')
const mongoose = require('mongoose');
var JSAlert = require("js-alert");
const port = 81;
const session = require('express-session');
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;  

const app = express();

// app.use(cookieParser());
// EXPRESS STUFF
app.use('/static', express.static('static'));     //static inside express.static('static') is folder name.
app.use(express.urlencoded());

//PUG STUFF
app.set('view engine', 'pug');    //Set the template engine as pug.
app.set('views', path.join(__dirname, 'views'));     //Joins the current dirextory to views directory.

//MONGOOSE STUFF
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));



var registerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: Number,
    age: Number,
    vehicletype: Number,
    vehiclenumber: String,
    email: String,
    phonemunber: Number,
    username: String,
    password: String,
    cnfpassword: String
})



var availabilitySchema = new mongoose.Schema({
    email : String,
    entrydate: Date,
    exitdate: Date,
    span : {type : Number,default : 0},
    serviceregistered : { type : String,default : 'NO'},
    servicedone  : {type : String,default : 'NO'},
    paymentstatus: { type: String, default: 'NO' }
})



var contactusSchema = new mongoose.Schema({
    name: String,
    email: String,
    concern: String
})


var extensionSchema = new mongoose.Schema({
    ticketID: String,
    newexitdate: Date
})


var adminSchema = new mongoose.Schema({
    slots: { type: Number, default: 100 },
    nfeephr: Number,
    sfeephr: Number
})



var registermodel = mongoose.model('registerdata', registerSchema);

var availabilitymodel = mongoose.model('availabledata', availabilitySchema);

var contactusmodel = mongoose.model('contactusdata', contactusSchema);

var extensionmodel = mongoose.model('extensiondata', extensionSchema);

var adminmodel = mongoose.model('admindata', adminSchema);


app.get('/', (req, res) => {
    // console.log("home page is opened.");
    res.status(200).render('login.pug');         //login page 
})

app.get('/registration', (req, res) => {
    // console.log("home page is opened.");
    res.status(200).render('registration.pug');         //login page 
})

app.get('/Home', (req, res) => {
    // console.log("home page is opened.");
    res.status(200).render('home.pug');         //login page 
})

app.get('/logout', (req, res) => {
    req.session.destroy(function(err){
        if(err)
        {
            console.error(err);
        }
        else
        {
            res.status.render('/');
        }
    });
})

app.get('/Services', (req, res) => {
    // console.log("home page is opened.");
    res.status(200).render('services.pug');         //login page 
})

app.get('/AboutUs', (req, res) => {
    // console.log("home page is opened.");
    res.status(200).render('aboutus.pug');
})

app.get('/ContactUs', (req, res) => {
    // console.log("home page is opened.");
    res.status(200).render('contactus.pug');
})

app.get('/bookslot', (req, res) => {
    res.status(200).render('bookslot.pug');
})

app.get('/checkavailability', (req, res) => {
    res.status(200).render('checkavailability.pug');
})

app.get('/requestextension', (req, res) => {
    res.status(200).render('requestextension.pug');
})

app.get('/additionalservices', (req, res) => {
    res.status(200).render('additionalservices.pug')
})

app.get('/forgotpassword',(req,res)=>{
    res.status(200).render('forgotpassword.pug');
})

app.get('/changepassword',(req,res)=>{
    res.status(200).render('changepassword.pug');
})



app.post('/', (req, res) => {
    registermodel.find(req.body, function (err, user) {
        // if(data.length)
        // {
        //     res.status(200).render('home.pug');
        // }
        // else
        // {
        //     JSAlert.alert("You have entered wrong password or username.");
        //     res.status(200).render('login.pug');
        // }

        if (err) {
            return res.status(500).send();
        }
        if (!user) {
            res.redirect('/')
        }
        else {
            if(user.length == 1)
            {
                return res.status(200).render('home.pug')
            }
            else
            {
                return res.status(200).send('user not registered');
            }
        }
    })
})



app.post('/registration', (req, res) => {
    // console.log("home page is opened.");
    console.log(req.body);
    var registerdata = new registermodel(req.body);
    registermodel.find({email : req.body.email},function(err,user){
        if(err)
        {
            console.error(err);
        }
        if(user.length != 0)
        {
            res.status(200).send('Email is already registered');
        }
        else if (user.length == 0)
        {
            registermodel.find({ username: req.body.username }, function (err, data) {
                if (err) {
                    console.error(err)
                }
                if (data.length == 1) {
                    res.status(200).send('Username already in use.Kindly enter another username.');
                }
                if (data.length == 0) {
                    if (req.body.password == req.body.cnfpassword) {
                        registerdata.save().then(() => {
                            res.status(200).render('login.pug')
                        }).catch(() => {
                            res.status.render('registration.pug')
                        })
                        console.log('Data is saved succesfully');
                    }
                    else {
                        res.status(200).send('enter the password again');
                    }
                }
            })
        }
    })
})



app.post('/bookslot', (req, res) => {
    // var availabilitydata = new availabilitymodel(req.body);
    console.log(req.body);
    let dt1 = new Date(req.body.entrydate);
    let a = req.body.entrytime;
    let x = 10 * a[0] + a[1];
    let y = 10 * a[3] + a[4];
    dt1.setHours(x);
    dt1.setMinutes(y);
    console.log(dt1);

    let dt2 = new Date(req.body.exitdate);
    let b = req.body.exittime;
    let m = 10 * b[0] + b[1];
    let n = 10 * b[3] + b[4];
    dt2.setHours(m);
    dt2.setMinutes(n);
    console.log(dt2);

    adminmodel.find(function (err, slotdata) {
        if (err) {
            console.error(err);
        }
        else {
            console.log(slotdata[0].slots);
            let obj = { entrydate: dt1, exitdate: dt2, email: req.body.email }
            console.log(obj);

            var availabilitydata = new availabilitymodel(obj);

            availabilitymodel.find({ entrydate: { $gte: obj.dt1 }, exitdate: { $lte: obj.dt2 } }, function (err, data) {
                if (err) 
                {
                    res.status(500).send();
                }
                else if (data.length < slotdata[0].slots) 
                {
                    console.log(data.length);
                    availabilitydata.save();
                    // res.status(200).send('tickets confirmed');
                    availabilitymodel.find({email : req.body.email},function(err,data){
                        if(err)
                        {
                            console.error(err);
                        }
                        else
                        {
                            console.log(data);
                            res.status(200).render('history',{details : data})
                        }
                    })
                }
                else 
                {
                    res.status(200).send('tickets not confirmed [Out of slots]');
                }
            })
        }
    })
})



app.post('/checkavailability', (req, res) => {

    console.log(req.body);

    let dt1 = new Date(req.body.entrydate);
    console.log(dt1);
    let a = req.body.entrytime;
    let x = 10 * a[0] + a[1];
    let y = 10 * a[3] + a[4];
    dt1.setHours(x);
    dt1.setMinutes(y);
    console.log(dt1);

    let dt2 = new Date(req.body.exitdate);
    let b = req.body.exittime;
    let m = 10 * b[0] + b[1];
    let n = 10 * b[3] + b[4];
    dt2.setHours(m);
    dt2.setMinutes(n);
    console.log(dt2);

    adminmodel.find(function(err,slotdata){
        if(err)
        {
            console.error(err);
        }
        else
        {
            console.log(slotdata[0].slots);
            let obj = { entrydate: dt1, exitdate: dt2 }
            console.log(obj);

            availabilitymodel.find({ entrydate: { $gte: obj.dt1 }, exitdate: { $lte: obj.dt2 } },function (err, data) {
                if (err) {
                    res.status(500).send();
                }
                else if (data.length < slotdata[0].slots) {
                    console.log(data.length);
                    var x = slotdata[0].slots - data.length;
                    res.status(200).send(x + 'slots are availabe');
                }
                else {
                    res.status(200).send('NO slots are available');
                }
            })
        }
    })

    
})

app.post('/ContactUs', (req, res) => {
    var contactusdata = new contactusmodel(req.body);
    registermodel.find({email : req.body.email},function(err,data){
        if(err)
        {
            console.error(err);
        }
        else if(data.length == 1)
        {
            contactusdata.save();
            res.status(200).send('Thanks for using the product.We will look into your concern shortly.')
        }
        else if(data.length == 0)
        {
            res.status(200).send('Your email is not registered.')
        }
    })
    
})


app.post('/requestextension', (req, res) => {
    console.log(req.body);
    let dt1 = new Date(req.body.newexitdate);
    let a = req.body.newexittime;
    let x = 10 * a[0] + a[1];
    let y = 10 * a[3] + a[4];
    dt1.setHours(x);
    dt1.setMinutes(y);
    console.log(dt1);
    let obj = { ticketID: req.body.ticketID, newexitdate: dt1 }
    var extensiondata = new extensionmodel(obj);
    adminmodel.find(function(err,slotdata){
        if(err)
        {
            console.error(err);
        }
        else
        {
            availabilitymodel.find({ _id: req.body.ticketID }, function (err, data) {
                if (err) {
                    console.error(err);
                    res.status(500).send();
                }
                if (data.length == 0) {
                    console.log('You have entered wrong ticket ID');
                    res.status(200).render('requestextension.pug');
                }
                else if (data.length == 1) {
                    req.session = data;
                    console.log(req.session);
                    availabilitymodel.find({ entrydate: { $gte: req.session.exitdate }, exitdate: { $lte: obj.dt1 } }, function (err, data2) {
                        if (err) 
                        {
                            console.error(err);
                            res.status(500).send();
                        }
                        else if (data2.length <= slotdata[0].slots) 
                        {
                            let spantime = data[0].span  +  (dt1 - data[0].exitdate)/(1000*60*60);
                            console.log(spantime);
                            availabilitymodel.updateOne({ _id: req.body.ticketID },{$set : {span : spantime}},function(err){
                                if(err)
                                {
                                    console.error(err);
                                }
                            }) 
                            console.log('Extension is possible');
                            extensiondata.save();
                            res.status(200).send('Extension is successful');
                        }
                        else 
                        {
                            res.status(200).send('Extension is not possible');
                        }
                    })
                }
            })
        }
    })
})

app.post('/additionalservices',(req,res)=>{
    console.log(req.body);
    availabilitymodel.updateOne({username : req.body.username},{serviceregistered : 'YES'},function(err,data)
    {
        if(err)
        {
            console.error(err);
        }
        else
        {
            console.log('data is succesfully registered on data base');
        }
    });
    res.status(200).send('succesfully registered for servicicng.');
})


app.post('/forgotpassword',(req,res)=>{
    console.log(req.body);
    registermodel.find({email : req.body.email,vehiclenumber : req.body.vehiclenumber},function(err,data){
        console.log(data);
        if(err)
        {
            console.error(err);
        }
        else if(data.length == 0)
        {
            res.status(200).send('you are not registered');
        }
        else if( data.length == 1)
        {
            if(req.body.password == req.body.cnfpassword)
            {
                registermodel.updateOne(data[0],{$set : {password : req.body.password,cnfpassword : req.body.cnfpassword}},function(err,user){
                    if(err)
                    {
                        console.error(err);
                    }
                    else
                    {
                        console.log(user);
                        res.status(200).send('password changed succesfully');
                    }
    
                })
            }
            else
            {
                res.status(200).send('Enter your password again');
            }
        }
    })
})



app.get('/cancellation',(req,res)=>{
    res.status(200).render('cancellation.pug');
})


app.post('/cancellation',(req,res)=>{
    console.log(req.body);
    availabilitymodel.find({_id : req.body.ticketID},function(err,data)
    {
        if(err)
        {
            console.error(err);
        }
        else
        {
            if(data.length == 0)
            {
                res.status(200).send('Re-enter the data');
            }
            else if(data.length == 1)
            {
                availabilitymodel.deleteMany({_id : req.body.ticketID},function(err)
                {
                    if(err)
                    {
                        console.error(err);
                    }
                    else
                    {
                        console.log('Data is deleted succesfully');
                    }
                })
            }
        }
    })
})


app.get('/getdetails',(req,res)=>{
    res.status(200).render('getdetails.pug');
})


app.post('/getdetails',(req,res)=>{
    console.log(req.body);
    availabilitymodel.find({email : req.body.email},function(err,data){
        if(err)
        {
            console.error(err);
        }
        else
        {
            console.log(data);
            res.status(200).render('history',{details : data})
        }
    })
})
    



//Server starting stuff
app.listen(port, (req, res) => {
    console.log(`The server is running on http://localhost:${port}`);
})

