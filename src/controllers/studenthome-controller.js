const assert = require("assert");
const database = require("../dao/database");
const logger = require('tracer').console();

module.exports = {
    validateStudenthome(req, res, next) {
        logger.log("validate movie");
        logger.log(req.body);
        try {
            const { name, streetName, houseNr, postalCode, residence, phoneNr } = req.body
            assert(typeof name === 'string', 'name is missing!')
            assert(typeof streetName === 'string', 'street name is missing!')
            assert(typeof houseNr === 'number', 'house number is missing!')
            assert(typeof postalCode === 'string', 'postal code is missing!')
            assert.match(postalCode, /[1-9]{1}[0-9]{3}[A-Z]{2}/, 'postal code is invalid!')
            assert(typeof residence === 'string', 'residence is missing!')
            assert(typeof phoneNr === 'string', 'phone number is missing')
            assert.match(phoneNr, /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, 'phone number is invalid!')
            next()
        } catch (err) {
            logger.log("Studenthome data is invalid!: ", err.message)
            next({ message: err.message, errorCode: 400 })
        }
    },

    create: (req, res, next) => {
        const studenthome = req.body;
    
        database.add(studenthome, (err, result) => {
          if (err) {
            logger.log('Error adding studenthome ', studenthome);
            next({ message: 'studenthome-controller.getAll is not implemented yet', errorCode: 501 })
            // of mooier: next(err), als dat err-object matcht bij onze errorhandler
          }
          if (result) {
            res.status(200).json({ status: 'success', result: result })
          }
        })
    },

    getAll: (req, res, next) => {
        logger.log('studenthome-controller.getAll called')
        database.getAll((err, result) => {
          if (err) {
            // Als err niet undefined is, dan was er blijkbaar een foutsituatie.
            next(err);
          }
          if (result) {
            res.status(200).json({
              status: 'success',
              result: result,
            })
          }
        })
    },

    getById: (req, res, next) => {
        logger.log("studenthome-controller.getById called");

        const studenthomeId = req.params.homeId
        database.getById(studenthomeId, (err, result) => {
            if (err) {
                next({ message: `HomeId ${studenthomeId} not found`, errorCode: 404 })
            }
            if (result) {
                res.status(200).json({
                    status: 'success',
                    result:result
                })
            }
        })
    },

    update: (req, res, next) => {
        const id = req.params.homeId
        let newStudenthome = req.body
        newStudenthome.id = parseInt(id)
        newStudenthome.meals = []
        const studenthome = database.getStudentHomeById(id)
        if(studenthome) {
            logger.log('item was found')
            database.update(database.db.indexOf(studenthome), newStudenthome)
            res.status(200).json({status: 'success', result: newStudenthome})
        } else {
            logger.log('item was not found')
            next({message: 'item not found', errorCode: 404})
        }
    },

    delete: (req, res, next) => {
        const id = req.params.homeId
        const studenthome = database.getStudentHomeById(id)
        if(studenthome) {
            logger.log('item was found')
            database.remove(database.db.indexOf(studenthome))
            const response = {
                status: 'success',
                message: 'item with id: ' + id + ' was deleted!' 
            }
            res.status(200).json(response)
        } else {
            logger.log('item was not found')
            next({message: 'item not found', errorCode: 404})
        }
    },

    addUser: (req, res, next) => {
        // not implemented yet
        const id = req.params.homeId
        const studenthome = database.getStudentHomeById(id)
        logger.log(`id: ${id}  studenthome: ${studenthome}`)

        next({message: 'addUser not implemented yet', errorCode: 501})
    }
}