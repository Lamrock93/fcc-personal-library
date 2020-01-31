var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

let firstBook; // variable for unit tests
var c; // variable that is apparently used somewhere and needs to be defined

// USER STORY #10: All 6 functional tests are complete and passing

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('Routing tests', function() {
    
    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({title: "Generic Book Title"})
          .end(function(err, res){
            assert.equal(res.status, 200)
            assert.property(res.body, 'comments')
            assert.isArray(res.body.comments)
            assert.property(res.body, 'title')
            assert.property(res.body, '_id')
            assert.equal(res.body.title, "Generic Book Title")
            done();
        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books/')
          .send({title: ''})
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, "No book title entered")
            done();
        })
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'title')
            assert.property(res.body[0], '_id')
            assert.property(res.body[0], 'commentcount')
            firstBook = res.body[0]._id // valid ID to be used in a later test
            done();
        })
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/notabooklol')
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
            done();
        })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get('/api/books/'+firstBook)
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, 'comments')
            assert.isArray(res.body.comments)
            assert.property(res.body, 'title')
            assert.property(res.body, '_id')
            assert.equal(res.body._id, firstBook)
            done();
        })
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post('/api/books/'+firstBook)
          .send({comment: "this is a comment"})
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, 'comments')
            assert.isArray(res.body.comments)
            assert.property(res.body, 'title')
            assert.property(res.body, '_id')
            assert.equal(res.body._id, firstBook)
            assert.include(res.body.comments, "this is a comment")
            done();            
        })
      });
      
    });
    
  });
});c