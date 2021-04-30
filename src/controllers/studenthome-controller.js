const database = require("../dao/database");
const logger = require('tracer').console();

module.exports = {
    create: (req, res, next) => {
        const studenthome = req.body;
    
        database.add(studenthome, (err, result) => {
          if (err) {
            logger.log('Error adding studenthome ', studenthome);
            next({ message: 'studenthome-controller.getAll is not implemented yet', errorCode: 501 });
            // of mooier: next(err), als dat err-object matcht bij onze errorhandler
          }
          if (result) {
            res.status(200).json({ status: 'success', result: result });
          }
        });
    },

    getAll: (req, res, next) => {
        logger.log('studenthome-controller.getAll called');
        database.getAll((err, result) => {
          if (err) {
            // Als err niet undefined is, dan was er blijkbaar een foutsituatie.
            next(err);
          }
          if (result) {
            res.status(200).json({
              status: 'success',
              result: result,
            });
          }
        });
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
        const studenthome = database.getStudentHomeById(id)
        if(studenthome) {
            logger.log('item was found')
            database.update(database.db.indexOf(studenthome), newStudenthome)
            res.status(200).json({status: 'succes', result: newStudenthome})
        } else {
            logger.log('item was not found')
            next({error: 'item not found', errorCode: 404})
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
            res.status(400).json(response)
        } else {
            logger.log('item was not found')
            next({error: 'item not found', errorCode: 404})
        }
    },

    addUser: (req, res, next) => {
        // not implemented yet
        const id = req.params.homeId
        const studenthome = database.getStudentHomeById(id)
        logger.log(`id: ${id}  studenthome: ${studenthome}`)

        next({error: 'addUser not implemented yet', errorCode: 501})
    }
}