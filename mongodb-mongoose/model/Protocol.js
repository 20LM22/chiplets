import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const protocolSchema = new Schema({
    name: String,
    gtps: Number,
    substructure: mongoose.Mixed,
    _id: String
});

protocolSchema.pre('validate', function() {
    if (this.num_lanes != undefined) {
        if (this.num_lanes <= 0) {
            // error
            return new Promise((resolve, reject) => {
                reject(new Error(`Number of lanes cannot be zero, negative.`));
            });
        }
    }

    if (this.max_bandwidth != undefined) {
        if (this.max_bandwidth <= 0) {
            // error
            return new Promise((resolve, reject) => {
                reject(new Error(`Max bandwidth cannot be zero, negative.`));
            });
        }
    }
});

const Protocol = model('Protocol', protocolSchema);
export default Protocol;