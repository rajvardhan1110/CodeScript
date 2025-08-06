const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const TestResultModel = new Schema({
    testId: {
        type: ObjectId,
        ref: 'Test'
    },

    response: [
        {
            userId: {
                type: ObjectId,
                ref: 'User'
            },
            marks: {
                type: Number,
               
            }
        }
    ]
});

module.exports = mongoose.model('TestResult', TestResultModel);
