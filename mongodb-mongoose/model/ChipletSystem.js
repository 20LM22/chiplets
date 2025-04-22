import mongoose from 'mongoose';
import Chiplet from './Chiplet.js';
import Exception from './Exception.js';
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

chiplet_system_schema.pre('validate', async function() {
    // need to validate that chiplet interfaces are compatible
    const connections = this.chiplet_connections;
    if (connections != undefined) {
        // first loop over all the connections --> check each one
        for (let i = 0; i < connections.length; i++) {
            const interface0 = connections[i].connection[0]; // chiplet0.interfaceuuid
            const interface1 = connections[i].connection[1]; // chiplet1.interfaceuuid
            let chiplet0_interfaceid = "";
            let chiplet1_interfaceid = "";
            let chiplet0_id = "";
            let chiplet1_id = "";
            const split0 = interface0.split(".");
            if (split0.length==1) {
                // error
                return new Promise((resolve, reject) => {
                    reject(new Error(`For connection ${connections[i]}, interface 0 id not formatted as chiplet<X>.<interface_id>`));
                });
            }
            chiplet0_id = split0[0];
            if (!chiplet0_id.startsWith("chiplet")) {
                // error 
                return new Promise((resolve, reject) => {
                    reject(new Error(`For connection ${connections[i]}, interface 0 id does not begin with chiplet<X>.`));
                });
            }
            chiplet0_interfaceid = split0[1];
            const split1 = interface1.split(".");
            if (split1.length==1) {
                // error
                return new Promise((resolve, reject) => {
                    reject(new Error(`For connection ${connections[i]}, interface 1 id not formatted as chiplet<X>.<interface_id>`));
                });
            }
            chiplet1_id = split1[0];
            if (!chiplet1_id.startsWith("chiplet")) {
                // error 
                return new Promise((resolve, reject) => {
                    reject(new Error(`For connection ${connections[i]}, interface 1 id does not begin with chiplet<X>.`));
                });
            }
            chiplet1_interfaceid = split1[1];

            chiplet0_id = this.chiplets.find((e) => e._id == chiplet0_id).chiplet_doc;
            chiplet1_id = this.chiplets.find((e) => e._id == chiplet1_id).chiplet_doc;
           
            const chiplet0 = await Chiplet.findById(chiplet0_id);
            const chiplet1 = await Chiplet.findById(chiplet1_id);
            
            const chiplet0_interface = chiplet0.interfaces.find((e) => e._id == chiplet0_interfaceid);
            const chiplet1_interface = chiplet1.interfaces.find((e) => e._id == chiplet1_interfaceid);

            // if (chiplet0_interface.physical_layer.length==0) {
            //     // error
            //     return new Promise((resolve, reject) => {
            //         reject(new Error(`For connection ${connections[i]}, interface 0 PHY layer is empty.`));
            //     });
            // }
            // if (chiplet1_interface.physical_layer.length==0) {
            //     // error
            //     return new Promise((resolve, reject) => {
            //         reject(new Error(`For connection ${connections[i]}, interface 1 PHY layer is empty.`));
            //     });
            // }
            // if (chiplet0_interface.protocol_layer.length==0) {
            //     // error
            //     return new Promise((resolve, reject) => {
            //         reject(new Error(`For connection ${connections[i]}, interface 0 protocol layer is empty.`));
            //     });
            // }
            // if (chiplet1_interface.protocol_layer.length==0) {
            //     // error
            //     return new Promise((resolve, reject) => {
            //         reject(new Error(`For connection ${connections[i]}, interface 1 protocol layer is empty.`));
            //     });
            // }

            const phy0 = chiplet0_interface.physical_layer[0].split('-')[0]; // get first element in case phy doc doesn't exist
            const phy1 = chiplet1_interface.physical_layer[0].split('-')[0];
            if (phy0 != phy1) {
                // error
                return new Promise((resolve, reject) => {
                    reject(new Error(`For connection ${connections[i]}, PHY layers do not match.`));
                });
            }

            // as long as there's at least 1 protocol on each layer that matches then match the interface
            let match = false;
            // loop over the interfaces in one of the chiplets
            const protocols0 = chiplet0_interface.protocol_layer;
            const protocols1 = chiplet1_interface.protocol_layer;

            for (let j = 0; j < protocols0.length; j++) {
                const protocol0_id = protocols0[j][0]; // should grab the first element in case it doesn't map to one of the protocol documents yet
                for (let k = 0; k < protocols1.length; k++) {
                    const protocol1_id = protocols1[k][0];
                    if (protocol0_id == protocol1_id) {
                        match = true;
                        break;
                    }
               
                }
                if (match) break;
            }

            if (!match) {
                // need to check the next layer
                let p1 = await ProcotolCompatibility.find({ protocol_a_id: chiplet0_id, protocol_b_id: chiplet1_id}).exec();
                let p2 = await ProcotolCompatibility.find({ protocol_a_id: chiplet1_id, protocol_b_id: chiplet0_id}).exec();
                if (p1.length == 0 && p2.length == 0) {
                    // error not compatible
                    return new Promise((resolve, reject) => {
                        reject(new Error(`For connection ${connections[i]}, protocol layers are not compatible.`));
                    });
                }

            } // match --> still need to check exceptions collections
            let e = await Exception.find({ chiplet_a_id: chiplet0_id, chiplet_b_id: chiplet0_id}).exec();
            if (e.length != 0) {
                // found an exception
                // print error with the reason
                return new Promise((resolve, reject) => {
                    reject(new Error(`For connection ${connections[i]}, ${chiplet0_id} and ${chiplet1_id} are not compatible: ${e.reason}.`));
                });
            }
            e = await Exception.find({ chiplet_a_id: chiplet1_id, chiplet_b_id: chiplet0_id}).exec();
            if (e.length != 0) {
                // found an exception
                // print error with the reason
                return new Promise((resolve, reject) => {
                    reject(new Error(`For connection ${connections[i]}, ${chiplet0_id} and ${chiplet1_id} are not compatible: ${e.reason}.`));
                });
            }
            
        }
    }
    
});

const ChipletSystem = model('ChipletSystem', chiplet_system_schema);
export default ChipletSystem;