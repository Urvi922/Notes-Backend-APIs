const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');


const connect = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
};

const disconnect = async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
};

module.exports = { connect, disconnect };


