const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../../server")
const database = require("../../src/dao/database")
const assert = require("assert")
chai.should()
chai.use(chaiHttp)
const logger = require('tracer').console();

describe('Studenthome', () => {
    describe('create', () => {
        it('TC-201-1 should return valid error when required value is not present', (done) => {
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
        it('TC-201-2 should return valid error when postal code is invalid', (done) => {
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
        it('TC-201-6 should return JSON object of the added studenthome', (done) => {
            chai
            .request(server)
            .post('/api/studenthome')
            .send({
                name: 'home1',
                streetName: 'korvelseweg',
                houseNr: 1,
                phoneNr: '0612345678',
                postalCode: '1234JL',
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
        beforeEach((done) => {
            logger.log("database wiped");
            database.db = [];
            done();
          });

        it('TC-202-1 should return empty list', (done) => {
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
    })
})
