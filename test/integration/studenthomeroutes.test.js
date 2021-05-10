const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../../server")
const database = require("../../src/dao/database")
const assert = require("assert")
chai.should()
chai.use(chaiHttp)
const logger = require('tracer').console();

let testObject1 =                 
{
    name: 'test',
    streetName: 'test',
    houseNr: 1,
    postalCode: '1234AB',
    residence: 'Breda',
    phoneNr: '0612345678',
    meals: [],
    id: 1
}

let testObject2 = 
{
    name: 'test2',
    streetName: 'test2',
    houseNr: 2,
    postalCode: '1234AC',
    residence: 'Breda',
    phoneNr: '0687654321',
    meals: [],
    id: 2
}

describe('Studenthome', () => {
    describe('create', () => {
        beforeEach(done => {
            logger.log("database wiped")
            database.db = []
            done()
        })

        it('TC-201-1 should return valid error when required value is not present', done => {
            chai
                .request(server)
                .post('/api/studenthome')
                .send({
                    name: 'home1',
                    streetName: 'korvelseweg',
                    houseNr: 1,
                    phoneNr: '0612345678',
                    postalCode: '1234JL'
                }) // residence is missing
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')

                    let { error, message } = res.body
                    error.should.be.a('string').that.equals('Some error occured')
                    message.should.be.a('string').that.equals('residence is missing!')
                    done()
                })
        })
        it('TC-201-2 should return valid error when postal code is invalid', done => {
            
            chai
                .request(server)
                .post('/api/studenthome')
                .send({
                    name: 'home1',
                    streetName: 'korvelseweg',
                    houseNr: 1,
                    phoneNr: '0612345678',
                    postalCode: '1234J',
                    residence: 'Tilburg'
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
        it('TC-201-3 should return valid error when phone number is invalid', done => {
            chai
                .request(server)
                .post('/api/studenthome')
                .send({
                    name: 'home1',
                    streetName: 'korvelseweg',
                    houseNr: 1,
                    phoneNr: '0612a45678',
                    postalCode: '1234JL',
                    residence: 'Tilburg'
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
        it('TC-201-4 should return valid error when studenthome already exists', done => {
            database.db = [{
                name: 'home1',
                streetName: 'korvelseweg',
                houseNr: 1,
                phoneNr: '0612345678',
                postalCode: '1234JL',
                residence: 'Tilburg'
            }]
            chai
                .request(server)
                .post('/api/studenthome')
                .send({
                    name: 'home2',
                    streetName: 'korvelseweg',
                    houseNr: 1,
                    phoneNr: '0612345678',
                    postalCode: '1234JL',
                    residence: 'Tilburg'
                }) // same adress as home1
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')

                    let { error, message } = res.body
                    error.should.be.a('string').that.equals('Some error occured')
                    message.should.be.a('string').that.equals('studenthome already exists')
                    done()
                })
        })
        it('TC-201-6 should return JSON object of the added studenthome', done => {
            chai
            .request(server)
            .post('/api/studenthome')
            .send({
                name: 'home1',
                streetName: 'testweg',
                houseNr: 1,
                phoneNr: '0612345678',
                postalCode: '1234JD',
                residence: 'Tilburg'
            }) // studenthome data is valid
            .end((err, res) => {
                assert.ifError(err)
                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be.an('object').that.has.all.keys('status', 'result')

                let { status, result } = res.body
                status.should.be.a('string').that.equals('success')
                result.should.be.a('object').that.has.all.keys('name', 'streetName', 'houseNr', 'phoneNr', 'postalCode', 'residence', 'meals', 'id')
                let { meals, id } = result
                meals.should.be.an('array')
                id.should.be.a('number')
                done()
            })
        })
    })

    describe('getAll', () => {
        beforeEach(done => {
            logger.log("database wiped")
            database.db = []
            done()
        })

        it('TC-202-2 should return empty list', done => {
            chai
                .request(server)
                .get('/api/studenthome')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('status', 'result')
                    let { status, result } = res.body
                    status.should.be.a('string').that.equals('success')
                    result.should.be.an('array')
                    result.length.should.equal(0)
                    done()
                })
        })
        it('TC-202-1 should return list of 2 items', done => {
            database.db = [testObject1, testObject2]
            chai
                .request(server)
                .get('/api/studenthome')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('status', 'result')
                    let { status, result } = res.body
                    status.should.be.a('string').that.equals('success')
                    result.should.be.an('array')
                    result.length.should.equal(2)
                    done()
                })
        })
    })

    describe('getById', () => {
        beforeEach(done => {
            logger.log("database wiped")
            database.db = []
            done()
        })

        it('TC-203-1 should return valid error when studenhome ID does not exist', done => {
            database.db = [testObject1, testObject2]
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
                    message.should.be.an('string').that.equals('HomeId 3 not found')
                    done()
                })
        })
        it('TC-203-2 should return JSON object of the found studenthome', done => {
            database.db = [testObject1, testObject2]
            chai
                .request(server)
                .get('/api/studenthome/1')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('status', 'result')
                    let { status, result } = res.body
                    status.should.be.a('string').that.equals('success')
                    result.should.be.an('object').that.has.all.keys('name', 'streetName', 'houseNr', 'postalCode', 'residence', 'phoneNr', 'meals', 'id')
                    done()
                })
        })
    })

    describe('update', () => {
        beforeEach(done => {
            logger.log("database wiped")
            database.db = []
            done()
        })

        it('TC-204-1 should return valid error when required field is missing', done => {
            database.db = [testObject1, testObject2]
            chai
                .request(server)
                .put('/api/studenthome/1')
                .send({
                    name: 'test aangepast',
                    streetName: 'test',
                    houseNr: 1,
                    postalCode: '1234AB',
                    phoneNr: '0612345678',
                }) // residence is missing
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { error, message } = res.body
                    error.should.be.a('string').that.equals('Some error occured')
                    message.should.be.an('string').that.equals('residence is missing!')
                    done()
                })
        })
        it('TC-204-2 should return valid error when postal code is invalid', done => {
            database.db = [testObject1, testObject2]
            chai
                .request(server)
                .put('/api/studenthome/1')
                .send({
                    name: 'test aangepast',
                    streetName: 'test',
                    houseNr: 1,
                    postalCode: '1234A',
                    residence: 'Breda',
                    phoneNr: '0612345678',
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
        it('TC-204-3 should return valid error when phone number is invalid', done => {
            database.db = [testObject1, testObject2]
            chai
                .request(server)
                .put('/api/studenthome/1')
                .send({
                    name: 'home1',
                    streetName: 'korvelseweg',
                    houseNr: 1,
                    phoneNr: '0612a45678',
                    postalCode: '1234JL',
                    residence: 'Tilburg'
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
        it('TC-204-4 should return valid error when studenthome does not exist', done => {
            database.db = [testObject1, testObject2]
            chai
                .request(server)
                .put('/api/studenthome/3')
                .send({
                    name: 'home1',
                    streetName: 'korvelseweg',
                    houseNr: 1,
                    phoneNr: '0612345678',
                    postalCode: '1234JL',
                    residence: 'Tilburg'
                }) 
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { error, message } = res.body
                    error.should.be.a('string').that.equals('Some error occured')
                    message.should.be.an('string').that.equals('item not found')
                    done()
                })
        })
        it('TC-204-6 should return JSON of new studenthome', done => {
            database.db = [testObject1, testObject2]
            chai
                .request(server)
                .put('/api/studenthome/1')
                .send({
                    name: 'test',
                    streetName: 'test',
                    houseNr: 1,
                    postalCode: '1234AB',
                    residence: 'Breda',
                    phoneNr: '0612345678',
                }) 
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('status', 'result')
                    let { status, result } = res.body
                    status.should.be.a('string').that.equals('success')
                    result.should.be.an('object').that.has.all.keys('name', 'streetName', 'houseNr', 'postalCode', 'residence', 'phoneNr', 'meals', 'id')
                    done()
                })
        })
    })

    describe('delete', () => {
        beforeEach(done => {
            logger.log("database wiped")
            database.db = []
            done()
        })

        it('TC-205 should return valid error if studenthome does not exist', done => {
            database.db = [testObject1, testObject2]
            chai
                .request(server)
                .delete('/api/studenthome/3')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(404)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('error', 'message')
                    let { error, message } = res.body
                    error.should.be.a('string').that.equals('Some error occured')
                    message.should.be.an('string').that.equals('item not found')
                    done()
                })
        })

        it('TC-205 should return valid error if studenthome does not exist', done => {
            database.db = [testObject1, testObject2]
            chai
                .request(server)
                .delete('/api/studenthome/1')
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(200)
                    res.should.be.an('object')
                    res.body.should.be.an('object').that.has.all.keys('status', 'message')
                    let { status, message } = res.body
                    status.should.be.a('string').that.equals('success')
                    message.should.be.an('string').that.equals('item with id: 1 was deleted!')
                    done()
                })
        })
    })
})
