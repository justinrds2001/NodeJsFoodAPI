const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../../server")
const pool = require("../../src/config/database")
const assert = require("assert")
chai.should()
chai.use(chaiHttp)
const logger = require('tracer').console()

const CLEAR_DB = 'DELETE IGNORE FROM user'
// ID = 1
const INSERT_USER =
  'INSERT INTO user (ID, First_Name, Last_Name, Email, Student_Number, Password ) VALUES' +
  '(1, "first", "last", "name@server.nl","1234567", "secretpassword");'

describe('authentication', () => {
    before((done) => {
        // console.log('beforeEach')
        pool.query(CLEAR_DB, (err, rows, fields) => {
          if (err) {
            logger.error(`beforeEach CLEAR error: ${err}`)
            done(err)
          } else {
            done()
          }
        })
    })

    describe('UC-101 register', () => {
        it('TC101-1 should return valid error when required field is missing', done => {
            chai
                .request(server)
                .post('/api/register')
                .send({
                    First_Name: "test",
                    Last_Name: "jasgfoauig",
                    Email: "aifijs@bb.ug",
                    Password: "iueqgafsff"
                }) // student number is missing!
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { message } = res.body
                    message.should.be.a('string').that.equals('student number is missing!')
                    done()
                })
        })

        it('TC-101-2 should return valid error when email is not valid', done => {
            chai
                .request(server)
                .post('/api/register')
                .send({
                    First_Name: "test",
                    Last_Name: "jasgfoauig",
                    Email: "aififvjsbb.asug",
                    Password: "iueqgfefhb",
                    Student_Number: "123456"
                }) // email is in wrong format
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { message } = res.body
                    message.should.be.a('string').that.equals('email is invalid!')
                    done()
                })
        })

        it('TC-101-3 should return valid error when password is not valid', done => {
            chai
                .request(server)
                .post('/api/register')
                .send({
                    First_Name: "test",
                    Last_Name: "jasgfoauig",
                    Email: "aififv@jsbb.asug",
                    Password: "ifeqg",
                    Student_Number: "123456"
                }) // password is too short
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { message } = res.body
                    message.should.be.a('string').that.equals('password needs to be atleast 8 characters!')
                    done()
                })
        })

        it('TC-101-4 should return valid error when user already exists', done => {
            pool.query(INSERT_USER, (err, rows, fields) => {
                if (err) {
                  logger.error(`before INSERT_USER: ${err}`)
                }
                if (rows) {
                  logger.debug(`before INSERT_USER done`)
                }
            })
            
            chai
                .request(server)
                .post('/api/register')
                .send({
                    First_Name: "test",
                    Last_Name: "jasgfoauig",
                    Email: "name@server.nl",
                    Password: "ifekhjblkqg",
                    Student_Number: "123456"
                }) // email already exists in database
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { message } = res.body
                    message.should.be.a('string').that.equals('user already exists!')
                    done()
                })
        })

        it('TC-101-5 should return username and generated token', done => {
            chai
                .request(server)
                .post('/api/register')
                .send({
                    First_Name: "test",
                    Last_Name: "jasgfoauig",
                    Email: "name@safyr.nl",
                    Student_Number: "123456",
                    Password: "iueqgdsaf"
                }) // correct data
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('id', 'First_Name', 'Last_Name', 'Email', 'Token')
                    let { Token } = res.body
                    Token.should.be.a('string')
                    done()
                })
        })

        after(done => {
            pool.query(CLEAR_DB, (err, rows, fields) => {
                if (err) {
                  logger.error(`beforeEach CLEAR error: ${err}`)
                  done(err)
                } else {
                  done()
                }
            })
        })
    })

    describe('UC-102 login', () => {
        before((done) => {
            // console.log('beforeEach')
            pool.query(INSERT_USER, (err, rows, fields) => {
              if (err) {
                logger.error(`beforeEach CLEAR error: ${err}`)
                done(err)
              } else {
                done()
              }
            })
        })

        it('TC-102-1 should return valid error when required field is missing', done => {
            chai
                .request(server)
                .post('/api/login')
                .send({
                    Email: "name@server.nl"
                }) // password is missing
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { message } = res.body
                    message.should.be.a('string').that.equals('password is missing!')
                    done()
                })
        })

        it('TC-102-2 should return valid error when email is invalid', done => {
            chai
                .request(server)
                .post('/api/login')
                .send({
                    Email: "name.server.nl",
                    Password: "secretpassword",
                }) // email is invalid
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { message } = res.body
                    message.should.be.a('string').that.equals('email is invalid!')
                    done()
                })
        })

        it('TC-102-3 should return valid error when password is invalid', done => {
            chai
                .request(server)
                .post('/api/login')
                .send({
                    Email: "name@server.nl",
                    Password: "secret",
                }) // password is too short
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { message } = res.body
                    message.should.be.a('string').that.equals('password needs to be atleast 8 characters!')
                    done()
                })
        })

        it('TC-102-4 should return valid error when user does not exist', done => {
            chai
                .request(server)
                .post('/api/login')
                .send({
                    Email: "name2@server.nl",
                    Password: "secretpassword",
                }) // user does not exist
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { message } = res.body
                    message.should.be.a('string').that.equals('user not found or password invalid')
                    done()
                })
        })

        it('TC-102-5 should return valid error when user does not exist', done => {
            chai
                .request(server)
                .post('/api/login')
                .send({
                    Email: "name@server.nl",
                    Password: "secretpassword",
                }) // correct data
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('id', 'First_Name', 'Last_Name', 'Email', 'Token')
                    let { Token } = res.body
                    Token.should.be.a('string')
                    done()
                })
        })
    })
})