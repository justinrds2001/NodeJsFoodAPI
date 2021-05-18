const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../../server")
const pool = require("../../src/config/database")
const assert = require("assert")
chai.should()
chai.use(chaiHttp)
const logger = require('tracer').console()

const CLEAR_DB = 'DELETE IGNORE FROM user'

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
                    Email: "aifif@vjsbb.asug",
                    Password: "iueqgf"
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
                    Password: "iueqgf",
                    Studentnumber: "123456"
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

        it('TC-101-5 should return username and generated token', done => {
            chai
                .request(server)
                .post('/api/register')
                .send({
                    First_Name: "test",
                    Last_Name: "jasgfoauig",
                    Email: "aififv@jsbb.asug",
                    Student_Number: "123456",
                    Password: "iueqgf"
                })
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