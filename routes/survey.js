var express = require('express');
var router = express.Router();
var db = require('../db');
var helpers = require('../helpers');
var errors = [];


router.get('/survey', function (req, res, next) {
    res.render('survey', {
      title: 'Survey',
      authorised: req.session.authorised,
      fname: req.session.fname,
    });
});

router.post('/survey', function (req, res, next) {
    var php_framework = req.body.php_framework;
    var php_framework = php_framework.join(', ');
    var user_id  = req.session.userid;
    var sqlQuery = `INSERT INTO survey VALUES(NULL, ?, ?, ?, ?, NULL)`;
            var values = [user_id, req.body.blueent_hear, req.body.php_rate, php_framework];
            db.query(sqlQuery, values, function (err, results, fields) {
                if (err) {
                    errors.push(err.message);
                    next();
                    return;
                }

                if (results.affectedRows == 1) {
                var sql = "UPDATE users SET status = 'ACTIVE' WHERE user_id =" + user_id;
                db.query(sql, function (err, resultsUsers) {
                    if (resultsUsers.affectedRows == 1) {
                        errors.push('Email Verified Sucessfully!!');
                        req.session.destroy(function (err) {
                            res.redirect('/');
                        });
                    } else {
                        errors.push('Email Already Verified!!');
                        next();
                        return;
                    }
                });
                } else {
                    errors.push(err.message);
                    next();
                    return;
                }
            });


});
module.exports = router;