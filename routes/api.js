'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

// Test to ensure we're connected
MongoClient.connect(process.env.DB, (err, client) => {
  var db = client.db('mytestingdb')
    if(err) {
        console.log('Database error: ' + err);
    } else {
        console.log('Successful database connection');
    }
  })

module.exports = function (app) {

  app.route('/api/books')
  
    // USER STORY #4: Can get an array with all books, with their titles, id's and number of comments
    .get(function (req, res){
      MongoClient.connect(process.env.DB, (err, db) => {
        db.collection('books').find().toArray( (err, docs) => {
          // This is how we get an accurate comment count
          for (var i = 0; i < docs.length; i++) {
            docs[i].commentcount = docs[i].comments.length;
            delete docs[i].comments;
          }
          res.json(docs)
        })
      })
    })
    
    // USER STORY #3: Can post a book title, and have it return a json file with the title and name
    .post(function (req, res){
      var title = req.body.title;
      var book = { title: title, comments: []}
      if (title.length === 0) {
        return res.send("No book title entered")
      }
      MongoClient.connect(process.env.DB, (err, db) => {
        db.collection('books').insertOne(book, (err, doc) => {
          if (err) {
            return res.json({error: err.code})
          } else {
            res.json({title: book.title, _id: book._id, comments: book.comments})
          }
        })
      })
    })
    
    // USER STORY #9: Clicking "Delete all books" will delete all book entries and return a "delete successful" message
    .delete(function(req, res){
      MongoClient.connect(process.env.DB, (err, db) => {
        db.collection('books').remove( {}, (err) => {
        // For some reason the callback doesn't work... The same problem is present in the example problem, and there are no tests for it, so it is what it is
        if (err) {
          return res.json({error: err.code})
        } else {
          return res.send("complete delete successful")
          console.log("complete delete successful")
        }
        });
      })
    });

  app.route('/api/books/:id')
  
    // USER STORY #5: proud.condor.glitch.me/api/books/{_id} returns json file with name, id and comment array
    .get(function (req, res){
      var bookid = req.params.id;
    // USER STORY #8: Requesting a book id that doesn't exist returns a "no book exists" message
      if (bookid.length == 24) { 
        var id = new ObjectId(bookid)
        MongoClient.connect(process.env.DB, (err, db) => {
          db.collection('books').findOne({_id: id}, (err, object) => {
            if (!object) {
              res.send("no book exists")
            }
            res.json({title: object.title, _id: object._id, comments: object.comments})
          })
        })
      } else {
        res.send("no book exists") // Attempting to create an ObjectId that isn't 24 characters gives an error
      }
    })
    
    // USER STORY #6: Can post a comment to a book with a matching ID, return book object with array of comments included
    .post(function(req, res){
      var bookid = req.params.id;
    // User Story 8 (see app.route.get)
      if (bookid.length == 24) {
        var id = new ObjectId(bookid)
      } else {
        res.send("no book exists") // Attempting to create an ObjectId that isn't 24 characters gives an error
      }
      var comment = req.body.comment;
      MongoClient.connect(process.env.DB, (err, db) => {
        db.collection('books').findAndModify(
          {_id: id},
          {},
          {$push: {comments: comment}},
          {new: true, upsert: false},
          (err, object) => {
            if (!object) {
              res.send('no book exists')
            }
            res.json(object.value)
          }
        )
      })
      //json res format same as .get
    })
    
    // USER STORY #7: Can delete a book from the collection using its ID, returning "delete successful"
    .delete(function(req, res){
      var bookid = req.params.id;
      var id = new ObjectId(bookid)
      MongoClient.connect(process.env.DB, (err, db) => {
        db.collection('books').remove({_id: id}, (err) => {
          if (err) {
            return res.json({error: err.code})
          } else {
            res.send("delete successful")
          }
        })
      })
    });
  
};