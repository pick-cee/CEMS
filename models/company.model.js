const mongoose = require("mongoose")

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    numOfEmployees: {
        type: String,
        enum: ['1-10', '11-30', '31-50', '51-150', '151-500', '500+'],
        required: true
    },
    businessIndustry: {
        type: String,
        required: true
    },
}, {timestamps: true})

module.exports = mongoose.model('Company', companySchema)