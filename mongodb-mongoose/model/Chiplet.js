import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const voltage_domain_schema = new Schema({
    // should there be a way to attach a particular voltage domain to a certain component?
    // for example, link a voltage domain to a ddr document
    operational_v: String,
    min_operational_v: String,
    max_operational_v: String,
    is_range: Boolean, // boolean to choose between whether this is a range or a single value
    _id: false
});

const clock_domain_schema = new Schema({
    // should there be a way to attach a particular voltage domain to a certain component?
    // for example, link a voltage domain to a ddr document
    operational_freq: String,
    min_operational_freq: String,
    max_operational_freq: String,
    is_range: Boolean, // boolean to choose between whether this is a range or a single value
    _id: false
});

const cache_schema = new Schema({
    quantity: {
        type: Number,
        min: 0
    },
    capacity: String,
    associativity: {
        type: Number,
        min: 0
    },
    replacement_policy: String,
    clock_frequency: String,
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
    offset: [Number, Number], // need to be strings
    rotation: Number,
    flipped: Boolean,
    _id: false
});

const interface_schema = new Schema({
    physical_layer: [String, String], // enum: ["16x PCIe", "LIPINCON", "UCIe-A", "UCIe-S", "AIB", "MDIO", "LIPINCON", "BoW", "USB", "ethernet", "SATA", "USB4", "PCIe", "DisplayPort"]
    protocol_layer: { // enum: ["16x PCIe", "LIPINCON", "CXL.io", "CXL.cache", "CXL.mem", "PCIe", "AXI", "SATA", "OpenCAPI", "CCIX"]
        type: [[String, String]] // the first field is for the protocol layer name and the second field is for the protocol layer id
    },
    bump_region: bump_region_schema,
    _id: false
});

const cpu_schema = new Schema({ // CPU = compute cluster, compute cluster = CPU clusters
    quantity: {
        type: Number,
        min: 0 // should these be 0?
    },
    manufacturer: String,
    processor_name: String,
    num_cores: {
        type: Number,
        min: 0
    },
    clock_frequency: String,
    process_node: String,
    max_thermal_design_power: String,
    l1_i_cache: [cache_schema],
    l1_d_cache: [cache_schema],
    l2_cache: [cache_schema],
    l3_cache: [cache_schema],
    _id: false
});

const gpu_schema = new Schema({ // CPU = compute cluster, compute cluster = CPU clusters
    quantity: {
        type: Number,
        min: 0
    },
    manufacturer: String,
    processor_name: String,
    clock_frequency: String,
    process_node: String,
    max_thermal_design_power: String,
    // should i enforce any conditional rules among the following 4 attributes?
    gpcs: {
        type: Number,
        min: 0
    },
    tpcs_per_gpc: {
        type: Number,
        min: 0
    },
    sms_per_tpc: {
        type: Number,
        min: 0
    },
    cores_per_sm: {
        type: Number,
        min: 0
    },
    l1_i_cache_per_core: [cache_schema],
    l1_d_cache_per_core: [cache_schema],
    l2_cache_per_sm: [cache_schema],
    l3_cache: [cache_schema],
    _id: false
});

const hbm_schema = new Schema({
    quantity: {
        type: Number,
        min: 0
    },
    version: String, // HBM, HBM2, HBM3
    capacity: String,
    bandwidth: String, // enum: ["GB/s", "MB/s", "KB/s", "Gb/s", "Mb/s", "Kb/s"]
    _id: false
});

const memory_schema = new Schema({
    quantity: {
        type: Number,
        min: 0
    },
    capacity: String,
    bandwidth: String,
    _id: false
});

const ddr_schema = new Schema({
    quantity: {
        type: Number,
        min: 0
    },
    version: String, // DDR..DDR5, LPDDR...LPDDR5/5x
    capacity: String,
    bandwidth: String,
    _id: false
});

const chiplet_schema = new Schema({
    _id: String,
    area: String,
    width: String,
    height: String,
    process_node: String,
    functionality: [String],
    HBMs: [hbm_schema], // then would have a controller as an interface
    SRAMs: [memory_schema],
    DRAMs: [memory_schema],
    DDRs: [ddr_schema], // then would have a controller as an interface
    GPUs: [gpu_schema],
    CPUs: [cpu_schema],
    L2_caches: [cache_schema],
    L3_caches: [cache_schema],
    voltage_domains: [voltage_domain_schema],
    interfaces: [interface_schema],
    base_clock_frequency: String
});

const Chiplet = model('Chiplet', chiplet_schema);
export default Chiplet;
/*
cache_schema.pre('validate', function(next){
    // cache capacities will be stored in KB
    if (this.capacity != undefined) {
        const capacity = Number.parseFloat(this.capacity); // get the value out
        if (capacity <= 0) {
            const err = new Error("Cannot have empty, negative cache capacity");
            next(err);
        }
        if (this.capacity.match(/mb/i) != null || this.capacity.match(/megabytes/i) != null) {
            // then the capacity was given in MB
            // need to multiply value by 1e3
            this.capacity = capacity * 1e3;
        } else if (this.capacity.match(/gb/i) != null || this.capacity.match(/gigabytes/i) != null) {
            // then the capacity was given in GB
            // need to multiple value by 1e6
            this.capacity = capacity * 1e6;
        } else if (this.capacity.match(/kb/i) != null || this.capacity.match(/kilobytes/i) != null) {
            this.capacity = capacity;
        } else {
            // then no matches for mb, gb, or kb were found
            // could not match the units, need to throw an error
            const err = new Error("Capacity not specified in known units: MB, GB, or KB");
            next(err);
        }
    }
    if (this.clock_frequency != undefined) {
        const frequency = Number.parseFloat(this.clock_frequency); // get the value out
        if (frequency <= 0) {
            const err = new Error("Cannot have empty, negative cache capacity");
            next(err);
        }
        if (this.clock_frequency.match(/mhz/i) != null || this.clock_frequency.match(/megahertz/i) != null) {
            // then clock frequency was given in MHz
            // need to multiply value by 1e-3
            this.clock_frequency = frequency * 1e-3;
        } else if (this.clock_frequency.match(/ghz/i) != null || this.clock_frequency.match(/gigahertz/i) != null) {
            this.clock_frequency = frequency;
        } else {
            // then no matches for either mhz or ghz were found
            // could not match the units, need to throw an error
            const err = new Error("Clock frequency not specified in known units: MHz or GHz");
            next(err);
        }
    }
    // clock frequencies will be stored in GHz
    next();
});

voltage_domain_schema.pre('validate', function(next) {
    // make sure if a value is specified, it's also specified if its a singular value or a range
    if ((this.operational_v!=undefined || this.min_operational_v!=undefined || this.max_operational_v!=undefined) && this.is_range == undefined) {
        const err = new Error("Not specified whether voltage domain takes a single operational voltage or a range of voltages.");
        next(err);
    } else if (this.is_range!=undefined) {
        if (this.is_range) { // if a range has been specified
            this.operational_v = undefined; // only allow one to be active at a time
            if (this.max_operational_v == undefined && this.min_operational_v == undefined) { // both undefined is a problem
                const err = new Error("Operational voltage range is underspecified.");
                next(err);
            } 
            else if (this.max_operational_v != undefined && this.min_operational_v != undefined) {
                // both are specified, need to parse the values and check their units
                const max_v = Number.parseFloat(this.max_operational_v); // get the value out
                const min_v = Number.parseFloat(this.min_operational_v); // get the value out
                if (max_v <= 0 || min_v <= 0) {
                    const err = new Error("Cannot have zero, negative voltages");
                    next(err);
                }
                // match max units
                if (this.max_v.match(/v/i) != null || this.max_v.match(/volts/i) != null) {
                    this.max_operational_v = max_v;
                } else if (this.max_v.match(/mv/i) != null || this.max_v.match(/millivolts/i) != null) {
                    this.max_operational_v = max_v * 1e-3;
                } else {
                    // could not match the units, need to throw an error
                    const err = new Error("Max voltage not specified in known units: V or mV");
                    next(err);
                }
                // match min units
                if (this.min_v.match(/v/i) != null || this.min_v.match(/volts/i) != null) {
                    this.min_operational_v = min_v;
                } else if (this.min_v.match(/mv/i) != null || this.min_v.match(/millivolts/i) != null) {
                    this.min_operational_v = min_v * 1e-3;
                } else {
                    // could not match the units, need to throw an error
                    const err = new Error("Min voltage not specified in known units: V or mV");
                    next(err);
                }
                // check logic of max/min
                if (this.max_operational_v <= this.min_operational_v) {
                    const err = new Error("Max operational voltage must be greater than min operational voltage.");
                    next(err);
                }
            } else if (this.max_operational_v != undefined) { // max is defined, min is not
                const max_v = Number.parseFloat(this.max_operational_v); // get the value out
                if (max_v <= 0) {
                    const err = new Error("Cannot have zero, negative voltages");
                    next(err);
                }
                // match max units
                if (this.max_v.match(/v/i) != null || this.max_v.match(/volts/i) != null) {
                    this.max_operational_v = max_v;
                } else if (this.max_v.match(/mv/i) != null || this.max_v.match(/millivolts/i) != null) {
                    this.max_operational_v = max_v * 1e-3;
                } else {
                    // could not match the units, need to throw an error
                    const err = new Error("Max voltage not specified in known units: V or mV");
                    next(err);
                }
            } else { // min is defined, max is not
                const min_v = Number.parseFloat(this.min_operational_v); // get the value out
                if (min_v <= 0) {
                    const err = new Error("Cannot have zero, negative voltages");
                    next(err);
                }
                if (this.min_v.match(/v/i) != null || this.min_v.match(/volts/i) != null) {
                    this.min_operational_v = min_v;
                } else if (this.min_v.match(/mv/i) != null || this.min_v.match(/millivolts/i) != null) {
                    this.min_operational_v = min_v * 1e-3;
                } else {
                    // could not match the units, need to throw an error
                    const err = new Error("Min voltage not specified in known units: V or mV");
                    next(err);
                }
            }
        } else if (!this.is_range) { // if a singular operational voltage has been specified
            this.max_operational_v = undefined;
            this.min_operational_v = undefined;
            if (this.operational_v == undefined) {
                const err = new Error("Must specify an operational voltage.");
                next(err);
            } else { // then the operational voltage is specified, need to check units
                const op_v = Number.parseFloat(this.operational_v); // get the value out
                if (op_v <= 0) {
                    const err = new Error("Cannot have zero, negative voltage");
                    next(err);
                }
                if (this.op_v.match(/v/i) != null || this.op_v.match(/volts/i) != null) {
                    this.operational_v = op_v;
                } else if (this.op_v.match(/mv/i) != null || this.clock_frequency.match(/millivolts/i) != null) {
                    this.operational_v = op_v * 1e-3;
                } else {
                    // could not match the units, need to throw an error
                    const err = new Error("Voltage not specified in known units: V or mV");
                    next(err);
                }
            }
        }
    }
    next();
});

cpu_schema.pre('validate', function(next) {
    if (this.clock_frequency != undefined) {
        const frequency = Number.parseFloat(this.clock_frequency); // get the value out
        if (frequency <= 0) {
            const err = new Error("Cannot have empty, negative clock frequency");
            next(err);
        }
        if (this.clock_frequency.match(/mhz/i) != null || this.clock_frequency.match(/megahertz/i) != null) {
            // then clock frequency was given in MHz
            // need to multiply value by 1e-3
            this.clock_frequency = frequency * 1e-3;
        } else if (this.clock_frequency.match(/ghz/i) != null || this.clock_frequency.match(/gigahertz/i) != null) {
            this.clock_frequency = frequency;
        } else {
            // then no matches for either mhz or ghz were found
            // could not match the units, need to throw an error
            const err = new Error("Clock frequency not specified in known units: MHz or GHz");
            next(err);
        }
    }
    if (this.process_node != undefined) { // process node units will be nm
        const process = Number.parseFloat(this.process_node);
        if (process <= 0) {
            const err = new Error("Cannot have zero, negative process node");
            next(err);
        }
        if (this.process_node.match(/nm/i) != null || this.process_node.match(/nanometers/i) != null) {
            this.process_node = process;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Process node not specified in known units: nm");
            next(err);
        }
    }
    if (this.max_thermal_design_power != undefined) {
        const tdp = Number.parseFloat(this.max_thermal_design_power); // get the value out
        if (tdp <= 0) {
            const err = new Error("Cannot have empty, negative maximum thermal design power");
            next(err);
        }
        if (this.max_thermal_design_power.match(/w/i) != null || this.max_thermal_design_power.match(/watts/i) != null) {
            this.max_thermal_design_power = tdp;
        } else if (this.max_thermal_design_power.match(/mw/i) != null || this.max_thermal_design_power.match(/milliwatts/i) != null) {
            this.max_thermal_design_power = tdp * 1e-3;
        } else {
            // then no matches for either mhz or ghz were found
            // could not match the units, need to throw an error
            const err = new Error("Max thermal design power not specified in known units: W, mW");
            next(err);
        }
    }
    // clock frequencies will be stored in GHz
    next();
});

gpu_schema.pre('validate', function(next) {
    if (this.clock_frequency != undefined) {
        const frequency = Number.parseFloat(this.clock_frequency); // get the value out
        if (frequency <= 0) {
            const err = new Error("Cannot have empty, negative clock frequency");
            next(err);
        }
        if (this.clock_frequency.match(/mhz/i) != null || this.clock_frequency.match(/megahertz/i) != null) {
            // then clock frequency was given in MHz
            // need to multiply value by 1e-3
            this.clock_frequency = frequency * 1e-3;
        } else if (this.clock_frequency.match(/ghz/i) != null || this.clock_frequency.match(/gigahertz/i) != null) {
            this.clock_frequency = frequency;
        } else {
            // then no matches for either mhz or ghz were found
            // could not match the units, need to throw an error
            const err = new Error("Clock frequency not specified in known units: MHz or GHz");
            next(err);
        }
    }
    if (this.process_node != undefined) { // process node units will be nm
        const process = Number.parseFloat(this.process_node);
        if (process <= 0) {
            const err = new Error("Cannot have zero, negative process node");
            next(err);
        }
        if (this.process_node.match(/nm/i) != null || this.process_node.match(/nanometers/i) != null) {
            this.process_node = process;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Process node not specified in known units: nm");
            next(err);
        }
    }
    if (this.max_thermal_design_power != undefined) {
        const tdp = Number.parseFloat(this.max_thermal_design_power); // get the value out
        if (tdp <= 0) {
            const err = new Error("Cannot have empty, negative maximum thermal design power");
            next(err);
        }
        if (this.max_thermal_design_power.match(/w/i) != null || this.max_thermal_design_power.match(/watts/i) != null) {
            this.max_thermal_design_power = tdp;
        } else if (this.max_thermal_design_power.match(/mw/i) != null || this.max_thermal_design_power.match(/milliwatts/i) != null) {
            this.max_thermal_design_power = tdp * 1e-3;
        } else {
            // then no matches for either mhz or ghz were found
            // could not match the units, need to throw an error
            const err = new Error("Max thermal design power not specified in known units: W, mW");
            next(err);
        }
    }
    next();
});

hbm_schema.pre('validate', function(next) {
    if (this.capacity != undefined) {
        const capacity = Number.parseFloat(this.capacity); // units will be GB
        if (capacity <= 0) {
            const err = new Error("Cannot have empty, negative HBM capacity");
            next(err);
        }
        if (this.capacity.match(/tb/i) != null || this.capacity.match(/terabytes/i) != null) {
            this.capacity = capacity * 1e3;
        } else if (this.capacity.match(/mb/i) != null || this.capacity.match(/megabytes/i) != null) {
            this.capacity = capacity * 1e-3;
        } else if (this.capacity.match(/kb/i) != null || this.capacity.match(/kilobytes/i) != null) {
            this.capacity = capacity * 1e-6;
        } else if (this.capacity.match(/gb/i) != null || this.capacity.match(/gigabytes/i) != null) {
            this.capacity = capacity;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Capacity not specified in known units: TB, MB, GB, or KB");
            next(err);
        }
    }
    if (this.bandwidth != undefined) {
        const bw = Number.parseFloat(this.bandwidth); // units will be GB/s
        if (bw <= 0) {
            const err = new Error("Cannot have zero, negative bandwidth");
            next(err);
        }
        if (this.bandwidth.match(/GBps/) != null || this.bandwidth.match(/GB\/ps/) != null || this.bandwidth.match(/Gbyte\/ps/) != null) {
            this.bandwidth = bw;
        } else if (this.bandwidth.match(/MBps/) != null || this.bandwidth.match(/MB\/ps/) != null || this.bandwidth.match(/Mbyte\/ps/) != null) {
            this.bandwidth = bw * 1e-3;
        } else if (this.bandwidth.match(/KBps/) != null || this.bandwidth.match(/KB\/ps/) != null || this.bandwidth.match(/Kbyte\/ps/) != null) {
            this.bandwidth = bw * 1e-6;
        } else if (this.bandwidth.match(/Gbps/) != null || this.bandwidth.match(/Gb\/ps/) != null || this.bandwidth.match(/Gbit\/ps/) != null) {
            this.bandwidth = bw * 0.125;
        } else if (this.bandwidth.match(/Mbps/) != null || this.bandwidth.match(/Mb\/ps/) != null || this.bandwidth.match(/Mbit\/ps/) != null) {
            this.bandwidth = bw * 1e-3 * 0.125;
        } else if (this.bandwidth.match(/Kbps/) != null || this.bandwidth.match(/Kb\/ps/) != null || this.bandwidth.match(/Kbit\/ps/) != null) {
            this.bandwidth = bw * 1e-6 * 0.125;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Bandwidth not specified in known units: GB/s, MB/s, KB/s, Gb/s, Mb/s, Kb/s");
            next(err);
        }
    }
});

memory_schema.pre('validate', function(next) {
    if (this.capacity != undefined) {
        const capacity = Number.parseFloat(this.capacity); // units will be GB
        if (capacity <= 0) {
            const err = new Error("Cannot have empty, negative HBM capacity");
            next(err);
        }
        if (this.capacity.match(/tb/i) != null || this.capacity.match(/terabytes/i) != null) {
            this.capacity = capacity * 1e3;
        } else if (this.capacity.match(/mb/i) != null || this.capacity.match(/megabytes/i) != null) {
            this.capacity = capacity * 1e-3;
        } else if (this.capacity.match(/kb/i) != null || this.capacity.match(/kilobytes/i) != null) {
            this.capacity = capacity * 1e-6;
        } else if (this.capacity.match(/gb/i) != null || this.capacity.match(/gigabytes/i) != null) {
            this.capacity = capacity;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Capacity not specified in known units: TB, MB, GB, or KB");
            next(err);
        }
    }
    if (this.bandwidth != undefined) {
        const bw = Number.parseFloat(this.bandwidth); // units will be GB/s
        if (bw <= 0) {
            const err = new Error("Cannot have zero, negative bandwidth");
            next(err);
        }
        if (this.bandwidth.match(/GBps/) != null || this.bandwidth.match(/GB\/ps/) != null || this.bandwidth.match(/Gbyte\/ps/) != null) {
            this.bandwidth = bw;
        } else if (this.bandwidth.match(/MBps/) != null || this.bandwidth.match(/MB\/ps/) != null || this.bandwidth.match(/Mbyte\/ps/) != null) {
            this.bandwidth = bw * 1e-3;
        } else if (this.bandwidth.match(/KBps/) != null || this.bandwidth.match(/KB\/ps/) != null || this.bandwidth.match(/Kbyte\/ps/) != null) {
            this.bandwidth = bw * 1e-6;
        } else if (this.bandwidth.match(/Gbps/) != null || this.bandwidth.match(/Gb\/ps/) != null || this.bandwidth.match(/Gbit\/ps/) != null) {
            this.bandwidth = bw * 0.125;
        } else if (this.bandwidth.match(/Mbps/) != null || this.bandwidth.match(/Mb\/ps/) != null || this.bandwidth.match(/Mbit\/ps/) != null) {
            this.bandwidth = bw * 1e-3 * 0.125;
        } else if (this.bandwidth.match(/Kbps/) != null || this.bandwidth.match(/Kb\/ps/) != null || this.bandwidth.match(/Kbit\/ps/) != null) {
            this.bandwidth = bw * 1e-6 * 0.125;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Bandwidth not specified in known units: GB/s, MB/s, KB/s, Gb/s, Mb/s, Kb/s");
            next(err);
        }
    }
});

ddr_schema.pre('validate', function(next) {
    if (this.capacity != undefined) {
        const capacity = Number.parseFloat(this.capacity); // units will be GB
        if (capacity <= 0) {
            const err = new Error("Cannot have empty, negative HBM capacity");
            next(err);
        }
        if (this.capacity.match(/tb/i) != null || this.capacity.match(/terabytes/i) != null) {
            this.capacity = capacity * 1e3;
        } else if (this.capacity.match(/mb/i) != null || this.capacity.match(/megabytes/i) != null) {
            this.capacity = capacity * 1e-3;
        } else if (this.capacity.match(/kb/i) != null || this.capacity.match(/kilobytes/i) != null) {
            this.capacity = capacity * 1e-6;
        } else if (this.capacity.match(/gb/i) != null || this.capacity.match(/gigabytes/i) != null) {
            this.capacity = capacity;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Capacity not specified in known units: TB, MB, GB, or KB");
            next(err);
        }
    }
    if (this.bandwidth != undefined) {
        const bw = Number.parseFloat(this.bandwidth); // units will be GB/s
        if (bw <= 0) {
            const err = new Error("Cannot have zero, negative bandwidth");
            next(err);
        }
        if (this.bandwidth.match(/GBps/) != null || this.bandwidth.match(/GB\/ps/) != null || this.bandwidth.match(/Gbyte\/ps/) != null) {
            this.bandwidth = bw;
        } else if (this.bandwidth.match(/MBps/) != null || this.bandwidth.match(/MB\/ps/) != null || this.bandwidth.match(/Mbyte\/ps/) != null) {
            this.bandwidth = bw * 1e-3;
        } else if (this.bandwidth.match(/KBps/) != null || this.bandwidth.match(/KB\/ps/) != null || this.bandwidth.match(/Kbyte\/ps/) != null) {
            this.bandwidth = bw * 1e-6;
        } else if (this.bandwidth.match(/Gbps/) != null || this.bandwidth.match(/Gb\/ps/) != null || this.bandwidth.match(/Gbit\/ps/) != null) {
            this.bandwidth = bw * 0.125;
        } else if (this.bandwidth.match(/Mbps/) != null || this.bandwidth.match(/Mb\/ps/) != null || this.bandwidth.match(/Mbit\/ps/) != null) {
            this.bandwidth = bw * 1e-3 * 0.125;
        } else if (this.bandwidth.match(/Kbps/) != null || this.bandwidth.match(/Kb\/ps/) != null || this.bandwidth.match(/Kbit\/ps/) != null) {
            this.bandwidth = bw * 1e-6 * 0.125;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Bandwidth not specified in known units: GB/s, MB/s, KB/s, Gb/s, Mb/s, Kb/s");
            next(err);
        }
    }
});

chiplet_schema.pre('validate', function(next) {
    if (this.area != undefined) {
        const area = Number.parseFloat(this.area); // value will be in mm^2
        if (area <= 0) {
            const err = new Error("Cannot have empty, negative chiplet area");
            next(err);
        }
        if (this.area.match(/mm\^2/i) != null) {
            this.area = area;
        } else if (this.area.match(/cm\^2/i) != null) {
            this.area = area * 100;
        } else if (this.area.match(/um\^2/i) != null) {
            this.area = area * 1e-6;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Area not specified in known units: cm^2, mm^2, um^2");
            next(err);
        }
    }
    if (this.width != undefined) {
        const width = Number.parseFloat(this.width); // value will be in mm
        if (width <= 0) {
            const err = new Error("Cannot have empty, negative chiplet width");
            next(err);
        }
        if (this.width.match(/mm/i) != null) {
            this.width = width;
        } else if (this.width.match(/cm/i) != null) {
            this.width = width * 10;
        } else if (this.width.match(/um/i) != null) {
            this.width = width * 1e-3;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Width not specified in known units: cm, mm, um");
            next(err);
        }
    }
    if (this.height != undefined) {
        const height = Number.parseFloat(this.height); // value will be in mm
        if (height <= 0) {
            const err = new Error("Cannot have empty, negative chiplet height");
            next(err);
        }
        if (this.height.match(/mm/i) != null) {
            this.height = height;
        } else if (this.height.match(/cm/i) != null) {
            this.height = height * 10;
        } else if (this.height.match(/um/i) != null) {
            this.height = height * 1e-3;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Height not specified in known units: cm, mm, um");
            next(err);
        }
    }
    if (this.process_node != undefined) { // process node units will be nm
        const process = Number.parseFloat(this.process_node);
        if (process <= 0) {
            const err = new Error("Cannot have zero, negative process node");
            next(err);
        }
        if (this.process_node.match(/nm/i) != null || this.process_node.match(/nanometers/i) != null) {
            this.process_node = process;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Chiplet process node not specified in known units: nm");
            next(err);
        }
    }
});
*/

/* interface_schema.pre('save', function(next) {
    for (let i = 0; i < this.protocol_layer.length; i++) {
        protocol_doc = Protocol.findOne({name: protocol_layer[i]})
        if (protocol_doc == null) {
            this.protocol_layer[i][1] = null;
        } else { // you found it
            this.protocol_layer[i][1] = protocol_doc._id; // link them via id
        }
    }
    PHY_doc = PHY.findOne({name: this.PHY_layer})
    if (PHY_doc == null) {
        this.PHY_layer[i][1] = null;
    } else { // you found it
        this.PHY_layer[i][1] = PHY_doc._id; // link them via id
    }
}); */

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
