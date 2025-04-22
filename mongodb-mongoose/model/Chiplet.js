import mongoose from 'mongoose';
import Int32 from 'mongoose-int32';
import SubbumpMap from './SubbumpMap.js';
import Protocol from './Protocol.js';
import PHY from './PHY.js';
const { Schema, model } = mongoose;

const voltage_domain_schema = new Schema({
    operational_v: Number,
    min_operational_v: Number,
    max_operational_v: Number,
    is_range: Boolean,
    _id: false
});

const clock_domain_schema = new Schema({
    operational_freq: Number,
    min_operational_freq: Number,
    max_operational_freq: Number,
    is_range: Boolean,
    _id: false
});

const cache_schema = new Schema({
    quantity: Int32,
    capacity: Number,
    associativity: Int32,
    bandwidth: Number,
    replacement_policy: String,
    _id: false
});

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
    substructure: mongoose.Mixed,
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
    gflops: Number,
    tops: Number,
    substructure: mongoose.Mixed, // user free to design subschema that makes sense for that gpu
    _id: false
});

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
});

cache_schema.pre('validate', function() {
    // cache capacities will be stored in KB
    if (this.quantity != undefined) {
        if (this.quantity <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('Cache count cannot be zero'));
            });
        }
    }
    if (this.associativity != undefined) {
        if (this.associativity <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('Cache associativity must be positive integer.'));
            });
        }
    }
    if (this.capacity != undefined) {
        if (this.capacity <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('Cache capacity cannot be zero, negative.'));
            });
        }
    }
    if (this.clock_frequency != undefined) {
        if (this.frequency <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('Cache clock frequency cannot be zero, negative.'));
            });
        }
    }
});

bump_region_schema.pre('validate', async function() {
    const subbump_map = await SubbumpMap.findById(this.subbump_map_id);
    if (subbump_map == null || subbump_map == undefined || subbump_map.length == 0) {
        // error
        return new Promise((resolve, reject) => {
            reject(new Error(`Subbump map with id ${this.subbump_map_id} does not exist in subbump map collection.`));
        });
    }

    if (this.rotation == undefined) {
        this.set('rotation', 0);
    } 
    
    if (this.flipped == undefined) {
        this.set('flipped', false);
    }

    if (this.offset == undefined) {
        this.set('offset', [0,0]);
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
        if (this.process <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error("Cannot have zero, negative process node"));
            });
        }
    }

    // // check that the bump maps don't go outside the chiplet boundary
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
  
});

voltage_domain_schema.pre('validate', function() {

    // make sure if a value is specified, it's also specified if its a singular value or a range
    if ((this.operational_v!=undefined || this.min_operational_v!=undefined || this.max_operational_v!=undefined) && this.is_range == undefined) {
        return new Promise((resolve, reject) => {
            reject(new Error("Not specified whether voltage domain takes a single operational voltage or a range of voltages."));
        });
    } else if (this.is_range!=undefined) {
        if (this.is_range) { // if a range has been specified
            this.set('operational_v', undefined); // only allow one to be active at a time
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
            this.set('max_operational_v', undefined);
            this.set('min_operational_v', undefined);
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

memory_schema.pre('validate', function() {
    if (this.capacity != undefined) {
        if (this.capacity <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('Memory capacity cannot be zero, negative.'));
            });
        }
    }
    if (this.bandwidth != undefined) { // units will be GB/s
        if (this.bandwidth <= 0) {
            return new Promise((resolve, reject) => {
                reject(new Error('Memory bandwidth cannot be zero, negative.'));
            });
        }
    }
});

interface_schema.pre('validate', async function() {
    for (let i = 0; i < this.protocol_layer.length; i++) { // go over all the protocols in this interface
        const protocol_doc = await Protocol.findOne({name: this.protocol_layer[i][0]}).exec();
        if (protocol_doc != undefined) {
            const new_val = this.protocol_layer;
            new_val[i] = [this.protocol_layer[i][0], protocol_doc._id];
            this.set('protocol_layer', new_val);
        }
    }
    const PHY_doc = await PHY.findOne({name: this.physical_layer}).exec();
    if (PHY_doc != undefined) {
        const new_val = [this.physical_layer[0], PHY_doc._id];
        this.set('physical_layer', new_val);
    }

});

const Chiplet = model('Chiplet', chiplet_schema);
export default Chiplet;
