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

const SubbumpMap = model('subbumpmap', subbumpMapSchema);
export default SubbumpMap;