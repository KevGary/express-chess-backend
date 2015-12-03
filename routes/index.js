var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

var bcrypt = require('bcrypt');

//pg config
var pg = require('pg');
var conString = process.env.DATABASE_URL;

//global
var jwtSecret = process.env.SECRET;

//restrictions if not logged in
// router.use(expressJwt({secret: process.env.SECRET}).unless({ path: [ '/login', '/register' ] }));

//login
router.post('/login', function(req, res, next) {
  if(req.body.user.email == "" || req.body.user.password == "") {
    res.status(400).end('Must provide username and password');
  }
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    console.log("connected to database");
    client.query('SELECT * FROM users WHERE email = $1', [req.body.user.email], function(err, result) {
      if (err) {
        return console.error('error running query', err);
      } else if (result.rows.length < 1) {
        res.status(400).end('User not found');
      } else {
        var hash = result.rows[0].password; 
        bcrypt.compare(req.body.user.password, hash, function(err, bcryptRes) {
          if(err || bcryptRes == false) {
            res.status(400).end('Password incorrect');
          }
          if(bcryptRes == true) {
            client.query('SELECT * FROM users WHERE email = $1 AND password = $2', [req.body.user.email, hash], function(err, result) {
              done();
              if (err) {
                return console.error('error running query', err);
              } else if (result.rows.length < 1) {
                res.status(400).end('User or password incorrect');
              } else if (bcryptRes == true) {
                var token = jwt.sign({
                  id: result.rows[0].id
                }, jwtSecret);
                client.query('UPDATE users SET token = $2  WHERE id = $1', [result.rows[0].id, token], function(err, result) {
                  done();
                  if (err) {
                    return console.error('error running query', err);
                  }
                  res.send({
                    token: token
                  });
                });
              }
            });
          }
        });
      }
    });
  });
});
//register
router.post('/register', function(req, res, next) {
  console.log(req);
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    console.log("connected to database");
    bcrypt.hash(req.body.user.password, 8, function(err, hash) {
      client.query('INSERT INTO users(name, email, password) VALUES($1, $2, $3) returning id', [req.body.user.name, req.body.user.email, hash], function(err, result) {
        done();
        if(err) {
          return console.error('error running query', err);
        }
        var token = jwt.sign({
          id: result.rows[0].id
        }, jwtSecret);
        client.query('UPDATE users SET token = $2  WHERE id = $1', [result.rows[0].id, token], function(err, result) {
          done();
          if (err) {
            return console.error('error running query', err);
          }
          res.send({
            token: token
          });
        });
      });
    });
  });
});

//Users
//get all
router.get('/users', function(req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    console.log("connected to database");
    client.query('SELECT * FROM users', function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err);
      }
      res.send(result);
    });
  });
});
//post user
router.post('/users', function(req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    console.log("connected to database");
    bcrypt.hash(req.body.data.attributes.password, 8, function(err, hash) {
      client.query('INSERT INTO users(name, email, password) VALUES($1, $2, $3) returning id', [req.body.data.attributes.name, req.body.data.attributes.email, hash], function(err, result) {
        done();
        if(err) {
          return console.error('error running query', err);
        }
        res.send(result);
      });
    });
  });
});
//get one
router.get('/users/:id', function(req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    console.log("connected to database");
    client.query('SELECT * FROM users WHERE id = $1', [req.params.id], function(err, result) {
      done();
      console.log(req.params.id)
      if (err) {
        return console.error('error running query', err);
      }
      res.send(result);
    });
  });
});
// update one
router.put('/users/update/:id', function(req, res, next) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    console.log("connected to database");
    //query for password (storedPW)
    //compare with .compareSync(req.body.data.attributes.password, storedPW)
    bcrypt.hash(req.body.data.attributes.password, 8, function(err, hash) {
      client.query('UPDATE users SET name = $2, email = $3, password = $4  WHERE id = $1', [req.params.id, req.body.data.attributes.name, req.body.data.attributes.email, hash], function(err, result) {
        done();
        if (err) {
          return console.error('error running query', err);
        }
        res.send(result);
      });
    });
  });
});
//delete all
router.delete('/users/delete', function(req, res, next) {
  pg.connect(conString, function(err, client, done) {
     console.log(conString)
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    console.log("connected to database");
    client.query('DELETE FROM users', function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err);
      }
      res.send(result);
    });
  });
});
//delete one
router.delete('/users/delete/:id', function(req, res, next) {
  pg.connect(conString, function(err, client, done) {
     console.log(conString)
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    console.log("connected to database");
    client.query('DELETE FROM users WHERE id = $1',[req.params.id], function(err, result) {
      done();
      if (err) {
        return console.error('error running query', err);
      }
      res.send(result);
    });
  });
});

module.exports = router;