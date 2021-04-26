module.exports = {
    info: 'this is a temporary repository',
    db: [],

    add(item) {
        this.db.push(item)
    },
    
    remove(indexNr) {
        this.db.splice(indexNr, 1)
    }
}