const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
};
const connect = async () => {
    return new Promise(async (resolve, reject) => {
        const connection = await mongoose.createConnection(process.env.DATABASE1, mongoOptions)
        resolve(connection)
    })
};

module.exports = {
    connect
}