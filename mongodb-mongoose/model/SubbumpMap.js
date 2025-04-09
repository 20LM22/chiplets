import mongoose from 'mongoose';
import Int32 from 'mongoose-int32';
const { Schema, model } = mongoose;

const subbumpMapSchema = new Schema({
    bumps: [
        {
        _id: String,
        count: Int32,
        x_pos: Number,
        y_pos: Number,
        radius: Number,
        bump_type: String,
        name: String,
        voltage_domain: {
            operational_v: String,
            min_operational_v: String,
            max_operational_v: String,
            is_range: Boolean
        },
        clk_domain: {
            operational_clk: String,
            min_operational_clk: String,
            max_operational_clk: String,
            is_range: Boolean
        }
    }
    ],
    _id: String
});

// need to add hooks for unit validation and parsing, range checking, etc.
subbumpMapSchema.pre('validate', function() {

    for (let i = 0; i < this.bumps.length; i++) {
        if (this.bumps[i].count != undefined) {
            if (this.bumps[i].count < 0) {
                return new Promise((resolve, reject) => {
                    reject(new Error('Must have position bump counts.'));
                });
            }
        }

        // validate the rest of the bumps
        if (this.bumps[i].radius == undefined) {
            
            if (this.bumps[i] < 0) {
                return new Promise((resolve, reject) => {
                    reject(new Error('Must have position bump counts.'));
                });
            }
        }
    }
});

const SubbumpMap = model('subbumpmap', subbumpMapSchema);
export default SubbumpMap;