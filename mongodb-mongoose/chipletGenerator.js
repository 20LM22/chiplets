import { faker } from '@faker-js/faker';

export default function generateChiplet() {
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
    for (let i = 0; i < num_interfaces; i++) {
        f = {
            // still need to flesh out whether these are the best options
            // does this setup even make sense?
            physical_layer: faker.helpers.arrayElement["16x PCIe", "LIPINCON", "UCIe-A", "UCIe-S", "AIB", "MDIO", "LIPINCON", "BoW", "USB", "ethernet", "SATA", "USB4", "PCIe", "DisplayPort"],
            protocol_layer: faker.helpers.arrayElement["16x PCIe", "LIPINCON", "CXL.io", "CXL.cache", "CXL.mem", "PCIe", "AXI", "SATA"],
            bandwidth: faker.helpers.arrayElement([1, 2, 4, 8, 16, 32, 64, 128, 256]) + " " + faker.helpers.arrayElement(['GB/s', 'MB/s', 'KB/s', 'Gb/s', 'Mb/s', 'Kb/s']),
        };
        L3_caches.push(f);
    }

    const synthetic_chiplet = new Chiplet({ // this is 1 chiplet
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
    
    return synthetic_chiplet;
};

// before creating the chiplet data, need to create the protocol data so that i have the ids to link to
// then afer creating the protocol data, can fill up the compatibility table as well
// the exception table is the last thing that gets created because it depends on the chiplet ids
// need the bump maps before you create the chiplets