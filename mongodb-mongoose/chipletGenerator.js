import { faker } from '@faker-js/faker';
import Chiplet from './model/Chiplet.js';
import mongoose from 'mongoose';

export function generate_epyc_iod_chiplet() {
    const width = 4; // mm
    const height = 11; // mm
    const bump_pitch = 55;
    const subbump_width = 39;
    const subbump_height = 3;

    // generate synthetic bump maps
    const num_interfaces = 8;
    const bump_regions = [];

    for (let i = 0; i < 8; i++) { // 8 connections to CCD dies
        let x_offset =  (i == 0 || i == 1 || i == 2 || i == 3) ? bump_pitch/1000 : width - bump_pitch/1000;
        let y_offset =  i == 0 ? bump_pitch/1000 + (bump_pitch*subbump_width)/1000: // (bump_pitch*subbump_width)/1000 :
                        i == 1 ? bump_pitch/1000 + 2*(bump_pitch*subbump_width)/1000 + 0.20 : 
                        i == 2 ? height - 0.20 - (bump_pitch*subbump_width)/1000 - bump_pitch/1000 : 
                        i == 3 ? height - bump_pitch/1000 :
                        i == 4 ? bump_pitch/1000 :
                        i == 5 ? bump_pitch/1000 + 0.20 + (bump_pitch*subbump_width)/1000 :
                        i == 6 ? height - 0.20 - 2*(bump_pitch*subbump_width)/1000 - bump_pitch/1000 :
                        height - bump_pitch/1000 - (bump_pitch*subbump_width)/1000;
        let rotation = (i == 0 || i == 1 || i == 2 || i == 3) ? 270 : 90;
        let flipped = false;   
        let b = {
            subbump_map_id: "BoW_32-55bp-15dia-rect-full-bi-example", // (i == 0 || i == 1 || i == 6 || i == 7) ? "BoW_32-150bp-20dia-hex-full-bi-example" : "BoW_32-150bp-10dia-hex-full-bi-example",
            offset: [x_offset, y_offset],
            rotation: rotation,
            flipped: flipped,
            _id: faker.string.uuid()
        };
        bump_regions.push(b);              
    }

    // bumps for IO devices
    const bump_pitch_io = 50;
    for (let i = 0; i < 8; i++) { // 8 connections to CCD dies
        let x_offset =  i == 0 ? ((width*1000 - (bump_pitch_io*subbump_width))/2)/1000 :
                        i == 1 ? ((width*1000 - (bump_pitch_io*subbump_width))/2)/1000 :
                        i == 2 ? bump_pitch_io/1000 + 0.5 : 
                        i == 3 ? (bump_pitch_io + bump_pitch_io*subbump_height)/1000 + 0.5 :
                        i == 4 ? width - ((bump_pitch_io + bump_pitch_io*subbump_height)/1000) - 0.5 :
                        i == 5 ? width - (bump_pitch_io/1000) - 0.5 :
                        i == 6 ? width - (((width*1000 - (bump_pitch_io*subbump_width))/2)/1000) :
                        width - (((width*1000 - (bump_pitch_io*subbump_width))/2)/1000);        
        let y_offset =  i == 0 ? bump_pitch_io/1000 :
                        i == 1 ? (bump_pitch_io + bump_pitch_io*subbump_height)/1000 :
                        i == 2 ? (((height*1000 - (bump_pitch_io*subbump_width))/2)/1000) + bump_pitch_io*subbump_width/1000 - 0.2 :
                        i == 3 ? (((height*1000 - (bump_pitch_io*subbump_width))/2)/1000) + bump_pitch_io*subbump_width/1000 - 0.2 :
                        i == 4 ? (((height*1000 - (bump_pitch_io*subbump_width))/2)/1000) + 0.2 :
                        i == 5 ? (((height*1000 - (bump_pitch_io*subbump_width))/2)/1000) + 0.2 :
                        i == 6 ? height - (bump_pitch_io + bump_pitch_io*subbump_height)/1000 :
                        height - bump_pitch_io/1000;
        let rotation = (i == 0 || i == 1) ? 0 :
                        (i == 2 || i == 3) ? 270 :
                        (i == 4 || i == 5) ? 90 :
                        180;
        let flipped = false;   
        let b = {
            subbump_map_id: (i == 0 || i == 1 || i == 6 || i == 7) ? "BoW_32-50bp-10dia-rect-hex-bi-example" : "BoW_32-40bp-20dia-hex-rect-bi-example",
            offset: [x_offset, y_offset],
            rotation: rotation,
            flipped: flipped,
            _id: faker.string.uuid()
        };
        bump_regions.push(b);              
    }

    // interfaces
    const interfaces = [];
    let interface_ids = ["ul1", "ul2", "bl1", "bl2", "ur1", "ur2", "br1", "br2"];
    for (let i = 0; i < num_interfaces; i++) {
        const f = {
            physical_layer: ["BoW-32", ""],
            protocol_layer: [["CXL.cache 1.0", ""]],
            bump_region: (bump_regions[i])["_id"], // generate them in order, then match them up
            _id: interface_ids[i]
        };
        interfaces.push(f);
    }
    // IO 
    interface_ids = ["pcie64_1", "pcie64_2", "pcie128_3", "pcie128_4", "pcie128_5", "pcie128_6", "pcie64_7", "pcie64_8"];
    for (let i = 0; i < num_interfaces; i++) {
        let f = {};
        if (i == 0 || i == 1 || i == 6 || i == 7) {
            f = {
                physical_layer:  ["BoW-32", ""],
                protocol_layer: [["PCIe 4 x64", ""]],
                bump_region: (bump_regions[i])["_id"], // generate them in order, then match them up
                _id: interface_ids[i]
            };
        } else {
            f = {
                physical_layer:  ["BoW-32", ""],
                protocol_layer: [["PCIe 4 x128", ""]],
                bump_region: (bump_regions[i])["_id"], // generate them in order, then match them up
                _id: interface_ids[i]
            };
        }
        interfaces.push(f);
    }

    const synthetic_iod_chiplet = new Chiplet({
        _id: "EPYC_IOD",
        name: "EPYC IOD",
        manufacturer: "AMD",
        width: 4,
        height: 11,
        area: 44,
        interfaces: interfaces,
        bump_regions: bump_regions,
        process_node: 11,  
        functionality: ["IO"],
        clock_domains: [ {
            operational_freq: 1.46,
            is_range: false
            },
            {
            operational_freq: 1.0,
            is_range: false
        }], 
        voltage_domains: [ {
            min_operational_v: 0.75,
            max_operational_v: 1.4,
            is_range: true
        }],   
    });

    return synthetic_iod_chiplet;
};

export function generate_epyc_ccd_chiplet() {
    const width = 3;
    const height = 4.5; // mm
    const bump_pitch = 50;
    const subbump_width = 39;

    // generate synthetic bump maps
    const num_interfaces = 2;
    const bump_regions = [];

    for (let i = 0; i < num_interfaces; i++) {
        let x_offset = bump_pitch/1000;
        let y_offset = i == 0 ? (((((height*1000)/2) - (bump_pitch*subbump_width))/2) + (bump_pitch*subbump_width))/1000 :
                       ((height*1000) - ((((height*1000)/2) - (bump_pitch*subbump_width))/2))/1000;
        let rotation = 270;
        let flipped = false;   
        let b = {
            subbump_map_id: "BoW_32-50bp-10dia-hex-full-bi-example", // "BoW_32-140bp-20dia-hex-full-bi-example",
            offset: [x_offset, y_offset],
            rotation: rotation,
            flipped: flipped,
            _id: faker.string.uuid()
        };
        bump_regions.push(b);              
    }

    // interfaces
    const interfaces = [];
    const interface_ids = ["top", "bottom"];
    for (let i = 0; i < num_interfaces; i++) {
        const f = {
            physical_layer: ["BoW-32", ""],
            protocol_layer: [["CXL.cache 1.0", ""]],
            bump_region: (bump_regions[i])["_id"], 
            _id: interface_ids[i]
        };
        interfaces.push(f);
    }

    const synthetic_ccd_chiplet = new Chiplet({
        _id: "EPYC_CCD",
        name: "EPYC CCD",
        manufacturer: "AMD",
        width: 3,
        height: 4.5,
        area: 13.5,
        interfaces: interfaces,
        bump_regions: bump_regions,
        process_node: 7,  
        functionality: ["compute"],
        CPUs: [{
            quantity: 1,
            num_cores: 8,
            L3_cache: {
                quantity: 1,
                capacity: 256,
                associativity: 4,
                replacement_policy: "LRU"
            }
        }],
        clock_domains: [ {
            operational_freq: 1.46,
            is_range: false
            }
        ], 
        voltage_domains: [ {
            min_operational_v: 0.6,
            max_operational_v: 1.3,
            is_range: true
        }],   
    });

    return synthetic_ccd_chiplet;
};

export function generate_example_chiplet(id, name, subbump_map_id, bump_pitch, subbump_width) {
    const chiplet_name = name;
    const chiplet_id = id; // mongoose.ObjectId.toString(); // taking out some of the negatives
    const width = 2.6; 
    const height = 2.6;

    // generate synthetic bump maps
    const num_interfaces = 4;
    const bump_regions = [];

    for (let i = 0; i < num_interfaces; i++) {
        let x_offset = i == 0 ? ((width*1000 - bump_pitch*subbump_width)/2)/1000 : // + bump_pitch*subbump_width)/1000 :
                       i == 1 ? width - bump_pitch/1000 :
                       i == 2 ? width - ((width*1000 - bump_pitch*subbump_width)/2)/1000 : 
                       bump_pitch/1000;
        let y_offset = i == 0 ? bump_pitch/1000 : // (bump_pitch*subbump_height)/1000 :
                       i == 1 ? (((height*1000 - bump_pitch*subbump_width)/2))/1000 :
                       i == 2 ? height - bump_pitch/1000 :
                       (((height*1000 - bump_pitch*subbump_width)/2) + bump_pitch*subbump_width)/1000; 
        let rotation = i == 0 ? 0 :
                       i == 1 ? 90 :
                       i == 2 ? 180 :
                       270;
        let flipped = false;   
        let b = {
            subbump_map_id: subbump_map_id, // must match what is in the subbump collection
            offset: [x_offset, y_offset],
            rotation: rotation,
            flipped: flipped,
            _id: faker.string.uuid() // id of this bump map --> can be random, prepended with the chiplet name
        };
        bump_regions.push(b);              
    }

    // interfaces
    const interfaces = [];
    const interface_ids = ["north", "east", "south", "west"];
    for (let i = 0; i < num_interfaces; i++) {
        const f = {
            physical_layer: ["CXL.cache 1.0", ""],
            protocol_layer: [["BoW-32", ""]],
            bump_region: (bump_regions[i])["_id"], // generate them in order, then match them up
            _id: interface_ids[i]
        };
        interfaces.push(f);
    }

    const synthetic_chiplet = new Chiplet({
        _id: chiplet_id,
        name: chiplet_name,
        width: width,
        height: height,
        interfaces: interfaces,
        bump_regions: bump_regions,
        process_node: 16,  
        functionality: ["accelerator"],
        SRAMs: [{
            quantity: 1,
            capacity: 64
        }],
        CPUs: [{
            quantity: 1,
            name: "RISC-V"
        }],
        clock_domains: [{
            min_operational_freq: 0.16,
            max_operational_freq: 2.0,
            is_range: true
        }], 
        voltage_domains: [{
            min_operational_v: 0.42,
            max_operational_v: 1.2,
            is_range: true
        }],   
        subcomponents: [{
            quantity: 16,
            name: "PE",
            num_vector_units: 8,
            vector_width: 8,
            weight_buffer: {
                quantity: 1,
                capacity: 32,
            },
            input_buffer: {
                quantity: 1,
                capacity: 8,
            },
            accumulation_buffer: {
                quantity: 1,
                capacity: 3,
            }
        },
        {
            quantity: 1,
            name: "Global PE",
            capacity: 64
        }]
    });
    
    return synthetic_chiplet;
};

export function generate_test_net_chiplet() {
    const chiplet_id = faker.string.uuid(); // mongoose.ObjectId.toString(); // taking out some of the negatives
    const width = 5 // faker.number.float({ min: 10, max: 20, fractionDigits: 2 }); // mm
    const height = 5 // faker.number.float({ min: 10, max: 20, fractionDigits: 2 }); // mm

    // generate synthetic bump maps
    const num_interfaces = 1; // faker.number.int({ min: 1, max: 2 });
    const bump_regions = [];

    let subbump_map_id = "BoW_32-50bp-20dia-hex-half-tx";
    let x_offset = 2.5 // faker.number.int({ min: 0, max: width }); // mm, should change these to allow for greater flexibility
    let y_offset = 0.25 // faker.number.int({ min: 0, max: height });
    let rotation = 0 // faker.helpers.arrayElement([0, 90, 180, 270]); // degrees, radians? start this off as 0
    let flipped = false // faker.datatype.boolean(0.5); // true with 30% probability, start this off as 0
    let b = {
        subbump_map_id: subbump_map_id, // must match what is in the subbump collection
        offset: [x_offset, y_offset],
        rotation: rotation,
        flipped: flipped,
        _id: faker.string.uuid() // id of this bump map --> can be random, prepended with the chiplet name
    };
    bump_regions.push(b);

    // subbump_map_id = "BoW_32-50bp-20dia-hex-half-tx";
    // x_offset = faker.number.int({ min: 0, max: width }); // mm, should change these to allow for greater flexibility
    // y_offset = faker.number.int({ min: 0, max: height });
    // rotation = faker.helpers.arrayElement([0, 90, 180, 270]); // degrees, radians? start this off as 0
    // flipped = faker.datatype.boolean(0.5); // true with 30% probability, start this off as 0
    // b = {
    //     subbump_map_id: subbump_map_id, // must match what is in the subbump collection
    //     offset: [x_offset, y_offset],
    //     rotation: rotation,
    //     flipped: flipped,
    //     _id: faker.string.uuid() // id of this bump map --> can be random, prepended with the chiplet name
    // };
    // bump_regions.push(b);    

//    console.log(bump_regions);

    // first generate bump map for each interface
    // for (let i = 0; i < num_interfaces; i++) { // user has to select the matching subbump map?
    //     // b is one bump region
    //     const subbump_map_id = faker.helpers.arrayElement([
    //        // "BoW_32-40bp-20dia-rect-full-tx", "BoW_32-50bp-10dia-hex-full-tx",
    //        // "BoW_32-50bp-20dia-hex-half-tx", //"BoW_32-40bp-10dia-rect-half-tx",
    //        // "BoW_32-50bp-10dia-hex-full-rx", "BoW_32-40bp-10dia-rect-full-rx",
    //         "BoW_32-50bp-20dia-hex-full-tx" // , "BoW_32-40bp-10dia-rect-half-rx"
    //     ]);
    //     const x_offset = faker.number.int({ min: 0, max: width }); // mm, should change these to allow for greater flexibility
    //     const y_offset = faker.number.int({ min: 0, max: height });
    //     const rotation = faker.helpers.arrayElement([0, 90, 180, 270]); // degrees, radians? start this off as 0
    //     const flipped = faker.datatype.boolean(0.5); // true with 30% probability, start this off as 0
    //     const b = {
    //         subbump_map_id: subbump_map_id, // must match what is in the subbump collection
    //         offset: [x_offset, y_offset],
    //         rotation: rotation,
    //         flipped: flipped,
    //         _id: faker.string.uuid() // id of this bump map --> can be random, prepended with the chiplet name
    //     };
    //     bump_regions.push(b);
    // }

    // interfaces
    const interfaces = [];
    for (let i = 0; i < num_interfaces; i++) {
        const f = {
            bump_region: (bump_regions[i])["_id"], // generate them in order, then match them up
            _id: faker.string.uuid()
        };
        interfaces.push(f);
    }

    const synthetic_chiplet = new Chiplet({ // this is 1 chiplet, power efficiency
        _id: chiplet_id,
        width: width,
        height: height,
        interfaces: interfaces,
        bump_regions: bump_regions
    });
    
    return synthetic_chiplet;
};

export function generate_cpu_chiplet() {
    // maybe should use objectids? faker.database.mongodbObjectId() // 'e175cac316a79afdd0ad3afb'
    // have names?
    const chiplet_id = faker.string.uuid(); // mongoose.ObjectId.toString(); // taking out some of the negatives
    const width = faker.number.float({ min: 10, max: 20, fractionDigits: 2 }); // mm
    const height = faker.number.float({ min: 10, max: 20, fractionDigits: 2 }); // mm
    const area = Math.round(width*height*100) / 100; // mm^2
    const process_node = faker.number.int({ min: 0, max: 100 }); // nm
    const base_clock_frequency = faker.number.int({ min: 0, max: 2000 }); // MHz

    // voltage domains
    const num_voltage_domains = faker.number.int({ min: 1, max: 2 });
    const voltage_domains = [];
    for (let i = 0; i < num_voltage_domains; i++) {
        // create new voltage domain
        const v = {
            operational_v: faker.number.float({ min: 0, max: 10, fractionDigits: 2 }),
            min_operational_v: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
            max_operational_v: faker.number.float({ min: 0, max: 10, fractionDigits: 2 }),
            is_range: faker.datatype.boolean()
        };
        voltage_domains.push(v);
    }

    // functionalities --> should this exist?
    // depending on functionality of chiplet, not all these fields will be filled
    const functionality = 'compute'; // faker.helpers.arrayElements(['accelerator', 'compute', 'I/O', 'DSP', 'memory', 'GPU', 'FPGA', 'interface'], num_functionalities);

    // processors
    const num_diff_types_processors = 1; //faker.number.int({ min: 1, max: 2 });
    const processors = [];
    // can also add in process node at a later point
    for (let i = 0; i < num_diff_types_processors; i++) {
        const num_cores = 1; // faker.number.int({ min: 1, max: 32});
        const clock_frequency = faker.number.int({ min: 0, max: 2000 }); // MHz
        const cpu_quantity = 1; // faker.number.int({ min: 1, max:  4});
        const p = {
            quantity: cpu_quantity,
            manufacturer: faker.helpers.arrayElement(['ARM', 'AMD', 'Intel']), // options?
            processor_name: faker.helpers.arrayElement(['RISC-V', 'Ryzen', 'Xeon', 'Pentium']), // do these options make sense? should ISA also be a field?
            num_cores: num_cores,
            clock_frequency: clock_frequency,
            l1_icache: [{
                quantity: num_cores,
                capacity: num_cores, // faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64]),
                associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
                replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
                clock_frequency: clock_frequency
            }],
            l1_dcache: [{
                quantity: num_cores,
                capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64]),
                associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
                replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
                clock_frequency: clock_frequency
            }],
            l2_cache: [{ // unified l2 cache across all the cores
                quantity: cpu_quantity,
                capacity: faker.helpers.arrayElement([32, 64, 128, 256]),
                associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
                replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
                clock_frequency: clock_frequency
            }]
        };
        processors.push(p);
    }

    // DRAM
    const num_dram = faker.number.int({ min: 0, max: 2 }); // how to deal with them being off-chip?
    const DRAM = [];
    for (let i = 0; i < num_dram; i++) {
        const dram = {
            quantity: faker.number.int({ min: 0, max: 4 }), // if there's 0, should I impose other fields blank?
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]), // mb <-- could be more realistic
            bandwidth: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) // mb/s
        };
        DRAM.push(dram);
    }

    // generate synthetic bump maps
    const num_interfaces = faker.number.int({ min: 1, max: 2 });
    const bump_regions = [];

    // first generate bump map for each interface
    for (let i = 0; i < num_interfaces; i++) { // user has to select the matching subbump map?
        // b is one bump region
        const subbump_map_id = faker.helpers.arrayElement(["BoW_32-50bp-20dia-hex-full-tx", "BoW_32-40bp-20dia-rect-full-tx",
            "BoW_32-50bp-10dia-hex-full-tx", "BoW_32-40bp-10dia-rect-full-tx", "BoW_32-50bp-20dia-hex-half-tx",
            "BoW_32-40bp-20dia-rect-half-tx", "BoW_32-50bp-10dia-hex-half-tx", "BoW_32-40bp-10dia-rect-half-tx",
            "BoW_32-50bp-20dia-hex-full-rx", "BoW_32-40bp-20dia-rect-full-rx",
            "BoW_32-50bp-10dia-hex-full-rx", "BoW_32-40bp-10dia-rect-full-rx", "BoW_32-50bp-20dia-hex-half-rx",
            "BoW_32-40bp-20dia-rect-half-rx", "BoW_32-50bp-10dia-hex-half-rx", "BoW_32-40bp-10dia-rect-half-rx"
        ]);
        const x_offset = faker.number.int({ min: 0, max: width }); // mm, should change these to allow for greater flexibility
        const y_offset = faker.number.int({ min: 0, max: height });
        const rotation = faker.helpers.arrayElement([0, 90, 180, 270]); // degrees, radians? start this off as 0
        const flipped = faker.datatype.boolean(0.5); // true with 30% probability, start this off as 0
        const b = {
            subbump_map_id: subbump_map_id, // must match what is in the subbump collection
            offset: [x_offset, y_offset],
            rotation: rotation,
            flipped: flipped,
            _id: faker.string.uuid() // id of this bump map --> can be random, prepended with the chiplet name
        };
        bump_regions.push(b);
    }

    // then generate a virtual one <-- a virtual bump region, not a virtual interface?
    // now add in a virtual bump map that corresponds to having some pins that don't connect to interfaces
    // ignore this one for now because how are you going to link individual bumps?
    /*const virtual_bump_map = {
            subbump_map_id: "virtual-subbump-map", // must match what is in the subbump collection
            offset: [0, 0],
            rotation: 0,
            flipped: false,
            _id: faker.string.uuid() // id of this bump map --> can be random, prepended with the chiplet name
    };
    bump_regions.push(virtual_bump_map); */

    // interfaces
    const interfaces = [];
    for (let i = 0; i < num_interfaces; i++) {
        // PHY layer
        const PHY = new Array(2);
        PHY[0] = "BoW-32"; // first part is the name of the PHY, faker.helpers.arrayElement["16x PCIe", "UCIe", "AIB", "LIPINCON", "BoW", "USB", "ethernet", "SATA", "PCIe", "DisplayPort"],
        PHY[1] = ""; // second part is the id of the PHY <-- gets linked on save
        // Protocols layer
        const num_protocols_in_interface = faker.number.int({ min: 1, max: 2 });
        const protocol_layer = [];
        for (let j = 0; j < num_protocols_in_interface; j++) {
            const protocol = Array(2);
            protocol[0] = "PCIe"; // for the moment they can only choose pcie faker.helpers.arrayElement["CXL.io", "CXL.cache", "CXL.mem", "PCIe_16x", "AXI", "SATA"];
            protocol[1] = ""; // ID of protocol <-- gets linked on save
            protocol_layer.push(protocol);
        }

        const f = {
            physical_layer: PHY,
            protocol_layer: protocol_layer,
            bump_region: (bump_regions[i])["_id"], // generate them in order, then match them up
            _id: faker.string.uuid()
        };
        interfaces.push(f);
    }

    /*
        const bump_pitch = 50; // in the github doc, they gave an example of 40um for an interposer
        const diameter = 20; // these numbers can be made random, but for now let's fix them
        const bump_region_generation_result = generate_Bump_Region(interface_id, width, height, bump_pitch, diameter);
    */

    const synthetic_chiplet = new Chiplet({
        _id: chiplet_id,
        area: area,
        width: width,
        height: height,
        process_node: process_node,
        base_clock_frequency: base_clock_frequency,
        voltage_domains: voltage_domains,
        functionality: functionality,
        CPUs: processors,
        DRAM: DRAM,
        interfaces: interfaces,
        bump_regions: bump_regions
    });
    
    return synthetic_chiplet;
};

// before creating the chiplet data, need to create the protocol data so that i have the ids to link to
// then afer creating the protocol data, can fill up the compatibility table as well
// the exception table is the last thing that gets created because it depends on the chiplet ids
// need the bump maps before you create the chiplets

export function generate_chiplet() {
    // maybe should use objectids? faker.database.mongodbObjectId() // 'e175cac316a79afdd0ad3afb'
    // have names?
    const chiplet_id = faker.string.uuid(); // mongoose.ObjectId.toString(); // taking out some of the negatives
    const width = faker.number.float({ min: 0, max: 2000, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['mm', 'um', 'cm', 'nm']);
    const height = faker.number.float({ min: 0, max: 2000, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['mm', 'um', 'cm', 'nm']);
    const area = width*height + " " + faker.helpers.arrayElement(['mm^2', 'um^2', 'cm^2', 'nm^2']);
    const process_node = faker.number.int({ min: 0, max: 100 }) + " " + faker.helpers.arrayElement(['mm', 'um', 'nm']);
    const base_clock_frequency = faker.number.int({ min: 0, max: 100 }) + " " + faker.helpers.arrayElement(['GHz', 'MHz', 'Hz']);
    // voltage domains
    const num_voltage_domains = faker.number.int({ min: 1, max: 2 });
    const voltage_domains = [];
    for (let i = 0; i < num_voltage_domains; i++) {
        // create new voltage domain
        const v = {
            operational_v: faker.number.float({ min: 0, max: 10, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['V', 'mV']),
            min_operational_v: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['V', 'mV']),
            max_operational_v: faker.number.float({ min: 0, max: 10, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['V', 'mV']),
            is_range: faker.datatype.boolean()
        };
        voltage_domains.push(v);
    }
    // functionalities --> should this exist?
    const num_functionalities = faker.number.int({ min: 1, max: 3 });
    // depending on functionality of chiplet, not all these fields will be filled?
    const functionality = faker.helpers.arrayElements(['accelerator', 'compute', 'I/O', 'DSP', 'memory', 'GPU', 'FPGA', 'interface'], num_functionalities);

    // processors
    const num_processors = faker.number.int({ min: 1, max: 2 });
    const processors = [];
    for (let i = 0; i < num_processors; i++) {
        const num_cores = faker.number.int({ min: 1, max:  8});
        const clock_frequency = faker.number.int({ min: 0, max: 100 }) + " " + faker.helpers.arrayElement(['GHz', 'MHz', 'Hz']);
        const p = {
            quantity: faker.number.int({ min: 0, max:  32}),
            manufacturer: faker.helpers.arrayElement(['ARM', 'AMD', 'Intel']), // options?
            processor_name: faker.helpers.arrayElement(['RISC-V', 'Ryzen', 'Xeon', 'Pentium']), // do these options make sense? should ISA also be a field?
            num_cores: num_cores,
            clock_frequency: clock_frequency,
            l1_i_cache: [{
                quantity: num_cores,
                capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['KB']),
                associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
                replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
                clock_frequency: clock_frequency
            }],
            l1_d_cache: [{
                quantity: num_cores,
                capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['KB']),
                associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
                replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
                clock_frequency: clock_frequency
            }]
        };
        processors.push(p);
    }

    // L2 caches
    const num_L2_caches = faker.number.int({ min: 0, max: 2 });
    const L2_caches = [];
    for (let i = 0; i < num_L2_caches; i++) {
        const L2 = {
            quantity: faker.number.int({ min: 0, max: 2 }), // if there's 0, should I impose other fields blank?
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['MB', 'GB', 'KB']),
            associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
            replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
            clock_frequency: faker.number.int({ min: 0, max: 100 }) + " " + faker.helpers.arrayElement(['GHz', 'MHz', 'Hz'])
        };
        L2_caches.push(L2);
    }

    // L3 caches
    const num_L3_caches = faker.number.int({ min: 0, max: 1 });
    const L3_caches = []; // does it make sense to break down the caches like this? if you wanted to count them you'd have to go through the entire array and add their "quantity" fields
    for (let i = 0; i < num_L3_caches; i++) {
        const L3 = {
            quantity: faker.number.int({ min: 0, max: 2 }), // if there's 0, should I impose other fields blank?
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['MB', 'GB', 'KB']),
            associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
            replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
            clock_frequency: faker.number.int({ min: 0, max: 100 }) + " " + faker.helpers.arrayElement(['GHz', 'MHz', 'Hz'])
        };
        L3_caches.push(L3);
    }

    // HBMs
    // does it make sense to record the controller? do we really care about the controller or just the bandwidth it provides?
    const num_hbms = faker.number.int({ min: 0, max: 2 }); // how to deal with them being off-chip?
    const HBMs = [];
    for (let i = 0; i < num_hbms; i++) {
        const hbm = {
            quantity: faker.number.int({ min: 0, max: 4 }), // if there's 0, should I impose other fields blank?
            version: faker.helpers.arrayElement(['HBM', 'HBM2', 'HBM3']),
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['MB', 'GB']),
            bandwidth: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['GB/s', 'MB/s', 'KB/s', 'Gb/s', 'Mb/s', 'Kb/s'])
        };
        HBMs.push(hbm);
    }

    // SRAM
    const num_sram = faker.number.int({ min: 0, max: 2 }); // how to deal with them being off-chip?
    const SRAM = [];
    for (let i = 0; i < num_sram; i++) {
        const sram = {
            quantity: faker.number.int({ min: 0, max: 4 }), // if there's 0, should I impose other fields blank?
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['MB', 'GB', 'KB']),
            bandwidth: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['GB/s', 'MB/s', 'KB/s', 'Gb/s', 'Mb/s', 'Kb/s'])
        };
        SRAM.push(sram);
    }

    // DRAM
    const num_dram = faker.number.int({ min: 0, max: 2 }); // how to deal with them being off-chip?
    const DRAM = [];
    for (let i = 0; i < num_dram; i++) {
        const dram = {
            quantity: faker.number.int({ min: 0, max: 4 }), // if there's 0, should I impose other fields blank?
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['MB', 'GB', 'KB']),
            bandwidth: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['GB/s', 'MB/s', 'KB/s', 'Gb/s', 'Mb/s', 'Kb/s'])
        };
        DRAM.push(dram);
    }

/*
    GPUs: [gpu_schema],
    interfaces: [interface_schema],
*/
    const num_ddrs = faker.number.int({ min: 0, max: 1 }); // how to deal with them being off-chip?
    const DDR = [];
    for (let i = 0; i < num_ddrs; i++) {
        const ddr = {
            quantity: faker.number.int({ min: 0, max: 2 }), // if there's 0, should I impose other fields blank?
            version: faker.helpers.arrayElement(['DDR5', 'LPDDR4x', 'LPDDR4', 'DDR4', 'LPDDR5x', 'LPDDR5']),
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['MB', 'GB', 'KB']),
            bandwidth: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['GB/s', 'MB/s', 'KB/s', 'Gb/s', 'Mb/s', 'Kb/s'])
        };
        DDR.push(ddr);
    }

    // what qualities to add to GPUs? --> finish gpu section!!!
    /*const GPUs = [{
        quantity: {
            type: Number,
            min: 1
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
    }]; */

    // generate synthetic bump maps
    const num_interfaces = faker.number.int({ min: 1, max: 2 });
    const bump_regions = [];

    // first generate bump map for each interface
    for (let i = 0; i < num_interfaces; i++) { // user has to select the matching subbump map?
        // b is one bump region
        const subbump_map_id = faker.helpers.arrayElement["BoW_32-50bp-20dia-hex-full", "BoW_32-40bp-20dia-rect-full",
"BoW_32-50bp-10dia-hex-full", "BoW_32-40bp-10dia-rect-full", "BoW_32-50bp-20dia-hex-half", "BoW_32-40bp-20dia-rect-half",
"BoW_32-50bp-10dia-hex-half", "BoW_32-40bp-10dia-rect-half"];
        const x_offset = "1 cm"; // should change these to allow for greater flexibility
        const y_offset = "1 cm";
        const rotation = "0"; // degrees, radians? start this off as 0
        const flipped = faker.datatype.boolean(0); // true with 30% probability, start this off as 0
        const b = {
            subbump_map_id: "", // must match what is in the subbump collection
            offset: [x_offset, y_offset],
            rotation: rotation,
            flipped: flipped,
            _id: faker.string.uuid() // id of this bump map --> can be random, prepended with the chiplet name
        };
        bump_regions.push(b);
    }

    // then generate a virtual one <-- a virtual bump region, not a virtual interface?
    // now add in a virtual bump map that corresponds to having some pins that don't connect to interfaces
    const virtual_subbump_map_id = faker.helpers.arrayElement["sparse bump layout"]; // how to create this, because it's specific to the chiplet
    const x_offset_v = "0 um"; // the virtual one should live at 0, 0
    const y_offset_v = "0 um";
    const rotation_v = "0"; // degrees, radians
    const flipped_v = false; // true with 30% probability
    const virtual_bump_map = {
            subbump_map_id: virtual_subbump_map_id, // must match what is in the subbump collection
            offset: [x_offset_v, y_offset_v],
            rotation: rotation_v,
            flipped: flipped_v,
            _id: faker.string.uuid() // id of this bump map --> can be random, prepended with the chiplet name
    };
    bump_regions.push(virtual_bump_map);

    // interfaces
    const interfaces = [];
    for (let i = 0; i < num_interfaces; i++) {
        // PHY layer
        const PHY = new Array(2);
        PHY[0] = "BoW-32"; // faker.helpers.arrayElement["16x PCIe", "UCIe", "AIB", "LIPINCON", "BoW", "USB", "ethernet", "SATA", "PCIe", "DisplayPort"],
        PHY[1] = " ";
        // Protocols layer
        const num_protocols_in_interface = faker.number.int({ min: 1, max: 2 });
        const protocol_layer = Array(num_protocols_in_interface);
        for (let j = 0; j < num_protocols_in_interface; j++) {
            const protocol = Array(2);
            protocol[0] =  faker.helpers.arrayElement["CXL.io", "CXL.cache", "CXL.mem", "PCIe_16x", "AXI", "SATA"];
            protocol[1] = " ";
            protocol_layer.push(protocol);
        }

        const f = {
            physical_layer: PHY,
            protocol_layer: protocol_layer,
            bump_region: bump_region[i], // generate them in order, then match them up
        };
        interfaces.push(f);
    }

    /*
        const bump_pitch = 50; // in the github doc, they gave an example of 40um for an interposer
        const diameter = 20; // these numbers can be made random, but for now let's fix them
        const bump_region_generation_result = generate_Bump_Region(interface_id, width, height, bump_pitch, diameter);
        const bump_region = bump_region_generation_result[0];
        // also take the subbump documents that were generated and put them into the array
        // that keeps track of all the subbump docs that have been generated for this chiplet
        const subbump_regions_documents = bump_region_generation_result[1];
        subbump_regions_documents_all_interfaces.push(...subbump_regions_documents);
    */

    const synthetic_chiplet = new Chiplet({ // this is 1 chiplet, power efficiency
        _id: chiplet_id,
        area: area,
        width: width,
        height: height,
        process_node: process_node,
        base_clock_frequency: base_clock_frequency,
        voltage_domains: voltage_domains,
        functionality: functionality,
        processors: processors,
        L2_caches: L2_caches,
        L3_caches: L3_caches,
        HBMs: HBMs,
        SRAM: SRAM,
        DRAM: DRAM,
        interfaces: interfaces,
        bump_regions: bump_regions
    });

    console.log(interfaces);
    
    return synthetic_chiplet;
};