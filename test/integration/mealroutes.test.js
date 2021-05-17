// const chai = require("chai")
// const chaiHttp = require("chai-http")
// const server = require("../../server")
// const pool = require("../../src/config/database")
// const assert = require("assert")
// chai.should()
// chai.use(chaiHttp)
// const logger = require('tracer').console();

// let testObject1 =                 
// {
//     name: 'test',
//     streetName: 'test',
//     houseNr: 1,
//     postalCode: '1234AB',
//     residence: 'Breda',
//     phoneNr: '0612345678',
//     meals: [
//         {
//             name: 'testmeal',
//             description: 'description',
//             addedAt: '01-01-2021',
//             offeredAt: '02-01-2021',
//             price: '$2,-',
//             allergyInfo: 'info',
//             ingredients: ['cheese', 'more cheese'],
//             id: 1
//         }
//     ],
//     id: 1
// }

// describe('Meal', () => {
//     describe('create', () => {
//         beforeEach(done => {
//             logger.log("database wiped")
//             database.db = []
//             done()
//         })

//         it('TC-301-1 should return valid error when required field is missing', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .post('/api/studenthome/1/meal')
//             .send({
//                 name: 'testmeal',
//                 description: 'description',
//                 addedAt: '01-01-2021',
//                 offeredAt: '02-01-2021',
//                 price: '$2,-',
//                 ingredients: ['cheese', 'more cheese'],
//             }) // allergy info is missing
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(400)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('error', 'message')

//                 let { error, message } = res.body
//                 error.should.be.a('string').that.equals('Some error occured')
//                 message.should.be.a('string').that.equals('allergy info is missing')
//                 done()
//             })
//         })
//         it('TC-301-3 should return JSON object of added meal', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .post('/api/studenthome/1/meal')
//             .send({
//                 name: 'testmeal',
//                 description: 'description',
//                 addedAt: '01-01-2021',
//                 offeredAt: '02-01-2021',
//                 price: '$2,-',
//                 allergyInfo: 'info',
//                 ingredients: ['cheese', 'more cheese']
//             })
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(200)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('status', 'result')

//                 let { status, result } = res.body
//                 status.should.be.a('string').that.equals('success')
//                 result.should.be.a('object').that.has.all.keys('name', 'description', 'addedAt', 'offeredAt', 'price', 'allergyInfo', 'ingredients', 'id')
//                 done()
//             })
//         })

//     })

//     describe('update', () => {
//         beforeEach(done => {
//             logger.log("database wiped")
//             database.db = []
//             done()
//         })

//         it('TC-302-1 should return valid error when required field is missing', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .put('/api/studenthome/1/meal/1')
//             .send({
//                 name: 'testmeal',
//                 description: 'description',
//                 addedAt: '01-01-2021',
//                 offeredAt: '02-01-2021',
//                 price: '$2,-',
//                 ingredients: ['cheese', 'more cheese'],
//             }) // allergy info is missing
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(400)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('error', 'message')

//                 let { error, message } = res.body
//                 error.should.be.a('string').that.equals('Some error occured')
//                 message.should.be.a('string').that.equals('allergy info is missing')
//                 done()
//             })
//         })
//         it('TC-302-4 should return valid error when meal does not exist', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .put('/api/studenthome/1/meal/2')
//             .send({
//                 name: 'testmeal',
//                 description: 'description',
//                 addedAt: '01-01-2021',
//                 offeredAt: '02-01-2021',
//                 price: '$2,-',
//                 allergyInfo: 'info',
//                 ingredients: ['cheese', 'more cheese']
//             })
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(404)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('error', 'message')

//                 let { error, message } = res.body
//                 error.should.be.a('string').that.equals('Some error occured')
//                 message.should.be.a('string').that.equals('item not found')
//                 done()
//             })
//         })
//         it('TC-302-5 should return JSON object of studenthome with changed meal', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .put('/api/studenthome/1/meal/2')
//             .send({
//                 name: 'testmeal changed',
//                 description: 'description',
//                 addedAt: '01-01-2021',
//                 offeredAt: '02-01-2021',
//                 price: '$2,-',
//                 allergyInfo: 'info',
//                 ingredients: ['cheese', 'more cheese']
//             })
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(200)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('status', 'result')

//                 let { status, result } = res.body
//                 status.should.be.a('string').that.equals('success')
//                 result.should.be.an('object').that.has.all.keys('name', 'streetName', 'houseNr', 'postalCode', 'residence', 'phoneNr', 'meals', 'id')
//                 done()
//             })
//         })
//     })
    
//     describe('getAll', () => {
//         beforeEach(done => {
//             logger.log("database wiped")
//             database.db = []
//             done()
//         })

//         it('TC-303-1 should return list of meals', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .get('/api/studenthome/1/meal')
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(200)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('status', 'result')
//                 let { status, result } = res.body
//                 status.should.be.a('string').that.equals('success')
//                 result.should.be.a('array')
//                 done()
//             })
//         })
//     })

//     describe('getById', () => {
//         beforeEach(done => {
//             logger.log("database wiped")
//             database.db = []
//             done()
//         })

//         it('TC-304-1 should return valid error if meal does not exist', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .get('/api/studenthome/1/meal/3')
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(404)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('error', 'message')
//                 let { error, message } = res.body
//                 error.should.be.a('string').that.equals('Some error occured')
//                 message.should.be.a('string').that.equals('item not found')
//                 done()
//             })
//         })
//         it('TC-304-2 should return JSON object of searched meal', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .get('/api/studenthome/1/meal/1')
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(200)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('status', 'result')
//                 let { status, result } = res.body
//                 status.should.be.a('string').that.equals('success')
//                 result.should.be.a('object').that.has.all.keys('name', 'description', 'addedAt', 'offeredAt', 'price', 'allergyInfo', 'ingredients', 'id')
//                 done()
//             })
//         })
    
//     })

//     describe('delete', () => {
//         beforeEach(done => {
//             logger.log("database wiped")
//             database.db = []
//             done()
//         })

//         it('TC-301-4 should return valid error when meal does not exist', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .delete('/api/studenthome/1/meal/3')
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(404)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('error', 'message')

//                 let { error, message } = res.body
//                 error.should.be.a('string').that.equals('Some error occured')
//                 message.should.be.a('string').that.equals('item not found')
//                 done()
//             })
//         })
//         it('TC-301-5 should return studenthome after meal was deleted', done => {
//             database.db = [testObject1]
//             chai
//             .request(server)
//             .delete('/api/studenthome/1/meal/1')
//             .end((err, res) => {
//                 assert.ifError(err)
//                 res.should.have.status(200)
//                 res.should.be.an('object')
//                 res.body.should.be.an('object').that.has.all.keys('status', 'result')

//                 let { status, result } = res.body
//                 status.should.be.a('string').that.equals('success')
//                 result.should.be.an('object').that.has.all.keys('name', 'streetName', 'houseNr', 'postalCode', 'residence', 'phoneNr', 'meals', 'id')
//                 done()
//             })
//         })
//     })
// })