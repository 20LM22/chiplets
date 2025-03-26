import mongoose from 'mongoose';
import Chiplet from './model/Chiplet.js';
import { generate_Bow_Subbump_Map } from './subbumpMapGenerator.js';
import SubbumpMap from './model/SubbumpMap.js';
import { generate_PHY } from './protocolAndPHYGenerator.js';
import PHY from './model/PHY.js';
import Protocol from './model/Protocol.js';
import { generate_cpu_chiplet } from './chipletGenerator.js';
import { export_chiplet_bumpmap } from './exportChipletBumpmap.js';
import assert from 'assert';
import * as fs from "fs";

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

// const NUM_SYNTHETIC_CHIPLETS = 20;
// const synthetic_chiplets = [];
// for (let i = 0; i < NUM_SYNTHETIC_CHIPLETS; i++) {
//     // generate chiplet returns a chiplet doc to insert and a bunch of subbump region docs to insert
//     const synthetic_chiplet = generate_cpu_chiplet(); // maybe could break it down into generating basic types/functionalities of chiplets?
//     // console.log("here's the synthetic interface before:\n");
//     // console.log(synthetic_chiplet.interfaces[0]);
//     try {
//         await synthetic_chiplet.validate();
//         synthetic_chiplets.push(synthetic_chiplet);
//         console.log("successfully validated chiplet");
//     } catch (err) {
//         console.error(err);
//         console.log("did not validate chiplet");
//     }

//     // console.log("here's the synthetic interface after:\n");
//     // console.log(synthetic_chiplet.interfaces[0]);

//     // problem: it's not linking the ids of the protocols and phys to their corresponding documents
//     // wait but that happens on save so it's fine
// }

// console.log("number of chiplets in chiplet array: \n");
// console.log(synthetic_chiplets.length);
// const options = { ordered: true };
// await Chiplet.insertMany(synthetic_chiplets, options);
// console.log("done");

// a way around this: call validate on each one as it's generated, if it's valid add it to arr, if its not valid, log message and don't add it
// calling save or validate on a parent doc triggers save/validate on the subdocs... phew

// // Generate and insert subbump maps for BoW-32
// let subbump_maps = []; // 50bp, 20dia
// let map = generate_Bow_Subbump_Map("BoW_32-50bp-20dia-hex-full", 50, 10, true, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-20dia-rect-full", 40, 10, false, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-50bp-10dia-hex-full", 50, 5, true, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-10dia-rect-full", 40, 5, false, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-50bp-20dia-hex-half", 50, 10, true, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-20dia-rect-half", 40, 10, false, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-50bp-10dia-hex-half", 50, 5, true, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-10dia-rect-half", 40, 5, false, true);
// subbump_maps.push(map);
// const options = { ordered: true };
// await SubbumpMap.insertMany(subbump_maps, options);

// const phy_docs = generate_PHY();
// await PHY.insertMany(phy_docs, options);

/* const protocol = new Protocol({
    name: 'PCIe',
    max_bandwidth: '4 MB/s', // not true
    num_lanes: '16',
    _id: 'PCIe_16x' // user sets this explicitly
}); */

// await Protocol.insertOne(protocol);

// insert compatibility documents
// syn_protocol_compat = generate_synthetic_protocol_compatibility_docs();
// await ProtocolCompatibility.insertMany(syn_protocol_compat, options = { ordered: true });

// generate the json file
const chiplet_id = "b0880775-8f8d-4f0b-bf7b-76fdb3396656"; // awaiting chiplet id
let created = false;
fs.access('./subbump_map.json', fs.constants.F_OK, (err) => {
    created = err ? false : true;
    // console.log(`/subbump_map.json ${err ? 'does not exist' : 'exists'}`);
    // console.log("right after access of file, created is: ");
    // console.log(created);
    console.log("created is: ");
    console.log(created);
    if (created == false) {
        try {
            export_chiplet_bumpmap(chiplet_id);
            console.log("successfully exported bumpmap");
        } catch (err) {
            console.error(err);
            console.log("did not export bumpmap");
        } finally {
            created = true;
        }
    }
});