import mongoose from 'mongoose';
import Chiplet from './model/Chiplet.js';
import { generate_Bow_Subbump_Map } from './subbumpMapGenerator.js';
import SubbumpMap from './model/SubbumpMap.js';
import { generate_PHY } from './protocolAndPHYGenerator.js';
import PHY from './model/PHY.js';
import Protocol from './model/Protocol.js';
import { generate_cpu_chiplet, generate_test_net_chiplet } from './chipletGenerator.js';
import { export_chiplet_bumpmap } from './exportChipletBumpmap.js';
import { export_netlist } from './netlistGenerator.js';
import assert from 'assert';
import * as fs from "fs";
import ChipletSystem from './model/ChipletSystem.js';
import { generate_chiplet_system } from './chipletSystemGenerator.js';

mongoose.connect("mongodb+srv://Lauren:dtuk2o8uCrB4FYFa@chipletrepository.rgz8c.mongodb.net/chiplet_repository")

// const seven_nm_4_GHz_Arm_Core_Based_CoWoS = new Chiplet({ // this is 1 chiplet
//     area: {value: 27.28, units: "mm^2"},
//     width: {value: 4.4, units: "mm"},
//     height: {value: 6.2, units: "mm"},
//     process_node: {value: 7, units: "nm"},
//     bumps: {pitch: {value: 40, units: "um"}}, // no shape, material provided
//     // can provide an array of different cores --> not sure if this is set up right
//     CPUs: [{processor_name: "Arm Cortex-A72", num_cores: 4, clock_frequency: {value: 4, units: "GHz"}, l1_cache:[{clock_frequency: {value:4,units:"GHz"}}]}], 
//     L2_caches: [{quantity:2, capacity:{value:2, units:"MB"}, clock_frequency:{value:2,units:"GHz"}}],
//     L3_caches: [{quantity:1, capacity:{value:6, units:"MB"}, clock_frequency:{value:1,units:"GHz"}}],
//     base_clock_frequency: {value: 4, units:"GHz"},
//     physical_layer: "LIPINCON",
//     protocol_layer: "LIPINCON"
// });

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

// const manticore = new Chiplet({ // this is 1 chiplet
//     area: {value: 222, units: "mm^2"},
//     width: {value: 14.9, units: "mm"},
//     height: {value: 14.9, units: "mm"},
//     process_node: {value: 22, units: "nm"},
//     // can provide an array of different cores --> not sure if this is set up right
//     HBM: [{quantity:1, version:"HBM2", capacity:{value:8,units:"GB"}, controller:{bandwidth:{value:256,units:"GB/s"}}}],
//     CPUs: [{processor_name: "Ariane RV64GC", num_cores: 4}], 
//     L2_caches: [{quantity:1, capacity:{value:27, units:"MB"}}],
//     physical_layer: "16x PCIe", // how to encode the bandwidth?
//     protocol_layer: "16x PCIe"
// });

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

// const NUM_SYNTHETIC_CHIPLETS = 20;
// const synthetic_chiplets = [];
// for (let i = 0; i < NUM_SYNTHETIC_CHIPLETS; i++) {
//     // generate chiplet returns a chiplet doc to insert and a bunch of subbump region docs to insert
//     const synthetic_chiplet = generate_test_net_chiplet(); // maybe could break it down into generating basic types/functionalities of chiplets?
//     try {
//         await synthetic_chiplet.validate();
//         synthetic_chiplets.push(synthetic_chiplet);
//         console.log("successfully validated chiplet");
//     } catch (err) {
//         console.error(err);
//         console.log("did not validate chiplet");
//     }
// }

// console.log("number of chiplets in chiplet array: \n");
// console.log(synthetic_chiplets.length);
// const options = { ordered: true };
// const synthetic_chiplet = generate_test_net_chiplet();
// console.log(synthetic_chiplet);
// await Chiplet.insertMany(synthetic_chiplet, options);
// console.log("done");

// a way around this: call validate on each one as it's generated, if it's valid add it to arr, if its not valid, log message and don't add it
// calling save or validate on a parent doc triggers save/validate on the subdocs... phew

// Generate and insert subbump maps for BoW-32
// let subbump_maps = []; // 50bp, 20dia
// let map = generate_Bow_Subbump_Map("BoW_32-50bp-20dia-hex-full-tx", 50, 10, true, false, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-20dia-rect-full-tx", 40, 10, false, false, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-50bp-10dia-hex-full-tx", 50, 5, true, false, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-10dia-rect-full-tx", 40, 5, false, false, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-50bp-20dia-hex-half-tx", 50, 10, true, true, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-20dia-rect-half-tx", 40, 10, false, true, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-50bp-10dia-hex-half-tx", 50, 5, true, true, true);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-10dia-rect-half-tx", 40, 5, false, true, true);
// subbump_maps.push(map);

// map = generate_Bow_Subbump_Map("BoW_32-50bp-20dia-hex-full-rx", 50, 10, true, false, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-20dia-rect-full-rx", 40, 10, false, false, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-50bp-10dia-hex-full-rx", 50, 5, true, false, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-10dia-rect-full-rx", 40, 5, false, false, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-50bp-20dia-hex-half-rx", 50, 10, true, true, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-20dia-rect-half-rx", 40, 10, false, true, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-50bp-10dia-hex-half-rx", 50, 5, true, true, false);
// subbump_maps.push(map);
// map = generate_Bow_Subbump_Map("BoW_32-40bp-10dia-rect-half-rx", 40, 5, false, true, false);
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
// const chiplet_id = "chiplet1";
// const chiplet_system_chiplet_id = "93e1892b-c8d9-408e-8581-fba51be047b5";
// let created = false;
// fs.access('./subbump_map.json', fs.constants.F_OK, (err) => {
//     created = err ? false : true;
//     console.log("created is: ");
//     console.log(created);
//     if (created == false) {
//         try {
//             export_chiplet_bumpmap(chiplet_system_chiplet_id, chiplet_id);
//             console.log("successfully exported bumpmap");
//         } catch (err) {
//             console.error(err);
//             console.log("did not export bumpmap");
//         } finally {
//             created = true;
//         }
//     }
// });

// generate json for netlist
// const chiplet_a_id = "05d1e276-3938-477e-8e8e-85252f2c4692"; 
// const chiplet_b_id = "c5df0da9-cd4c-4735-9edb-4a8000117dee";
// const interface_connections = [["641d5cf3-24f4-4b8b-bd08-a861fe6e42eb", "6cf5ca3e-4728-4eeb-a5ad-ebef0d4f1091"]]; // [["3b49db7b-b3e6-4b3f-9a4a-07345cdd4ba4", "6f2dc555-9b7b-48bf-a438-2d076251b4a2"]];
// let created = false;
// fs.access('./netlist.json', fs.constants.F_OK, (err) => {
//     created = err ? false : true;
//     console.log("created is: ");
//     console.log(created);
//     if (created == false) {
//         try {
//             export_netlist(chiplet_a_id, chiplet_b_id, interface_connections);
//             console.log("successfully exported bumpmap");
//         } catch (err) {
//             console.error(err);
//             console.log("did not export bumpmap");
//         } finally {
//             created = true;
//         }
//     }
// });

// generate a chiplet system
// first one is tx, second is rx
// const chiplet_id_arr = ["4bcf9400-e160-44f3-a7a5-bc8dc35aea6f", "68b82933-b519-4c7b-b466-8578308fac3c", "88c04164-bc50-4a58-bde8-a3e8225f74cc", "2c462229-6fca-4a87-bb40-6d55f2a94e89"];
// const connection_input_arr = [[0, "f002d933-4e10-4c6f-b469-53ea43bf2134", 1, "d20db29b-5f85-4e5f-8de2-59e2f576dc60"], // A
// 							[2, "332c5ea2-c886-45ad-a109-36b9af14e62b", 0, "246166b3-76d3-46f4-a98a-6eae58675a0a"], // C
// 							[3, "0d455d33-f7be-4ba5-bc0a-7b4c5e10095a", 1, "59d672af-d0ed-44be-b78e-2483fdd1ad89"] // B
// 						];

// const chiplet_id_arr = ["814b57d1-88ec-4ac9-80ea-97a27c6d9cdd", "8bef07f0-4c33-42ba-8f3d-942cb0bb7d29"];
// const connection_input_arr = [[0, "53b6c63a-e659-422f-8168-729f3daf54e3", 1, "23a9d86b-2aba-4284-b413-d75f3e3daf0d"], // A
// 							];
// const chiplet_system = generate_chiplet_system(chiplet_id_arr, connection_input_arr);
// const options = { ordered: true };
// await ChipletSystem.insertMany(chiplet_system, options);
// console.log("dsljlsjldj");

// generate json for chiplet system netlist
const chiplet_system_chiplet_id = "93e1892b-c8d9-408e-8581-fba51be047b5"; // "905da64d-8625-4056-8c1c-49d69d17a2ea";
let created = false;
fs.access('./netlist.json', fs.constants.F_OK, (err) => {
    created = err ? false : true;
    console.log("created is: ");
    console.log(created);
    if (created == false) {
        try {
            export_netlist(chiplet_system_chiplet_id);
            console.log("successfully exported bumpmap");
        } catch (err) {
            console.error(err);
            console.log("did not export bumpmap");
        } finally {
            created = true;
        }
    }
});