import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const subbumpMapSchema = new Schema({
    bumps: [
        {
        x_pos: Number,
        y_pos: Number,
        diameter: Number,
        bump_type: String,
        name: String,
        _id: false
        }
    ],
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
    },
    _id: String, // needs to be set by user when constructing the subbump map
});

// need to add hooks for unit validation and parsing, range checking, etc.

const Subbump_Map = model('subbumpmap', subbumpMapSchema);
export default Subbump_Map;