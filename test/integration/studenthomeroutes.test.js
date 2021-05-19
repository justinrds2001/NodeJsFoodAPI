const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../../server")
const pool = require("../../src/config/database")
const assert = require("assert")
chai.should()
chai.use(chaiHttp)
const logger = require('tracer').console();
const jwt = require('jsonwebtoken')

const CLEAR_DB = 'DELETE IGNORE FROM user;' + 'DELETE IGNORE FROM studenthome;'
const CLEAR_HOMES_TABLE = 'DELETE IGNORE FROM studenthome'
const CLEAR_USERS_TABLE = 'DELETE FROM user'

// ID = 1
const INSERT_USER =
  'INSERT INTO user (ID, First_Name, Last_Name, Email, Student_Number, Password ) VALUES' +
  '(1, "first", "last", "name@server.nl","1234567", "secret");'

const INSERT_HOMES =
  'INSERT INTO studenthome (ID, Name, Address, House_Nr, UserID, Postal_Code, Telephone, City) VALUES ' +
  '(1, "House A", "Haagdijk", 20, 1, "1234AB", "0612345678", "Breda"),' +
  '(2, "House B", "Princenhage", 30, 1, "4321BA", "0687654321", "Tilburg");'

// gets called once before starting the tests
before((done) => {
  pool.query(CLEAR_DB, (err, rows, fields) => {
    if (err) {
      logger.error(`beforeEach CLEAR error: ${err}`)
      done(err)
    } else {
      done()
    }
  })
})

// gets called once before the tests
before((done) => {
    pool.query(INSERT_USER, (err, rows, fields) => {
        if (err) {
          logger.error(`before INSERT_USER: ${err}`)
          done(err)
        }
        if (rows) {
          logger.debug(`before INSERT_USER done`)
          done()
        }
    })
})

// gets called once after completing the tests
after((done) => {
    pool.query(CLEAR_DB, (err, rows, fields) => {
      if (err) {
        console.log(`after error: ${err}`)
        done(err)
      } else {
        logger.info('After FINISHED')
        done()
      }
    })
})

describe('UC-201 create studenthome', () => {
    beforeEach((done) => {
        pool.query(CLEAR_HOMES_TABLE, (err, rows, fields) => {
          if (err) {
            logger.error(`beforeEach CLEAR_HOMES_TABLE: ${err}`)
            done(err)
          }
          if (rows) {
            done()
          }
        })
    })

    after((done) => {
        pool.query(CLEAR_HOMES_TABLE, (err, rows, fields) => {
          if (err) {
            logger.error(`after error: ${err}`)
            done(err)
          }
          if (rows) {
            done()
          }
        })
    })

    it('TC-201-1 should return valid error when required value is not present', done => {
        jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
            chai
            .request(server)
            .post('/api/studenthome')
            .set('authorization', 'Bearer ' + token)
            .send({
                Name: 'home1',
                Address: 'korvelseweg',
                House_Nr: 1,
                Postal_Code: '1234JL',
                Telephone: '0612345678'                    
            }) // city is missing
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('error', 'message')
                let { error, message } = res.body
                error.should.be.a('string').that.equals('Some error occured')
                message.should.be.a('string').that.equals('city is missing!')
                done()
            })
        })
    })

    it('TC-201-2 should return valid error when postal code is invalid', done => {
        jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {            
            chai
            .request(server)
            .post('/api/studenthome')
            .set('authorization', 'Bearer ' + token)
            .send({
                Name: 'home1',
                Address: 'korvelseweg',
                House_Nr: 1,
                Postal_Code: '1234J',
                Telephone: '0612345678',
                City: 'Tilburg'
            }) // postal code is in the wrong format
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('error', 'message')
                let { error, message } = res.body
                error.should.be.a('string').that.equals('Some error occured')
                message.should.be.a('string').that.equals('postal code is invalid!')
                done()
            })
        })
    })

    it('TC-201-3 should return valid error when phone number is invalid', done => {
        jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
            chai
            .request(server)
            .post('/api/studenthome')
            .set('authorization', 'Bearer ' + token)
            .send({
                Name: 'home1',
                Address: 'korvelseweg',
                House_Nr: 1,
                Postal_Code: '1234JL',
                Telephone: '06123a5678',
                City: 'Tilburg'
            }) // phone number is in the wrong format
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('error', 'message')
                let { error, message } = res.body
                error.should.be.a('string').that.equals('Some error occured')
                message.should.be.a('string').that.equals('phone number is invalid!')
                done()
            })
        })
    })

    it('TC-201-4 should return valid error when studenthome already exists', done => {
        pool.query(INSERT_HOMES, (err, rows, fields) => {
            if (err) {
              logger.error(`before INSERT_USER: ${err}`)
            }
            if (rows) {
              logger.debug(`before INSERT_USER done`)
            }
        })
        
        jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
            chai
            .request(server)
            .post('/api/studenthome')
            .set('authorization', 'Bearer ' + token)
            .send({
                Name: 'House C',
                Address: 'korvelseweg',
                House_Nr: 20,
                Postal_Code: '1234AB',
                Telephone: '0612345678',
                City: 'Tilburg'
            }) // same adress as house A
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('error', 'message')
                let { error, message } = res.body
                error.should.be.a('string').that.equals('Some error occured')
                message.should.be.a('string').that.equals('studenthome is invalid or already exists')
                done()
            })
        })
    })

    it('TC-201-5 should return valid error when user is not logged in', done => {
      pool.query(INSERT_USER, (err, rows, fields) => {
          if (err) {
            logger.error(`before INSERT_USER: ${err}`)
          }
          if (rows) {
            logger.debug(`before INSERT_USER done`)
          }
      })
      // no token is given 
      chai
      .request(server)
      .post('/api/studenthome')
      .send({
          Name: 'home1',
          Address: 'korvelseweg',
          House_Nr: 2,
          Postal_Code: '1234JL',
          Telephone: '0612345678',
          City: 'Tilburg'
      }) // correct data
      .end((err, res) => {
          assert.ifError(err)
          res.should.have.status(401)
          res.should.be.an('object')
          res.body.should.be.an('object').that.has.all.keys('error', 'message')
          let { error, message } = res.body
          error.should.be.a('string').that.equals('Some error occured')
          message.should.be.a('string').that.equals('not authorized')
          done()
      })
  })

    it('TC-201-6 should return JSON object of the added studenthome', done => {
        pool.query(INSERT_USER, (err, rows, fields) => {
            if (err) {
              logger.error(`before INSERT_USER: ${err}`)
            }
            if (rows) {
              logger.debug(`before INSERT_USER done`)
            }
        })

        jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
            chai
            .request(server)
            .post('/api/studenthome')
            .set('authorization', 'Bearer ' + token)
            .send({
                Name: 'home1',
                Address: 'korvelseweg',
                House_Nr: 2,
                Postal_Code: '1234JL',
                Telephone: '0612345678',
                City: 'Tilburg'
            }) // correct data
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('status', 'result')
                let { status, result } = res.body
                status.should.be.a('string').that.equals('successful')
                result.should.be.a('object').that.has.all.keys('Name', 'Address', 'House_Nr', 'Postal_Code', 'Telephone', 'City', 'ID')
                done()
            })
        })
    })
})

describe('UC-202 get all studenthomes', () => {
    it('TC-202-1 should return empty list', done => {
        chai
            .request(server)
            .get('/api/studenthome')
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('status', 'result')
                let { status, result } = res.body
                status.should.be.a('string').that.equals('successful')
                result.should.be.an('array')
                result.length.should.equal(0)
                done()
            })
    })

    it('TC-202-2 should return list of 2 items', done => {
      pool.query(INSERT_HOMES, (err, rows, fields) => {
        if (err) {
          logger.error(`beforeEach CLEAR error: ${err}`)
        } 
      })
      
      chai
          .request(server)
          .get('/api/studenthome')
          .end((err, res) => {
              assert.ifError(err)
              res.should.have.status(200)
              res.should.be.an('object')
              res.body.should.be.an('object').that.has.all.keys('status', 'result')
              let { status, result } = res.body
              status.should.be.a('string').that.equals('successful')
              result.should.be.an('array')
              result.length.should.equal(2)
              done()
          })
    })
})


describe('UC-203 get home by ID', () => {
    it('TC-203-1 should return valid error when studenhome ID does not exist', done => {
      chai
      .request(server)
      .get('/api/studenthome/3')
      .end((err, res) => {
          assert.ifError(err)
          res.should.have.status(404)
          res.should.be.an('object')
          res.body.should.be.an('object').that.has.all.keys('error', 'message')
          let { error, message } = res.body
          error.should.be.a('string').that.equals('Some error occured')
          message.should.be.an('string').that.equals('id was not found')
          done()
      })  
    })

    it('TC-203-2 should return JSON object of the found studenthome', done => {
        chai
          .request(server)
          .get('/api/studenthome/1')
          .end((err, res) => {
            assert.ifError(err)
            res.should.have.status(200)
            res.should.be.an('object')
            res.body.should.be.an('object').that.has.all.keys('status', 'result')
            let { status, result } = res.body
            status.should.be.a('string').that.equals('successful')
            result.should.be.an('object').that.has.all.keys('Name', 'Address', 'House_Nr', 'Postal_Code', 'Telephone', 'City', 'ID', 'Meals', 'UserID')
            done()
          })
    })
})

describe('UC-204 update studenhome', () => {

  it('TC-204-1 should return valid error when required field is missing', done => {
    jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
      chai
      .request(server)
      .put('/api/studenthome/3')
      .set('authorization', 'Bearer ' + token)
      .send({
          Name: 'test aangepast',
          Address: 'test',
          House_Nr: 1,
          Postal_Code: '1234AB',
          City: 'Tilburg'
      }) // telephone is missing
      .end((err, res) => {
        assert.ifError(err)
        res.should.have.status(400)
        res.should.be.an('object')
        res.body.should.be.an('object').that.has.all.keys('error', 'message')
        let { error, message } = res.body
        error.should.be.a('string').that.equals('Some error occured')
        message.should.be.a('string').that.equals('phone number is missing!')
        done()
      })
    })
  })

  it('TC-204-2 should return valid error when postal code is invalid', done => {
    jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
      chai
      .request(server)
      .put('/api/studenthome/1')
      .set('authorization', 'Bearer ' + token)
      .send({
          Name: 'test aangepast',
          Address: 'test',
          House_Nr: 1,
          Postal_Code: '1234A',
          Telephone: '0612345678',
          City: 'Tilburg'
      }) // postal code is invalid
      .end((err, res) => {
        assert.ifError(err)
        res.should.have.status(400)
        res.should.be.an('object')
        res.body.should.be.an('object').that.has.all.keys('error', 'message')
        let { error, message } = res.body
        error.should.be.a('string').that.equals('Some error occured')
        message.should.be.a('string').that.equals('postal code is invalid!')
        done()
      })
    })
  })

  it('TC-204-3 should return valid error when phone number is invalid', done => {
    jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
      chai
      .request(server)
      .put('/api/studenthome/1')
      .set('authorization', 'Bearer ' + token)
      .send({
          Name: 'test aangepast',
          Address: 'test',
          House_Nr: 1,
          Postal_Code: '1234AB',
          Telephone: '061a345678',
          City: 'Tilburg'
      }) // phone number is invalid
      .end((err, res) => {
        assert.ifError(err)
        res.should.have.status(400)
        res.should.be.an('object')
        res.body.should.be.an('object').that.has.all.keys('error', 'message')
        let { error, message } = res.body
        error.should.be.a('string').that.equals('Some error occured')
        message.should.be.a('string').that.equals('phone number is invalid!')
        done()
      })
    })
  })

  it('TC-204-4 should return valid error when studenthome does not exist', done => {
    jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
      chai
      .request(server)
      .put('/api/studenthome/3')
      .set('authorization', 'Bearer ' + token)
      .send({
          Name: 'test aangepast',
          Address: 'test',
          House_Nr: 1,
          Postal_Code: '1234AB',
          Telephone: '0612345678',
          City: 'Tilburg'
      }) // correct data
      .end((err, res) => {
        assert.ifError(err)
        res.should.have.status(400)
        res.should.be.an('object')
        res.body.should.be.an('object').that.has.all.keys('error', 'message')
        let { error, message } = res.body
        error.should.be.a('string').that.equals('Some error occured')
        message.should.be.a('string').that.equals('home id not found!')
        done()
      })
    })
  })
})

describe('UC-205 delete studenthome', () => {
  it('TC-205-1 should return valid error when studenthome does not exist.', done => {
    jwt.sign({ id: 1 }, 'secret', { expiresIn: '2h' }, (err, token) => {
      chai
      .request(server)
      .delete('/api/studenthome/3')
      .set('authorization', 'Bearer ' + token)
      .end((err, res) => {
          assert.ifError(err)
          res.should.have.status(400)
          res.should.be.an('object')
          res.body.should.be.an('object').that.has.all.keys('error', 'message')
          let { error, message } = res.body
          error.should.be.a('string').that.equals('Some error occured')
          message.should.be.an('string').that.equals('id was not found')
          done()
      }) 
    })   
  })
    
  it('TC-205-2 should return valid error when user is not logged in', done => {
      pool.query(INSERT_HOMES)
      chai
      .request(server)
      .delete('/api/studenthome/1')
      .end((err, res) => {
          assert.ifError(err)
          res.should.have.status(401)
          res.should.be.an('object')
          res.body.should.be.an('object').that.has.all.keys('error', 'message')
          let { error, message } = res.body
          error.should.be.a('string').that.equals('Some error occured')
          message.should.be.an('string').that.equals('not authorized')
          done()
      })  
  })

  it("TC-205-3 should return valid error when user is not the owner", function (done) {
      chai
        .request(server)
        .delete("/api/studenthome/2")
        .end((err, res) => {
          res.should.have.status(401)
          res.should.be.an("object")

          let {error } = res.body
          error.should.be
            .an("string")
            .that.equals("Some error occured")
          done()
      })
  })

  /*it("TC-205-4 expects 401 with message no exxec to this", function (done) {

  pool.query(
    "INSERT INTO user (`ID`,`First_Name`, `Last_Name`, `Email`, `Student_Number`, `Password`) VALUES (2, 'Diren', 'Ozturk', 'diren_2001@hotmail.com','2158837', 'secret');",
    (err, rows, fields) => {
      chai
          .request(server)
          .delete("/api/studenthome/2")
          .set("Authorization", "Bearer "  + jwt.sign({ id: 2 }, "secret"))
          .end((err, res) => {
              res.should.have.status(401)
              res.should.be.an("object")

              let {error } = res.body;
              error.should.be
                  .an("string")
                  .that.equals("this user is not allowed to change this data")
              done()
          })
      
      })
  })*/
})

        // it('TC-204-6 should return JSON of new studenthome', done => {
        //     database.db = [testObject1, testObject2]
        //     chai
        //         .request(server)
        //         .put('/api/studenthome/1')
        //         .send({
        //             name: 'test',
        //             streetName: 'test',
        //             houseNr: 1,
        //             postalCode: '1234AB',
        //             residence: 'Breda',
        //             phoneNr: '0612345678',
        //         }) 
        //         .end((err, res) => {
        //             assert.ifError(err)
        //             res.should.have.status(200)
        //             res.should.be.an('object')
        //             res.body.should.be.an('object').that.has.all.keys('status', 'result')
        //             let { status, result } = res.body
        //             status.should.be.a('string').that.equals('success')
        //             result.should.be.an('object').that.has.all.keys('name', 'streetName', 'houseNr', 'postalCode', 'residence', 'phoneNr', 'meals', 'id')
        //             done()
        //         })
        // })

//     describe('delete', () => {
//         beforeEach(done => {
//             logger.log("database wiped")
//             database.db = []
//             done()
//         })

//         it('TC-205 should return valid error if studenthome does not exist', done => {
//             database.db = [testObject1, testObject2]
//             chai
//                 .request(server)
//                 .delete('/api/studenthome/3')
//                 .end((err, res) => {
//                     assert.ifError(err)
//                     res.should.have.status(404)
//                     res.should.be.an('object')
//                     res.body.should.be.an('object').that.has.all.keys('error', 'message')
//                     let { error, message } = res.body
//                     error.should.be.a('string').that.equals('Some error occured')
//                     message.should.be.an('string').that.equals('item not found')
//                     done()
//                 })
//         })

//         it('TC-205 should return valid error if studenthome does not exist', done => {
//             database.db = [testObject1, testObject2]
//             chai
//                 .request(server)
//                 .delete('/api/studenthome/1')
//                 .end((err, res) => {
//                     assert.ifError(err)
//                     res.should.have.status(200)
//                     res.should.be.an('object')
//                     res.body.should.be.an('object').that.has.all.keys('status', 'message')
//                     let { status, message } = res.body
//                     status.should.be.a('string').that.equals('success')
//                     message.should.be.an('string').that.equals('item with id: 1 was deleted!')
//                     done()
//                 })
//         })
//     })
// })
