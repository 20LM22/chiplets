import mongoose from 'mongoose';
import Chiplet from './model/Chiplet.js';
import Subbump_Region from './model/SubbumpRegion.js';
// import generateChiplet from './chipletGenerator.js';
// import ProtocolCompatibility from './model/ProtocolCompatibility.js';

mongoose.connect("mongodb+srv://Lauren:dtuk2o8uCrB4FYFa@chipletrepository.rgz8c.mongodb.net/chiplet_repository")

const seven_nm_4_GHz_Arm_Core_Based_CoWoS = new Chiplet({ // this is 1 chiplet
    area: {value: 27.28, units: "mm^2"},
    width: {value: 4.4, units: "mm"},
    height: {value: 6.2, units: "mm"},
    process_node: {value: 7, units: "nm"},
    bumps: {pitch: {value: 40, units: "um"}}, // no shape, material provided
    // can provide an array of different cores --> not sure if this is set up right
    CPUs: [{processor_name: "Arm Cortex-A72", num_cores: 4, clock_frequency: {value: 4, units: "GHz"}, l1_cache:[{clock_frequency: {value:4,units:"GHz"}}]}], 
    L2_caches: [{quantity:2, capacity:{value:2, units:"MB"}, clock_frequency:{value:2,units:"GHz"}}],
    L3_caches: [{quantity:1, capacity:{value:6, units:"MB"}, clock_frequency:{value:1,units:"GHz"}}],
    base_clock_frequency: {value: 4, units:"GHz"},
    physical_layer: "LIPINCON",
    protocol_layer: "LIPINCON"
});

// ariane cores are used for configuration and setup

/* These would be good to add for the physical layer schemas 
The chiplets communicate with each other through ultrashort reach
(0.5 mm long) interposer channels using a Low-voltage-InPackage-INterCONnect (LIPINCON)
clock-forwarded parallel interface */
/*
Physical layer: {
	Type: LIPINCON
	Subnet design: point to point
	Size: 0.42 mm × 2.4 mm
	Quantity: 2,
	Number of pins: 320
	Bandwidth density: 1.6-Tb/s/mm2
	Energy efficiency: 0.56-pJ/bit,
	Bandwidth_max:  8 Gb/s/pin,
	Bandwidth_aggregate: 320 GB/s
	Eye: {
Width: 86-ps
		Height: 244-mv
		Signal swing: 0.3 V
}
}*/

const manticore = new Chiplet({ // this is 1 chiplet
    area: {value: 222, units: "mm^2"},
    width: {value: 14.9, units: "mm"},
    height: {value: 14.9, units: "mm"},
    process_node: {value: 22, units: "nm"},
    // can provide an array of different cores --> not sure if this is set up right
    HBM: [{quantity:1, version:"HBM2", capacity:{value:8,units:"GB"}, controller:{bandwidth:{value:256,units:"GB/s"}}}],
    CPUs: [{processor_name: "Ariane RV64GC", num_cores: 4}], 
    L2_caches: [{quantity:1, capacity:{value:27, units:"MB"}}],
    physical_layer: "16x PCIe", // how to encode the bandwidth?
    protocol_layer: "16x PCIe"
});

// await Chiplet.insertOne(manticore);

/*
const chiplets_to_insert = [seven_nm_4_GHz_Arm_Core_Based_CoWoS, manticore]; // make an array of the chiplets
const options = { ordered: true };
await Chiplet.insertMany(chiplets_to_insert, options);
*/

// generate and insert synthetic chiplets
const NUM_SYNTHETIC_CHIPLETS = 20;
// let synthetic_chiplets = [];
for (let i = 0; i < NUM_SYNTHETIC_CHIPLETS; i++) {
    // generate chiplet returns a chiplet doc to insert and a bunch of subbump region docs to insert
    const generated_chiplet_data = generateChiplet();
    const synthetic_chiplet = generated_chiplet_data[0];
    const subbump_regions_documents_all_interfaces = generated_chiplet_data[1];
    await Chiplet.insertOne(synthetic_chiplet);
    await Subbump_Region.insertMany(subbump_regions_documents_all_interfaces, options={ ordered : true });
    // synthetic_chiplets.push(generateChiplet());
}

// They should probably be inserted one at a time with their subbump maps so that subbump maps aren't included
// which correspond to bad chiplets
// await Chiplet.insertMany(synthetic_chiplets, options = { ordered: true });

/* 
// insert protocol documents
const ucie = new Protocol({
    name: "UCIe",
    max_bandwidth: "2",
    reach: "2",
    num_channels: 2,
    BER: "2",
    _id: "UCIe" // user sets this explicitly
});

// insert compatibility documents
for (let i = 0; i < NUM_SYNTHETIC_CHIPLETS; i++) {
    synthetic_chiplets.push(generateChiplet());
}

syn_protocol_compat = generate_synthetic_protocol_compatibility_docs();
await ProtocolCompatibility.insertMany(syn_protocol_compat, options = { ordered: true });
*/