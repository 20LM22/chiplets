import mongoose from 'mongoose';
import Int32 from 'mongoose-int32';
import SubbumpMap from './SubbumpMap.js';
const { Schema, model } = mongoose;

const voltage_domain_schema = new Schema({
    // should there be a way to attach a particular voltage domain to a certain component?
    // for example, link a voltage domain to a ddr document
    operational_v: Number,
    min_operational_v: Number,
    max_operational_v: Number,
    is_range: Boolean, // boolean to choose between whether this is a range or a single value
    _id: false
});

const clock_domain_schema = new Schema({
    // should there be a way to attach a particular voltage domain to a certain component?
    // for example, link a voltage domain to a ddr document
    operational_freq: Number,
    min_operational_freq: Number,
    max_operational_freq: Number,
    is_range: Boolean, // boolean to choose between whether this is a range or a single value
    _id: false
});

const cache_schema = new Schema({
    quantity: Int32,
    capacity: Number,
    associativity: Int32,
    replacement_policy: String,
    // clock_frequency: Number,
    _id: false
});

// generate the bump map first
// hbm subbump maps are not chiplet specific
// make the subbump map ids clear to begin with, not random digits
// BoW slice 2

// don't create subbump maps when the chiplet is created, just create some subbump map documents beforehand,
// give them descriptive names and then just randomly choose them from an enum

// can use transactions to prevent unique subbump maps from going into the database if their associated
// chiplet fails validation

const bump_region_schema = new Schema({
    subbump_map_id: String, // the subbump maps should already exist and when the user creates a chiplet, they use an id from a dropdown/enum to select from the existing ones
    offset: [Number, Number],
    rotation: Number,
    flipped: Boolean,
    _id: String
});

const interface_schema = new Schema({
    physical_layer: [String, String], // enum: ["16x PCIe", "LIPINCON", "UCIe-A", "UCIe-S", "AIB", "MDIO", "LIPINCON", "BoW", "USB", "ethernet", "SATA", "USB4", "PCIe", "DisplayPort"]
    protocol_layer: { // enum: ["16x PCIe", "LIPINCON", "CXL.io", "CXL.cache", "CXL.mem", "PCIe", "AXI", "SATA", "OpenCAPI", "CCIX"]
        type: [[String, String]] // the first field is for the protocol layer name and the second field is for the protocol layer id
    },
    bump_region: String,
    _id: String
});

const cpu_schema = new Schema({ // CPU = compute cluster, compute cluster = CPU clusters
    quantity: Int32,
    manufacturer: String,
    name: String,
    num_cores: Int32,
    clock_frequency: Number,
    process_node: Number,
    substructure: mongoose.Mixed,
    max_thermal_design_power: Number,
    l1_icache: [cache_schema],
    l1_dcache: [cache_schema],
    l2_cache: [cache_schema],
    l3_cache: [cache_schema],
    _id: false
});

const gpu_schema = new Schema({ // CPU = compute cluster, compute cluster = CPU clusters
    quantity: Int32,
    manufacturer: String,
    name: String,
    clock_frequency: Number,
    process_node: Number,
    max_thermal_design_power: Number,
    flops: Number,
    Gpixels_ps: Number,
    Grays_ps: Number,
    substructure: mongoose.Mixed, // user free to design subschema that makes sense for that gpu
    l1_i_cache_per_core: [cache_schema], // maybe it makes sense to put these in the substructure schema as well?
    l1_d_cache_per_core: [cache_schema],
    l2_cache_per_sm: [cache_schema],
    l3_cache: [cache_schema],
    _id: false
});

// const hbm_schema = new Schema({
//     quantity: Int32,
//     version: String, // HBM, HBM2, HBM3
//     capacity: Number,
//     bandwidth: Number, // enum: ["GB/s", "MB/s", "KB/s", "Gb/s", "Mb/s", "Kb/s"]
//     _id: false
// });

const memory_schema = new Schema({
    quantity: Int32,
    name: String,
    capacity: Number,
    bandwidth: Number,
    _id: false
});

const chiplet_schema = new Schema({
    _id: String,
    name: String,
    manufacturer: String,
    area: Number,
    width: Number,
    height: Number,
    process_node: Number,
    functionality: [String],
    HBMs: [memory_schema], // then would have a controller as an interface
    SRAMs: [memory_schema],
    DRAMs: [memory_schema],
    GPUs: [gpu_schema],
    CPUs: [cpu_schema],
    L1_caches: [cache_schema],
    L2_caches: [cache_schema],
    L3_caches: [cache_schema],
    clock_domains: [clock_domain_schema],
    voltage_domains: [voltage_domain_schema],
    interfaces: [interface_schema], // then would have a controller as an interface, // DDR..DDR5, LPDDR...LPDDR5/5x
    bump_regions: [bump_region_schema], // general functionality
    subcomponents: [mongoose.Mixed],
//    base_clock_frequency: String
});

cache_schema.pre('validate', function() {
    // cache capacities will be stored in KB
    if (this.quantity != undefined) {
        if (this.quantity <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('something went wrong'));
            });
        }
    }
    if (this.associativity != undefined) {
        if (this.associativity <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('something went wrong'));
            });
        }
    }
    if (this.capacity != undefined) {
        if (this.capacity <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('something went wrong'));
            });
        }
    }
    if (this.clock_frequency != undefined) {
        if (this.frequency <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('something went wrong'));
            });
        }
    }
});

chiplet_schema.pre('validate', async function() {
    if (this.area != undefined) {
        // value will be in mm^2
        if (this.area <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have empty, negative chiplet area"));
            });
        }
    }
    if (this.width != undefined) {
        // value will be in mm
        if (this.width <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have empty, negative chiplet width"));
            });
        }
    }
    if (this.height != undefined) {
        // value will be in mm
        if (this.height <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have empty, negative chiplet height"));
            });
        }
    }
    if (this.process_node != undefined) { // process node units will be nm
        const process = Number.parseFloat(this.process_node);
        if (process <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have zero, negative process node"));
            });
        }
    }
    // check that the bump maps don't go outside the chiplet boundary

    const bump_regions = this.bump_regions; // an array

    for (let i = 0; i < bump_regions.length; i++) { // iterate over all the bump regions to produce a unified bump map
        const bump_region = bump_regions[i];
        const offset_x = bump_region.offset[0]; // 2d array of x, y offsets
        const offset_y = bump_region.offset[1]; // 2d array of x, y offsets
        const subbump_map = await SubbumpMap.findById(bump_region.subbump_map_id);
        for (let j = 0; j < subbump_map.bumps.length; j++) { // iterate over all the bumps in this subbump map
            const bump = subbump_map.bumps[j]; // each bump object
            let x_pos = bump.x_pos;
            let y_pos = bump.y_pos;

            if (bump_region.flipped) {
                x_pos = -x_pos;
            }

            if (bump_region.rotation == 90) { // all rotations will be clockwise
                const old_x_pos = x_pos;
                x_pos = -y_pos;
                y_pos = old_x_pos;
            } else if (bump_region.rotation == 180) {
                x_pos = -x_pos;
                y_pos = -y_pos;
            } else if (bump_region.rotation == 270) {
                const old_x_pos = x_pos;
                x_pos = y_pos;
                y_pos = -old_x_pos;
            }

            const x_pos_um = x_pos + 1000*offset_x;
            const y_pos_um = y_pos + 1000*offset_y;
            const x_max = this.width*1000;
            const y_max = this.height*1000;

            if (x_pos_um > x_max || x_pos_um < 0) {
                // throw error
                return new Promise((resolve, reject) => {
                    reject(new Error(`Bump ${bump._id} extends beyond the chiplet width.`));
                });
            } 
            if (y_pos_um > y_max || y_pos_um < 0) {
                // throw error
                return new Promise((resolve, reject) => {
                    reject(new Error(`Bump ${bump._id} extends beyond the chiplet height.`));
                });
            }

        }
    }

    // end of bump verification
    
});

voltage_domain_schema.pre('validate', function() {
    // make sure if a value is specified, it's also specified if its a singular value or a range
    if ((this.operational_v!=undefined || this.min_operational_v!=undefined || this.max_operational_v!=undefined) && this.is_range == undefined) {
        return new Promise((resolve, reject) => {
            reject(new Error("Not specified whether voltage domain takes a single operational voltage or a range of voltages."));
        });
    } else if (this.is_range!=undefined) {
        if (this.is_range) { // if a range has been specified
            this.operational_v = undefined; // only allow one to be active at a time
            if (this.max_operational_v == undefined && this.min_operational_v == undefined) { // both undefined is a problem
                return new Promise((resolve, reject) => {
                    reject(new Error("Operational voltage range is underspecified."));
                });
            } 
            else if (this.max_operational_v != undefined && this.min_operational_v != undefined) {
                if (this.max_operational_v <= 0 || this.min_operational_v <= 0) {
                    return new Promise((resolve, reject) => {
                        reject(new Error("Cannot have zero, negative voltages"));
                    });
                }
                // check logic of max/min
                if (this.max_operational_v <= this.min_operational_v) {
                    return new Promise((resolve, reject) => {
                        reject(new Error("Max operational voltage must be greater than min operational voltage."));
                    });
                }
            } else if (this.max_operational_v != undefined) { // max is defined, min is not
                if (this.max_operational_v <= 0) {
                    return new Promise((resolve, reject) => {
                        reject(new Error("Cannot have zero, negative voltages"));
                    });
                }
            } else { // min is defined, max is not
                if (this.min_operational_v <= 0) {
                    return new Promise((resolve, reject) => {
                        reject(new Error("Cannot have zero, negative voltages"));
                    });
                }
            }
        } else if (!this.is_range) { // if a singular operational voltage has been specified
            this.max_operational_v = undefined;
            this.min_operational_v = undefined;
            if (this.operational_v == undefined) {
                return new Promise((resolve, reject) => {
                    reject(new Error("Must specify an operational voltage."));
                });
            } else { // then the operational voltage is specified, need to check units
                if (this.operational_v <= 0) {
                    return new Promise((resolve, reject) => {
                        reject(new Error("Cannot have zero, negative voltages"));
                    });
                }
            }
        }
    }
});

cpu_schema.pre('validate', function() {
    if (this.clock_frequency != undefined) { 
        if (this.clock_frequency <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have zero, negative clock frequency"));
            });
        }
    }
    if (this.process_node != undefined) { // process node units will be nm
        if (this.process_node <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have zero, negative process node"));
            });
        }
    }
    if (this.max_thermal_design_power != undefined) { // W
        if (this.max_thermal_design_power <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have empty, negative maximum thermal design power"));
            });
        }
    }
});

gpu_schema.pre('validate', function() {
    if (this.clock_frequency != undefined) { 
        if (this.clock_frequency <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have zero, negative clock frequency"));
            });
        }
    }
    if (this.process_node != undefined) { // process node units will be nm
        if (this.process_node <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have zero, negative process node"));
            });
        }
    }
    if (this.max_thermal_design_power != undefined) { // W
        if (this.max_thermal_design_power <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have empty, negative maximum thermal design power"));
            });
        }
    }
});

// hbm_schema.pre('validate', function() {
//     if (this.capacity != undefined) {
//         if (this.capacity <= 0) {
//             return new Promise((resolve, reject) => {
//                 reject(new Error('something went wrong'));
//             });
//         }
//     }
//     if (this.bandwidth != undefined) { // units will be GB/s
//         if (this.bandwidth <= 0) {
//             return new Promise((resolve, reject) => {
//                 reject(new Error('something went wrong'));
//             });
//         }
//     }
// });

memory_schema.pre('validate', function() {
    if (this.capacity != undefined) {
        if (this.capacity <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('something went wrong'));
            });
        }
    }
    if (this.bandwidth != undefined) { // units will be GB/s
        if (this.bandwidth <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('something went wrong'));
            });
        }
    }
});

interface_schema.pre('save', function() {
    for (let i = 0; i < this.protocol.length; i++) { // go over all the protocols in this interface
        protocol_doc = Protocol.findOne({name: (protocol_layer[i])[0]})
        if (protocol_doc == null) {
            (this.protocol_layer[i])[1] = null;
        } else { // you found it
            (this.protocol_layer[i])[1] = protocol_doc._id; // link them via id
        }
    }
    PHY_doc = PHY.findOne({name: this.PHY_layer})
    if (PHY_doc == null) {
        (this.PHY_layer[i])[1] = null;
    } else { // you found it
        (this.PHY_layer[i])[1] = PHY_doc._id; // link them via id
    }
});

// latency: Number, specified for each interface, depends on rx, tx, and connection between them
// interface schema: physical, protocol, bandwidth, latency = null,-1,0, undefined
// here in the protocol section you'd link to the protocol document
// mongomodeler
// the comment has a movie id that tells you which movie it links to

// make up the protocol information
// info to know about protocols: max bandwidth, reach,
            // protocol compatibiltiy document: two different references to protocol collections and a field for whether they are compatible
            // assume that protocols are not compatible if they don't have a protocol compatibility document associated with them
            // exceptions table = a collection
                // each document lists two chiplets that are just not compatible,
                    // which interface on the chiplet are we talking about --> we say that even if the protocols are compatible, then they are still not compatible overall

// first documents = chiplet, has keys that refer to different documents representing protocols
// new collection for protocols
// in chiplet schema, can have a list of protocols associated by id

/* Note "bumps" is a feature of the interfaces, not the chiplet
or rather, the different interfaces dictate what the bump layout of the chiplet look like
so it's really just important to store the collection of them

    // store the footprint of the chiplet and the bump layout
    bumps: {
        pitch: enum: ["mm", "um", "nm"],
        material: {
            type: String,
            enum: ["SnCu", "SnIn", "SnZn", "SnPb", "SnAg", "SnAu", "Au", "SnIn"] // currently these represent the caps
        }
    },
*/

const Chiplet = model('Chiplet', chiplet_schema);
export default Chiplet;
