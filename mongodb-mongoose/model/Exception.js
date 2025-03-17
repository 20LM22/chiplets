import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const exceptionSchema = new Schema({
    chiplet_a_id: String,
    chiplet_b_id: String,
    reason: String,
    _id: false
});

// can only be filled once the chiplets are generated and chiplet ids are known
// not that flexible

const Exception = model('Exception', exceptionSchema);
export default Exception;