import { faker } from '@faker-js/faker';
import { Chiplet } from './model/Chiplet.js';
import { generate_Bow_Signal_Subbump_Region, generate_Bow_Power_Subbump_Region } from './subbumpRegionGenerator.js';

export default function generateChiplet() {
    const chiplet_id = mongoose.ObjectId.toString();
    const width = faker.number.float({ min: -5, max: 2000, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['mm', 'um', 'cm', 'nm']);
    const height = faker.number.float({ min: -5, max: 2000, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['mm', 'um', 'cm', 'nm']);
    const area = width*height + " " + faker.helpers.arrayElement(['mm^2', 'um^2', 'cm^2', 'nm^2']);
    const process_node = faker.number.int({ min: -5, max: 100 }) + " " + faker.helpers.arrayElement(['mm', 'um', 'nm']);
    const bumps = {
        pitch: faker.number.int({ min: -5, max: 100 }) + " " + faker.helpers.arrayElement(['mm', 'um', 'nm']),
        shape: faker.helpers.arrayElement('square', 'hexagonal'),
        material: faker.helpers.arrayElement('SnCu', 'SnIn', 'SnZn', 'SnPb', 'SnAg', 'SnAu', 'Au', 'SnIn')
    };
    const base_clock_frequency = faker.number.int({ min: -5, max: 100 }) + " " + faker.helpers.arrayElement(['GHz', 'MHz', 'Hz']);
    // voltage domains
    const num_voltage_domains = faker.number.int({ min: 1, max: 2 });
    const voltage_domains = [];
    for (let i = 0; i < num_voltage_domains; i++) {
        // create new voltage domain
        v = {
            operational_v: faker.number.float({ min: -2, max: 10, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['V', 'mV']),
            min_operational_v: faker.number.float({ min: -2, max: 5, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['V', 'mV']),
            max_operational_v: faker.number.float({ min: -2, max: 10, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['V', 'mV']),
            is_range: faker.datatype.boolean()
        };
        voltage_domains.push(v);
    }
    const power_efficiency = faker.number.int({ min: -5, max: 100 }) + " " + faker.helpers.arrayElement(['pJ/bit', 'nJ/bit', 'uJ/bit']);
    // functionalities --> should this exist?
    const num_functionalities = faker.number.int({ min: 1, max: 3 });
    const functionality = faker.helpers.arrayElements(['accelerator', 'compute', 'I/O', 'DSP', 'memory', 'GPU', 'FPGA', 'interface'], num_functionalities);
    // depending on functionality of chiplet, not all these fields will be filled?

    // processors
    const num_processors = faker.number.int({ min: 0, max: 2 });
    const processors = [];
    for (let i = 0; i < num_processors; i++) {
        p = {
            quantity: faker.number.int({ min: 0, max:  32}),
            manufacturer: faker.helpers.arrayElement(['ARM', 'AMD', 'Intel']), // options?
            processor_name: faker.helpers.arrayElement(['RISC-V', 'Ryzen', 'Xeon', 'Pentium']), // do these options make sense? should ISA also be a field?
            num_cores: faker.number.int({ min: 0, max:  8}),
            clock_frequency: faker.number.int({ min: -5, max: 100 }) + " " + faker.helpers.arrayElement(['GHz', 'MHz', 'Hz']),
            l1_cache: [{
                quantity: p.num_cores,
                capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['KB']),
                associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
                replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
                clock_frequency: p.clock_frequency
            }],
        };
        processors.push(p);
    }

    // L2 caches
    const num_L2_caches = faker.number.int({ min: 0, max: 2 });
    const L2_caches = [];
    for (let i = 0; i < num_L2_caches; i++) {
        L2 = {
            quantity: faker.number.int({ min: 0, max: 2 }), // if there's 0, should I impose other fields blank?
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['MB', 'GB', 'KB']),
            associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
            replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
            clock_frequency: faker.number.int({ min: -5, max: 100 }) + " " + faker.helpers.arrayElement(['GHz', 'MHz', 'Hz'])
        };
        L2_caches.push(L2);
    }

    // L3 caches
    const num_L3_caches = faker.number.int({ min: 0, max: 1 });
    const L3_caches = []; // does it make sense to break down the caches like this? if you wanted to count them you'd have to go through the entire array and add their "quantity" fields
    for (let i = 0; i < num_L3_caches; i++) {
        L3 = {
            quantity: faker.number.int({ min: 0, max: 2 }), // if there's 0, should I impose other fields blank?
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['MB', 'GB', 'KB']),
            associativity: faker.number.int({ min: 1, max: 4}), // should we be validating things like the cache parameters are logical?
            replacement_policy: faker.helpers.arrayElement(['LRU', 'FIFO', 'random']),
            clock_frequency: faker.number.int({ min: -5, max: 100 }) + " " + faker.helpers.arrayElement(['GHz', 'MHz', 'Hz'])
        };
        L3_caches.push(L3);
    }

    // HBMs
    // does it make sense to record the controller? do we really care about the controller or just the bandwidth it provides?
    const num_hbms = faker.number.int({ min: 0, max: 2 }); // how to deal with them being off-chip?
    const HBMs = [];
    for (let i = 0; i < num_hbms; i++) {
        hbm = {
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
        sram = {
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
        dram = {
            quantity: faker.number.int({ min: 0, max: 4 }), // if there's 0, should I impose other fields blank?
            capacity: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['MB', 'GB', 'KB']),
            bandwidth: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['GB/s', 'MB/s', 'KB/s', 'Gb/s', 'Mb/s', 'Kb/s'])
        };
        DRAM.push(dram);
    }

    // what qualities to add to GPUs?
    const GPUs = [];
    
    // interfaces
    const num_interfaces = faker.number.int({ min: 1, max: 2 });
    const interfaces = [];

    // need to set up an array that you can add subbumps to as interfaces are generated
    const subbump_regions_documents_all_interfaces = [];

    for (let i = 0; i < num_interfaces; i++) {
        // each interface needs these properties
        const interface_id = chiplet_id + "_" + PHY + "_" + i; // id = a2c9_BoW_0

        // PHY layer
        const PHY = new Array(2);
        PHY[0] = "BoW"; // faker.helpers.arrayElement["16x PCIe", "UCIe", "AIB", "LIPINCON", "BoW", "USB", "ethernet", "SATA", "PCIe", "DisplayPort"],
        
        // Protocols layer
        const num_protocols_in_interface = faker.number.int({ min: 1, max: 2 });
        const protocol_layer = Array(num_protocols_in_interface);
        for (let j = 0; j < num_protocols_in_interface; j++) {
            const protocol = Array(2);
            protocol[0] =  ["CXL.io", "CXL.cache", "CXL.mem", "PCIe", "AXI", "SATA"];
            protocol_layer.push(protocol);
        }

        // Generate a bump region for this interface --> will need some parameters into here
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

        /* const voltage_domain = 0; // need to generate some voltage and clock domains
        const clock_domain = 0; */
        const bump_region = "BoW Half-slice"; // choose a bump region from the existing bump regions collection
        // faker.helpers.arrayElement["16x PCIe", "UCIe", "AIB", "LIPINCON", "BoW", "USB", "ethernet", "SATA", "PCIe", "DisplayPort"],

        f = {
            physical_layer: PHY,
            protocol_layer: protocol_layer,
            bump_region: bump_region,
            // voltage_domain: voltage_domain,
            // clock_domain: clock_domain,
            id_: interface_id
        };
        interfaces.push(f);
    }

    const synthetic_chiplet = new Chiplet({ // this is 1 chiplet
        _id: chiplet_id,
        area: area,
        width: width,
        height: height,
        process_node: process_node,
        bumps: bumps,
        base_clock_frequency: base_clock_frequency,
        voltage_domains: voltage_domains,
        power_efficiency: power_efficiency,
        functionality: functionality,
        // depending on functionality of chiplet, not all these fields will be filled?
        processors: processors,
        L2_caches: L2_caches,
        L3_caches: L3_caches,
        HBMs: HBMs,
        SRAM: SRAM,
        DRAM: DRAM,
        FPUs: FPUs,
        GPUs: GPUs,   
        interfaces: interfaces,     
    });
    
    return [synthetic_chiplet, subbump_regions_documents_all_interfaces];
};

// before creating the chiplet data, need to create the protocol data so that i have the ids to link to
// then afer creating the protocol data, can fill up the compatibility table as well
// the exception table is the last thing that gets created because it depends on the chiplet ids
// need the bump maps before you create the chiplets

function generate_Bump_Region(interface_id, chiplet_x_dim, chiplet_y_dim, bump_pitch, diameter) {
    // need to generate the subbump regions for this bump region

    // for now let's assume you only generate subbumps for BoW
    const subbump_region_array = Array(2); // one subbump region for the signals, one for power

    // randomly generate hexagonal but for now keep it true
    const hexagonal = true;

    // generate the offsets for the signal and power subbumps
    // start with the number of rows being 2 for signal and 1 for power
    const NUM_SIGNAL_ROWS = 2;
    const NUM_POWER_ROWS = 1;

    // assume for now that the offset is from the bottom of the chip, we're just trying to put interfaces 
    // on the bottom of a chip
    const vertical_row_offset = hexagonal ? bump_pitch * Math.cos(Math.PI * (1/6)) : bump_pitch;
    const v_offset_signal = NUM_SIGNAL_ROWS * vertical_row_offset;
    const v_offset_power = signal_subbump_offset + NUM_POWER_ROWS * vertical_row_offset;

    // laterally there is some room to place them
    // when this is randomly generated, it should make sure to choose a value greater than 0
    // and small enough that the interface isn't going to go off the chip, so that requires
    // knowing whether the interface is a half slice or full slice
    const lateral_offset = 2; // randomly generate based on the chiplet_x_dim

    h_offset_signal = lateral_offset;
    h_offset_power = hexagonal ? lateral_offset + 0.5*bump_pitch : lateral_offset;

    // need to generate the actual subbump region documents that house the specific bump layouts
    const half_slice = false; // can change this to make it random
    const subbump_signal_region_id = interface_id + "_bump_region" + "_signal";
    const subbump_power_region_id = interface_id + "_bump_region" + "_power";

    // these functions generate and return SubbumpRegion documents that need to be ingested into the SubbumpRegion collection
    const subbump_region_signal_document = generate_Bow_Signal_Subbump_Region(subbump_signal_region_id, bump_pitch, diameter, hexagonal, half_slice);
    const subbump_region_power_document = generate_Bow_Power_Subbump_Region(subbump_power_region_id, bump_pitch, diameter, hexagonal, half_slice);

    const subbump_regions_documents = [subbump_region_signal_document, subbump_region_power_document];

    // generate the subbump region objects and add them to the array of subbump regions
    const subbump_region_power = {
        subbump_region_id: subbump_power_region_id,
        offset: [h_offset_power, v_offset_power],
        rotation: 0,
        flipped: false
    };

    const subbump_region_signal = {
        subbump_region_id: subbump_signal_region_id,
        offset: [h_offset_signal, v_offset_signal],
        rotation: 0,
        flipped: false
    };

    subbump_region_array[0] = subbump_region_power;
    subbump_region_array[1] = subbump_region_signal;

    // then put the array together with the id that describes this particular array into the bump region
    const bump_region = {
        bump_region_id: interface_id + "bump_region",
        subbump_regions: subbump_region_array
    };

    return [bump_region, subbump_regions_documents];
}