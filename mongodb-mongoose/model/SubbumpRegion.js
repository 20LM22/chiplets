import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const subbumpRegionSchema = new Schema({
    bumps: [bumpSchema], // a subbump region is a list of bumps that make up the region
    _id: String // needs to be set by user when constructing the subbump map
});

const bumpSchema = new Schema({
    x_pos: Number,
    y_pos: Number,
    diameter: Number,
    bump_type: String,
    _id: false
});

const Subbump_Region = model('Subbump_Region_Schema', subbumpRegionSchema);
export default Subbump_Region;