import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const exceptionSchema = new Schema({
    chiplet_a_id: String,
    chiplet_b_id: String,
    reason: String,
    _id: String
});

const Exception = model('Exception', exceptionSchema);
export default Exception;