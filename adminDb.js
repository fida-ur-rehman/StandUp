const { connect } = require('./db-connection');
const mongoose = require('mongoose');
const url = process.env.DATABASE1;
let db;
const tenantSchema = new mongoose.Schema({
    id: Number,
    name: String
}, { timestamps: true })

const tenantModel = mongoose.model("tenants", tenantSchema);

const getDb = async () => {
    return db ? db : await connect(url)
}

const getTenantModel = async () => {
    const adminDb = await getDb();
    return adminDb.model("tenants", tenantSchema)
}

module.exports = {
    getTenantModel
}