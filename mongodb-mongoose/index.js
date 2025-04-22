import mongoose from 'mongoose';
import Chiplet from './model/Chiplet.js';
import { generate_bidirectional_Bow_Subbump_Map } from './subbumpMapGenerator.js';
import SubbumpMap from './model/SubbumpMap.js';
import { generate_PHY } from './protocolAndPHYGenerator.js';
import PHY from './model/PHY.js';
import Protocol from './model/Protocol.js';
import { generate_example_chiplet, generate_cpu_chiplet, generate_test_net_chiplet, generate_epyc_ccd_chiplet, generate_epyc_iod_chiplet } from './chipletGenerator.js';
import { export_chiplet_bumpmap } from './exportChipletBumpmap.js';
import { export_netlist } from './netlistGenerator.js';
import assert from 'assert';
import * as fs from "fs";
import ChipletSystem from './model/ChipletSystem.js';
import { generate_chiplet_system } from './chipletSystemGenerator.js';

mongoose.connect("mongodb+srv://Lauren:dtuk2o8uCrB4FYFa@chipletrepository.rgz8c.mongodb.net/chiplet_repository")

// generate and insert synthetic chiplets

// const NUM_SYNTHETIC_CHIPLETS = 1;
// const synthetic_chiplets = [];
// for (let i = 0; i < NUM_SYNTHETIC_CHIPLETS; i++) {
//     // generate chiplet returns a chiplet doc to insert and a bunch of subbump region docs to insert
//     const synthetic_chiplet =  generate_epyc_chiplet("EPYC_type_1", "EYPC Type 1 Chiplet", subbump_map_id, bump_pitch, subbump_width) // generate_example_chiplet("Simba_type_2", "Simba Type 2 Chiplet", "BoW_32-50bp-10dia-hex-full-bi-example", 50, 39);
// 	// console.log("here's the synthetic interface before:\n");
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
// }

// const NUM_SYNTHETIC_CHIPLETS = 1;
// const synthetic_chiplets = [];
// for (let i = 0; i < NUM_SYNTHETIC_CHIPLETS; i++) {
//     // generate chiplet returns a chiplet doc to insert and a bunch of subbump region docs to insert
//     const synthetic_chiplet =  generate_epyc_iod_chiplet();
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
//         // console.log("successfully validated chiplet");
//     } catch (err) {
//         console.error(err);
//         console.log("did not validate chiplet");
//     }
// }

// const options = { ordered: true };
// const synthetic_chiplet = generate_test_net_chiplet();
// await Chiplet.insertMany(synthetic_chiplet, options);
// console.log("done");

// Generate and insert subbump maps for BoW-32S
let subbump_maps = []; // 50bp, 20dia
// // // let map = generate_bidirectional_Bow_Subbump_Map("test8", 50, 10, true, false);
// // // subbump_maps.push(map);
// // let map = generate_bidirectional_Bow_Subbump_Map("BoW_32-55bp-15dia-rect-full-bi-example", 55, 7.5, false, false);
// // subbump_maps.push(map);
// // map = generate_bidirectional_Bow_Subbump_Map("BoW_32-50bp-10dia-hex-full-bi-example", 50, 5, true, false);
// // subbump_maps.push(map);

// let map = generate_bidirectional_Bow_Subbump_Map("BoW_32-50bp-10dia-hex-full-bi-example", 50, 5, true, false);
// subbump_maps.push(map);
// map = generate_bidirectional_Bow_Subbump_Map("BoW_32-55bp-15dia-rect-full-bi-example", 55, 7.5, false, false);
// subbump_maps.push(map);

// PCIE
// let map = generate_bidirectional_Bow_Subbump_Map("BoW_32-40bp-20dia-hex-rect-bi-example", 40, 10, false, false);
// subbump_maps.push(map);
// map = generate_bidirectional_Bow_Subbump_Map("BoW_32-50bp-10dia-rect-hex-bi-example", 50, 5, true, false);
// subbump_maps.push(map);

// let map = generate_bidirectional_Bow_Subbump_Map("BoW_32-150bp-20dia-hex-full-bi-example", 150, 10, true, false);
// subbump_maps.push(map);
// map = generate_bidirectional_Bow_Subbump_Map("BoW_32-150bp-10dia-hex-full-bi-example", 150, 5, true, false);
// subbump_maps.push(map);
// map = generate_bidirectional_Bow_Subbump_Map("BoW_32-40bp-20dia-rect-half-bi", 40, 10, false, true);
// subbump_maps.push(map);
// map = generate_bidirectional_Bow_Subbump_Map("BoW_32-50bp-10dia-hex-half-bi", 50, 5, true, true);
// subbump_maps.push(map);
// map = generate_bidirectional_Bow_Subbump_Map("BoW_32-40bp-10dia-rect-half-bi", 40, 5, false, true);
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

// Example 1 interfaces
// const CXL_cache_protocol = new Protocol({ // not sure if math for ucie is right
//     name: "CXL.cache 1.0",
//     _id: "CXL-cache-1-example" // this is what's going to let us find these maps and attach them to chiplet interfaces
// });

// Example 2 interfaces
// const pcie_128_protocol = new Protocol({ // not sure if math for ucie is right
//     name: "PCIe 4 x128",
//     num_lanes: 128,
//     _id: "PCIe-4-128-example" // this is what's going to let us find these maps and attach them to chiplet interfaces
// });
// const pcie_64_protocol = new Protocol({ // not sure if math for ucie is right
//     name: "PCIe 4 x64",
//     num_lanes: 64,
//     _id: "PCIe-4-64-example" // this is what's going to let us find these maps and attach them to chiplet interfaces
// });

// const Bow_32_PHY = new PHY({
// 	name: "BoW-32",
// 	max_bandwidth: 16, // 128 Gb/s
// 	reach: 4,
// 	clock_type: "forwarded",
// 	_id: "BoW-32-4-example"
// });

// await PHY.insertOne(Bow_32_PHY);
// await Protocol.insertOne(pcie_64_protocol);

// generate the json file
// const chiplet_id = "chiplet4";
// const chiplet_system_chiplet_id = "epyc_example"; // "exampleSystem12"; // "8a805e9c-4ec3-4442-888b-211d74ce2ad2";
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
// const connection_input_arr = [[0, "53b6c63a-e659-422f-8168-729f3daf54e3", 1, "23a9d86b-2aba-4284-b413-d75f3e3daf0d"]];
// const chiplet_id_arr = ["f576543a-0777-402c-8609-0d2360fa3397", "98bdd758-7d63-4af1-a812-63c9cfbef34b"];
// const connection_input_arr = [[0, "2e193296-5dff-49c3-a469-203a0a7b3691", 1, "4a763223-d3ab-4be2-99d6-848b949244f8"]];

// const chiplet_id_arr = ["example8", "example8"];
// const connection_input_arr = [[0, "ca900d8f-ba4e-4655-8a3b-37a9a49ba4d5", 1, "50d17a02-2b0d-4697-aea2-896e1af7b4ec"]];

// const chiplet_id_arr = ["Simba_type_1", "Simba_type_2", "Simba_type_1",
// 						"Simba_type_2", "Simba_type_1", "Simba_type_2",
// 						"Simba_type_1", "Simba_type_2", "Simba_type_1"
// 						];
// const connection_input_arr = [
// 							[0, "east", 1, "west"],
// 							[1, "east", 2, "west"],
// 							[0, "south", 3, "north"],
// 							[1, "south", 4, "north"],
// 							[2, "south", 5, "north"],
// 							[3, "east", 4, "west"],
// 							[4, "east", 5, "west"],
// 							[3, "south", 6, "north"],
// 							[4, "south", 7, "north"],
// 							[5, "south", 8, "north"],
// 							[6, "east", 7, "west"],
// 							[7, "east", 8, "west"],
// 						];
// const chiplet_system = generate_chiplet_system("Simba_example", chiplet_id_arr, connection_input_arr);
// const options = { ordered: true };
// // console.log(chiplet_system);
// await ChipletSystem.insertMany(chiplet_system, options);
// console.log("dsljlsjldj");

// const chiplet_id_arr = ["EPYC_CCD", "EPYC_CCD", "EPYC_IOD", "EPYC_CCD", "EPYC_CCD"];
// const connection_input_arr = [
// 							[0, "bottom", 2, "ul1"],
// 							[0, "top", 2, "ul2"],
// 							[1, "top", 2, "ur1"],
// 							[1, "bottom", 2, "ur2"],
// 							[3, "bottom", 2, "bl1"],
// 							[3, "top", 2, "bl2"],
// 							[4, "top", 2, "br1"],
// 							[4, "bottom", 2, "br2"]
// 						];
// const chiplet_system = generate_chiplet_system("epyc_example", chiplet_id_arr, connection_input_arr);
// const options = { ordered: true };
// // console.log(chiplet_system);
// await ChipletSystem.insertMany(chiplet_system, options);
// console.log("dsljlsjldj");

// generate json for chiplet system netlist
const chiplet_system_chiplet_id = "epyc_example"; // "exampleSystem12"; // "8a805e9c-4ec3-4442-888b-211d74ce2ad2";
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

// note to self: first example had these qualities:
// let map = generate_bidirectional_Bow_Subbump_Map("test8", 50, 10, true, false);
// chiplet = example8
// system = exampleSystem12