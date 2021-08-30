var express = require('express');
var jwt = require('jsonwebtoken');
var nodemailer = require("nodemailer");
var router = express.Router();
var db = require('../db');
var helpers = require('../helpers');
var errors = [];

/*
 Here we are configuring our SMTP Server details.
 STMP is mail server which is responsible for sending and recieving email.
 */
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "mohitjain2007@gmail.com",
        pass: "aradhya@123",
        //user: "Your Gmail ID",
        //pass: "Gmail Password"
    }
});
var rand, mailOptions, host, link;
var jwt_secret_key = 'YEDILMANGEMORE';
/*------------------SMTP Over-----------------------------*/


router.get('/register', helpers.loginChecker, function (req, res, next) {

    res.render('register', {
        title: 'Register'
    });

});

router.post('/register', helpers.loginChecker, function (req, res, next) {

    if (!helpers.checkForm([req.body.email, req.body.psw, req.body.pswrepeat, req.body.fname])) {
        errors.push('Please fill in all fields!');
        next();
        return;
    }

    if (!helpers.validateEmail(req.body.email)) {
        errors.push('Please enter a valid email address!');
        next();
        return;
    }

    if (req.body.psw !== req.body.pswrepeat) {
        errors.push('Passwords are not equal!');
        next();
        return;
    }

    var sqlQuery = `SELECT * FROM users WHERE user_email = ?`;
    var values = [req.body.email];

    db.query(sqlQuery, values, function (err, results, fields) {

        if (err) {
            errors.push(err.message);
            next();
            return;
        }

        if (results.length == 1) {
            errors.push('Email address already exits try different one!!');
            next();
            return;
        } else {

            var sqlQuery = `INSERT INTO users VALUES(NULL, ?, MD5(?), ?, ?)`;
            var values = [req.body.email, req.body.psw, req.body.fname, 'INACTIVE'];

            db.query(sqlQuery, values, function (err, results, fields) {

                if (err) {
                    errors.push(err.message);
                    next();
                    return;
                }

                if (results.affectedRows == 1) {
                    var lastInsertId = results.insertId;
                    var date = new Date();
                    var mail = {
                        "id": lastInsertId,
                        "created": date.toString()
                    }
                    const token_mail_verification = jwt.sign(mail, jwt_secret_key, {expiresIn: '1d'});
                    host = req.get('host');
                    link = "http://" + req.get('host') + "/verify?id=" + token_mail_verification;
                    mailOptions = {
                        to: req.body.email,
                        subject: "Please confirm your Email account",
                        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
                    }
                    //console.log(mailOptions);
                    smtpTransport.sendMail(mailOptions, function (error, response) {
                        if (error) {
                            console.log(error);
                            res.end("error");
                        } else {
                            console.log("Message sent: " + response.message);
                            res.end("sent");
                        }
                    });
                    res.redirect('/login');
                    return;
                } else {
                    errors.push(err.message);
                    next();
                }
            });
        }
    });
});

router.get('/verify', function (req, res, next) {
    token = req.query.id;
    if (token) {
        try {
            jwt.verify(token, jwt_secret_key, (e, decoded) => {
                if (e) {
                    console.log(e)
                    return res.sendStatus(403)
                } else {
                    id = decoded.id;
                    var sqlQuery = "SELECT * FROM users WHERE user_id = ?";
                    var values = [id];
                    db.query(sqlQuery, values, function (err, results) {
                        if (err) {
                            errors.push('Email does not Exist!!');
                            next();
                            return;
                        }
                        if (results.length == 1) {
                            if (results[0].status == 'INACTIVE') {
                                req.session.authorised = true;
                                req.session.fname = results[0].user_fname
                                req.session.userid = results[0].user_id
                                res.redirect('/survey');
                                return;
                            } else {
                                errors.push('Email Already Verified Please Login!!');
                                res.redirect('/login');
                                return;
                            }
                        } else {
                            errors.push('Email does not Exist!!');
                            next();
                            return;
                        }
                    });
                }
            });
        } catch (err) {
            console.log(err)
            return res.sendStatus(403)
        }
    } else {
        return res.sendStatus(403)
    }

});


router.get('/survey', function (req, res, next) {
    var userid = req.session.userid;
    if (typeof userid != 'undefined') {
        var sqlQuery = "SELECT * FROM survey WHERE user_id = ?";
        var values = [userid];
        db.query(sqlQuery, values, function (err, results) {
            if (results.length == 1) {
                res.redirect('/');
                return;
            }else{
                res.render('survey', {
                title: 'Survey',
                authorised: req.session.authorised,
                fname: req.session.fname,
                });
            }
        });
    } else {
        res.redirect('/');
        return;
    }
});

router.post('/register', function (req, res, next) {
    res.statusCode = 401;
    res.render('register', {
        title: 'Register',
        messages: errors
    });
    errors = [];
});

router.get('/login', helpers.loginChecker, function (req, res, next) {
    res.render('login', {
        title: 'Login'
    });
});

router.post('/login', function (req, res, next) {

    if (!helpers.checkForm([req.body.email, req.body.psw])) {
        errors.push('Please fill in all fields!');
        next();
        return;
    }

    if (!helpers.validateEmail(req.body.email)) {
        errors.push('Please enter a valid email address!');
        next();
        return;
    }

    var sqlQuery = "SELECT * FROM users WHERE user_email = ? AND user_pass = MD5(?)";
    var values = [req.body.email, req.body.psw];

    db.query(sqlQuery, values, function (err, results, fields) {

        if (err) {
            errors.push(err.message);
            next();
            return;
        }

        if (results.length == 1) {
            if (results[0].status == 'ACTIVE') {
                req.session.authorised = true;
                req.session.fname = results[0].user_fname
                req.session.userid = results[0].user_id
                res.redirect('/');
                return;
            } else {
                errors.push('Email is not verified, please verify the email');
                next();
            }
        } else {
            errors.push('The email or password is incorrect.');
            next();
        }

    });

});

router.post('/login', function (req, res, next) {
    res.statusCode = 401;
    res.render('login', {
        title: 'Login',
        messages: errors
    });
    errors = [];
});

router.get('/exit', function (req, res, next) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});


router.get('/profile', function (req, res, next) {
    var userid = req.session.userid;
    if (typeof userid != 'undefined') {
        var sqlQuery = 'SELECT * FROM survey WHERE user_id=' + userid;
        db.query(sqlQuery, function (err, results, fields) {
            var resultArray = Object.values(JSON.parse(JSON.stringify(results)));
            var result = resultArray[0];
            res.render('profile', {
                title: 'Profile',
                authorised: req.session.authorised,
                fname: req.session.fname,
                surveyData: result
            });
        });
    } else {
        res.redirect('/login');
        return;
    }
});

module.exports = router;