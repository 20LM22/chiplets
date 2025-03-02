import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const functionality_values_schema = new Schema({
    value: {
        enum: ["accelerator", "compute", "I/O", "DSP", "memory", "GPU", "FPGA", "interface"]
    },
    _id: false
});

// vrm supplies the voltage needed by a cpu, reduce to one operational voltage?
const voltage_domain_schema = new Schema({
    min_v: {
        type: Number,
        min: 0
    },
    max_v: {
        type: Number,
        min: 0
    },
    // operational voltage category
    // boolean to choose between the two
    _id: false
});

const cache_schema = new Schema({
    quantity: Number,
    capacity: {
        value: { // ["8 GB"] --> store as common unit of MB
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["GB", "MB", "KB"]
        },
    },
    associativity: {
        type: Number,
        min: 1
    },
    replacement_policy: String,
    clock_frequency: {
        value: {
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["GHz", "MHz", "Hz"]
        }
    },
    _id: false
});

const interface_schema = new Schema({
    physical_layer: { // serdes?
        type: String,
        enum: ["16x PCIe", "LIPINCON", "UCIe-A", "UCIe-S", "AIB", "MDIO", "LIPINCON", "BoW", "USB", "ethernet", "SATA", "USB4", "PCIe", "DisplayPort"]
    },
    protocol_layer: {
        type: String, // no enum in database, choose from these for the synthetic data, can put these in the matching table, but if new ones come in, only string match
        enum: ["16x PCIe", "LIPINCON", "CXL.io", "CXL.cache", "CXL.mem", "PCIe", "AXI", "SATA", "OpenCAPI", "CCIX"]
    },
    bandwidth: Number, // specified for each interface
});

const cpu_schema = new Schema({ // CPU = compute cluster, compute cluster = CPU clusters
    quantity: Number,
    processor_name: String,
    num_cores: Number,
    clock_frequency: { // not sure i'm breaking this down correctly
        value: {
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["GHz", "MHz", "Hz"]
        }
    },
    l1_cache: [cache_schema],
    _id: false
});

const hbm_schema = new Schema({
    quantity: Number,
    version: {
        enum: ["HBM", "HBM2"]
    },
    capacity: {
        value: {
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["GB", "MB", "KB"]
        }
    },
    controller: { // does it make sense to record the controller? do we really care about the controller or just the bandwidth it provides?
        bandwidth: {
            value: {
                type: Number,
                min: 0
            },
            units: {
                type: String,
                enum: ["GB/s", "MB/s", "KB/s", "Gb/s", "Mb/s", "Kb/s"]
            }
        }
    },
    _id: false
});

const chipletSchema = new Schema({
    area: { // could get more advanced by adding area = width*height check but would require matching units somehow
        value: {
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["cm^2", "mm^2", "um^2", "nm^2"]
        }
    },
    width: {
        value: {
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["cm", "mm", "um", "nm"]
        }
    },
    height: {
        value: {
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["cm", "mm", "um", "nm"]
        }
    },
    process_node: {
        value: {
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["mm", "um", "nm"]
        }
    },
    // bump layout --> pin layout
    // how to organize this?
    // somewhere to store the footprint of the chiplet and the bump layout
    bumps: {
        pitch: {
            value: {
                type: Number,
                min: 0
            },
            units: {
                type: String,
                enum: ["mm", "um", "nm"]
            },
            shape: {
                type: String,
                enum: ["square", "hexagonal"]
            }
        },
        material: { // might need to refine --> split into pillar vs. cap? there was a diagram? relevant because some materials are better for finer pitch, temp. reqs
            type: String,
            enum: ["SnCu", "SnIn", "SnZn", "SnPb", "SnAg", "SnAu", "Au", "SnIn"] // currently these represent the caps
        }
    },
    functionality: { // not sure if we should have this - where do you draw the line between function and component?
        type: [functionality_values_schema]
    },
    // components
    HBMs: [hbm_schema],
    SRAM: Number,
    DRAM: Number,
    DDR: Number,
    FPU: Number,
    GPU: {
        SMs: Number,
        Processing_power: Number,
        Texture_units: Number
    },
    CPUs: [cpu_schema], // can provide an array of different cores, 32 array x 8 or all at once
    // split by the cpu by the manufacturer and type
    L2_caches: [cache_schema],
    L3_caches: [cache_schema],
    base_clock_frequency: { // different chiplets may require a different base clock frequency based on what clock freq. their clock generator can accept
        value: {
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["GHz", "MHz", "Hz"]
        }
    },
    voltage_domains: {
        type: [voltage_domain_schema]
    },
    power_efficiency: {
        value: {
            type: Number,
            min: 0
        },
        units: {
            type: String,
            enum: ["pJ/bit", "nJ/bit", "uJ/bit"]
        },
    },
    // thermal_resistance: Number,
    interfaces: [interface_schema]
    // latency: Number, specified for each interface, depends on rx, tx, and connection between them
    // interface schema
        // physical, protocol, bandwidth, latency = null,-1,0, undefined
            // here in the protocol section you'd link to the protocol document
            // mongomodeler
            // the comment has a movie id that tells you which movie it links to
            // make up the protocol information
                // info to know about protocols: max bandwidth, reach,
            // protocol compatibiltiy document: two different references to protocol collections and a field for whether they are compatible
            // assume that protocols are not compatible if they don't have a protocol compatibility document associated with them
            // exceptions table = a collection
                // each document lists two chiplets that are just not compatible,
                    // could list their protocols as well
                    // which interface on the chiplet are we talking about --> we say that even if the protocols are compatible, then they are still not compatible overall

});

const Chiplet = model('Chiplet', chipletSchema);
export default Chiplet;

// first documents = chiplet, has keys that refer to different documents representing protocols
// new collection for protocols
// in chiplet schema, can have a list of protocols associated by id
