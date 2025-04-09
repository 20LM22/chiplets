import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const PHYSchema = new Schema({
    name: String,
    max_bandwidth: Number, // bandwidth is for all lanes
    reach: Number,
    clock_type: String, // should clock type, forwarded vs. recovered be in here?
    substructure: mongoose.Mixed,
    _id: String // user sets this explicitly
    // need a physical layer compatibility too? --> no as long as the PHYs are the same they're compat and that's it
}, { collection: 'phys' });

PHYSchema.pre('validate', function() {
    if (this.reach != undefined) {
        if (this.reach <= 0) {
            // error
            return new Promise((resolve, reject) => {
                reject(new Error(`Reach cannot be zero, negative.`));
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

const PHY = model('phy', PHYSchema, 'phys');
export default PHY;