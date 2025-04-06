import mongoose from 'mongoose';
import Chiplet from './Chiplet.js';
const { Schema, model } = mongoose;

const chiplet_schema = new Schema({
    _id: String, // chiplet0, chiplet1, etc.
    chiplet_doc: String // id of the chiplet doc that this chiplet refers to
});

const chiplet_connections_schema = new Schema({
    _id: String, // this id refers to just here at the chiplet system level: connection0, connection1, etc.
    connection: [String, String] // [chiplet0.interfaceuuid, chiplet1.interfaceuuid]
});

const chiplet_system_schema = new Schema({
    chiplets: [chiplet_schema],
    chiplet_connections: [chiplet_connections_schema],
    _id: String
});

const ChipletSystem = model('ChipletSystem', chiplet_system_schema);
export default ChipletSystem;