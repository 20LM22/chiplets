import { faker } from '@faker-js/faker';
import Subbump_Map from './model/SubbumpMap.js'
import Chiplet from './model/Chiplet.js';
import * as fs from "fs";
import ChipletSystem from './model/ChipletSystem.js';

export async function export_netlist(chiplet_system_chiplet_id) {
    // aggregated bump map
    const netlist_arr = [];
    let counter = 0;

    // query with the chiplet_ids
    const chiplet_system = await ChipletSystem.findById(chiplet_system_chiplet_id).exec();
    const chiplets = chiplet_system.chiplets;
    const chiplet_connections = chiplet_system.chiplet_connections;
    // console.log(chiplet_connections);

    // track the ground pins
    const ground_bumps = [];
    const pwr_bumps = [];

    // interface connections looks like ["interface id of chiplet a", "interface id of chiplet b"]
    for (let i = 0; i < chiplet_connections.length; i++) {
        // interfaces
        // console.log(chiplet_connections);
        const chiplet_a_interface_id = chiplet_connections[i].connection[0]; // chiplet0.osdoiuouoi
        const chiplet_b_interface_id = chiplet_connections[i].connection[1]; // chiplet1.ljoiuouoi
        // console.log(chiplet_a_interface_id);

        const chiplet_a_id = chiplet_a_interface_id.split(".")[0]; // chiplet0
        const chiplet_a_interface_uuid = chiplet_a_interface_id.split(".")[1]; // osdoiuouoi

        const chiplet_b_id = chiplet_b_interface_id.split(".")[0]; // chiplet1
        const chiplet_b_interface_uuid = chiplet_b_interface_id.split(".")[1]; // ljoiuouoi

        const chiplet_a_doc = chiplets.id(chiplet_a_id).chiplet_doc; // iuwooiejo
        const chiplet_b_doc = chiplets.id(chiplet_b_id).chiplet_doc; // poweipoip

        const chiplet_a = await Chiplet.findById(chiplet_a_doc).exec();
        const chiplet_b = await Chiplet.findById(chiplet_b_doc).exec();

        const interface_a_doc = chiplet_a.interfaces.id(chiplet_a_interface_uuid);
        const bump_region_a_id = interface_a_doc.bump_region;
        const interface_b_doc = chiplet_b.interfaces.id(chiplet_b_interface_uuid);
        const bump_region_b_id = interface_b_doc.bump_region;

        const bump_region_a_doc = chiplet_a.bump_regions.id(bump_region_a_id);
        const bump_region_b_doc = chiplet_b.bump_regions.id(bump_region_b_id);

        const subbump_map_a = await Subbump_Map.findById(bump_region_a_doc.subbump_map_id);
        const subbump_map_b = await Subbump_Map.findById(bump_region_b_doc.subbump_map_id);

        // BoW_32, full, rx/tx must match
        // if (bump_region_a_doc.subbump_map_id.endsWith("-tx") && !bump_region_b_doc.subbump_map_id.endsWith("-rx")) {
        //     // throw error
        //     console.log("not tx, rx");
        // } else if (bump_region_a_doc.subbump_map_id.endsWith("-rx") && !bump_region_b_doc.subbump_map_id.endsWith("-tx")) {
        //     // throw error
        //     console.log("not tx, rx");
        // }

        // if (bump_region_a_doc.subbump_map_id.includes("full") && !bump_region_b_doc.subbump_map_id.includes("full")) {
        //     // throw error
        //     console.log("not full, full");
        // } else if (bump_region_a_doc.subbump_map_id.includes("half") && !bump_region_b_doc.subbump_map_id.includes("half")) {
        //     // throw error
        //     console.log("not half, half");
        // }
    
        // at this point, you've confirmed that the bump maps are compatible, just need to link them
        // iterate over all the bumps in the a bumpmap and find the corresponding one in the b bumpmap to link to
        for (let i = 0; i < subbump_map_a.bumps.length; i++) {
            const bump_a = subbump_map_a.bumps[i]; // each bump object in a
            // get this bump's name
            const name_a = bump_a.name;
            if (bump_a.bump_type === "gnd") { // || bump_a.bump_type === "pwr") {
                const gnd_bump = chiplet_a_id + ".bumpregion." + bump_region_a_id + ".bump" + bump_a.count;
                ground_bumps.push(gnd_bump);
                continue;
            }
            if (bump_a.bump_type === "pwr") {
                const pwr_bump = [chiplet_a_id + ".bumpregion." + bump_region_a_id + ".bump" + bump_a.count,
                    bump_a.voltage_domain
                ];
                pwr_bumps.push(pwr_bump);
                continue;
            }
            // now search the b map for one with the same name
            for (let j = 0; j < subbump_map_b.bumps.length; j++) {
                if (subbump_map_b.bumps[j].name === name_a) {
                    // now you have both bump a id and bump b id, need to put them into a net object together
                    const n = {
                        id: counter, // autoincrement
                        net_pads: [chiplet_a_id + ".bumpregion." + bump_region_a_id + ".bump" + bump_a.count,
                            chiplet_b_id + ".bumpregion." + bump_region_b_id + ".bump" + subbump_map_b.bumps[j].count]
                    };
                    counter++;
                    netlist_arr.push(n);
                    break;
                }
            }
        }

        for (let i = 0; i < subbump_map_b.bumps.length; i++) {
            const bump_b = subbump_map_b.bumps[i];
            if (bump_b.bump_type === "gnd") {
                const gnd_bump = chiplet_b_id + ".bumpregion." + bump_region_b_id + ".bump" + bump_b.count;
                ground_bumps.push(gnd_bump);
            }
            if (bump_b.bump_type === "pwr") {
                const pwr_bump = [chiplet_b_id + ".bumpregion." + bump_region_b_id + ".bump" + bump_b.count,
                    bump_b.voltage_domain
                ];
                pwr_bumps.push(pwr_bump);
                continue;
            }
        }
    }

    // add in the ground bumps
    const n = {
        id: counter, // autoincrement
        net_pads: ground_bumps
    };
    counter++;
    netlist_arr.push(n);

    // add in the power bumps
    let pwr_domains = []; // list of lists
    let inserted_pwr_domains = [];

    for (let i = 0; i < pwr_bumps.length; i++) {
        const pwr_bump_id = pwr_bumps[i][0];
        const bump_v_domain = pwr_bumps[i][1];
        const x = search_pwr_domains(inserted_pwr_domains, bump_v_domain);
        if (x != -1) {
            pwr_domains[x].push(pwr_bump_id);
        } else {
            let v_arr = [pwr_bump_id];
            pwr_domains.push(v_arr);
            inserted_pwr_domains.push(bump_v_domain);
        }
    }

    for (let i = 0; i < pwr_domains.length; i++) {
        const p = {
            id: counter, // autoincrement
            net_pads: pwr_domains[i]
        };
        counter++;
        netlist_arr.push(p);
    }

    const netlist_var = {
        netlist: netlist_arr
    };

    const netlist_json = JSON.stringify(netlist_var);

    fs.writeFile('./netlist.json', netlist_json, err => {
        if (err) {
            return new Promise((resolve, reject) => {
                reject(new Error('File could not be saved'));
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve("success");
            });
        }
    });
}

function search_pwr_domains(inserted_pwr_domains, bump_v_domain) {
    for (let i = 0; i < inserted_pwr_domains.length; i++) {
        if (bump_v_domain.is_range && inserted_pwr_domains[i].is_range) { // this is a range
            if (bump_v_domain.min_operational_v == inserted_pwr_domains[i].min_operational_v && bump_v_domain.min_operational_v != undefined
            && bump_v_domain.max_operational_v == inserted_pwr_domains[i].max_operational_v && bump_v_domain.max_operational_v != undefined) {
                return i;
            }
        }
        else if (!bump_v_domain.is_range && !inserted_pwr_domains[i].is_range) { // this is an operational voltage
            if (bump_v_domain.operational_v == inserted_pwr_domains[i].operational_v && bump_v_domain.operational_v != undefined) {
                return i;
            }
        }
    } return -1;
}

// export async function export_netlist(chiplet_a_id, chiplet_b_id, interface_connections) {
//     // aggregated bump map
//     const netlist_arr = [];
//     let counter = 0;

//     // query with the chiplet_ids
//     const chiplet_a = await Chiplet.findById(chiplet_a_id).exec();
//     const chiplet_b = await Chiplet.findById(chiplet_b_id).exec();

//     // track the ground pins
//     const ground_bumps = [];
//     const pwr_bumps = [];

//     // interface connections looks like ["interface id of chiplet a", "interface id of chiplet b"]
//     console.log(interface_connections.length);
//     for (let i = 0; i < interface_connections.length; i++) {
//         // interfaces
//         const interface_id_a = interface_connections[i][0];
//         const interface_id_b = interface_connections[i][1];

//         const interface_a_doc = chiplet_a.interfaces.id(interface_id_a);
//         const bump_region_a_id = interface_a_doc.bump_region;
//         const interface_b_doc = chiplet_b.interfaces.id(interface_id_b);
//         const bump_region_b_id = interface_b_doc.bump_region;

//         const bump_region_a_doc = chiplet_a.bump_regions.id(bump_region_a_id);
//         const bump_region_b_doc = chiplet_b.bump_regions.id(bump_region_b_id);
//         // console.log(bump_region_a_doc.subbump_map_id);

//         const subbump_map_a = await Subbump_Map.findById(bump_region_a_doc.subbump_map_id);
//         // console.log(subbump_map_a);
//         // const test = await Subbump_Map.findById("BoW_32-40bp-10dia-rect-full-rx");
//         // console.log(test);
//         const subbump_map_b = await Subbump_Map.findById(bump_region_b_doc.subbump_map_id);

//         // BoW_32, full, rx/tx must match
//         if (bump_region_a_doc.subbump_map_id.endsWith("-tx") && !bump_region_b_doc.subbump_map_id.endsWith("-rx")) {
//             // throw error
//             console.log("not tx, rx");
//         } else if (bump_region_a_doc.subbump_map_id.endsWith("-rx") && !bump_region_b_doc.subbump_map_id.endsWith("-tx")) {
//             // throw error
//             console.log("not tx, rx");
//         }

//         if (bump_region_a_doc.subbump_map_id.includes("full") && !bump_region_b_doc.subbump_map_id.includes("full")) {
//             // throw error
//             console.log("not full, full");
//         } else if (bump_region_a_doc.subbump_map_id.includes("half") && !bump_region_b_doc.subbump_map_id.includes("half")) {
//             // throw error
//             console.log("not half, half");
//         }
    
//         // at this point, you've confirmed that the bump maps are compatible, just need to link them
//         // iterate over all the bumps in the a bumpmap and find the corresponding one in the b bumpmap to link to
//         for (let i = 0; i < subbump_map_a.bumps.length; i++) {
//             const bump_a = subbump_map_a.bumps[i]; // each bump object in a
//             // get this bump's name
//             const name_a = bump_a.name;
//             if (bump_a.bump_type === "gnd") {
//                 ground_bumps.push(bump_a._id);
//                 continue;
//             } else if (bump_a.bump_type === "pwr") {
//                 console.log("power bump encountered: " + bump_a._id);
//                 pwr_bumps.push(bump_a._id);
//                 continue;
//             }
//             // now search the b map for one with the same name
//             // how to handle power and ground though? omit for now
//             for (let j = 0; j < subbump_map_b.bumps.length; j++) {
//                 if (subbump_map_b.bumps[j].name === name_a) {
//                     // now you have both bump a id and bump b id, need to put them into a net object together
//                     const n = {
//                         id: counter, // autoincrement
//                         net_pads: [bump_a._id, subbump_map_b.bumps[j]._id]
//                     };
//                     counter++;
//                     netlist_arr.push(n);
//                     break;
//                 }
//             }
//         }

//         for (let i = 0; i < subbump_map_b.bumps.length; i++) {
//             const bump_b = subbump_map_b.bumps[i]; // each bump object in a
//             // get this bump's name
//             if (bump_b.bump_type === "gnd") {
//                 ground_bumps.push(bump_b._id);
//                 continue;
//             } else if (bump_b.bump_type === "pwr") {
//                 pwr_bumps.push(bump_b._id);
//                 continue;
//             }
//         }

//         if (pwr_bumps.length!=0) {
//             const n = {
//                 id: counter, // autoincrement
//                 net_pads: pwr_bumps
//             };
//             netlist_arr.push(n);
//             counter++;
//         }
//         if (ground_bumps.length!=0) {
//             const n = {
//                 id: counter, // autoincrement
//                 net_pads: ground_bumps
//             };
//             netlist_arr.push(n);
//             counter++;
//         }
//     }

//     const netlist_var = {
//         netlist: netlist_arr
//     };

//     const netlist_json = JSON.stringify(netlist_var);

//     fs.writeFile('./netlist.json', netlist_json, err => {
//         if (err) {
//             return new Promise((resolve, reject) => {
//                 reject(new Error('File could not be saved'));
//             });
//         } else {
//             return new Promise((resolve, reject) => {
//                 resolve("success");
//             });
//         }
//     });
// }