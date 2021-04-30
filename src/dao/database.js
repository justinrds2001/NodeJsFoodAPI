let lastInsertedIndex = 0
const timeToWait = 800
const logger = require('tracer').console();

let database = {
    info: 'this is a temporary repository',
    db: [],

    add(item, callback) {
        setTimeout(() => {
            // De setTimeout SIMULEERT in ons geval de vertraging die een echte database
            // zou hebben. Zodra we dus een echte SQL database gaan gebruiken hebben we de
            // setTimeout niet meer nodig.
            // Add id to the item, this is its index in the database.
            item.id = lastInsertedIndex++;
            this.db.push(item);
            // no error occurred
            callback(undefined, item);
          }, timeToWait);
    },
    
    remove(indexNr) {
        this.db.splice(indexNr, 1)
    },

    update(indexNr, newObject) {
        this.db.splice(indexNr, 1, newObject)
    },

    getAll(callback) {
        setTimeout(() => {
            callback(undefined, database.db);
          }, timeToWait);
    },

    getById(id, callback) {
        const filteredList = this.db.filter((item) => item.id == id )
        logger.log('list: '+filteredList)
        let error = undefined
        if (filteredList.length === 0) {
            error = 1
        }
        callback(error, filteredList[0])
    },

    getStudentHomeById(id) {
        let isFound = false
        let foundItem = undefined
        this.db.forEach((studentHome) => {
                if(id == studentHome.id) {
                    logger.log('item was found')
                    isFound = true
                    foundItem = studentHome
                }
        })
        return foundItem
    }

}

module.exports = database