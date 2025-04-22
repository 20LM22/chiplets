import { faker } from '@faker-js/faker';
import Chiplet from './model/Chiplet.js';
import mongoose from 'mongoose';
import * as fs from "fs";
import SubbumpMap from './model/SubbumpMap.js';
import ChipletSystem from './model/ChipletSystem.js';

export async function export_chiplet_bumpmap(chiplet_system_chiplet_id, chiplet_id) { // first is the id of the chiplet system, the second is the specific index of the chiplet ON THAT SYSTEM
    // aggregated bump map
    const bump_arr = [];

    // need to get the uuid of the chiplet that stored in the chiplet system
    const chiplet_system = await ChipletSystem.findById(chiplet_system_chiplet_id).exec();
    const chiplet_doc_id = chiplet_system.chiplets.id(chiplet_id).chiplet_doc;
     
    // query with the chiplet_id
    const chiplet = await Chiplet.findById(chiplet_doc_id).exec();

    const bump_regions = chiplet.bump_regions; // an array
    // const bump_counter = 0;

    for (let i = 0; i < bump_regions.length; i++) { // iterate over all the bump regions to produce a unified bump map
        const bump_region = bump_regions[i];
        const offset_x = bump_region.offset[0]; // 2d array of x, y offsets
        const offset_y = bump_region.offset[1]; // 2d array of x, y offsets
        const subbump_map = await SubbumpMap.findById(bump_region.subbump_map_id);
        // console.log(subbump_map);
        const bump_counter = 0;
        for (let j = 0; j < subbump_map.bumps.length; j++) { // iterate over all the bumps in this subbump map
            const bump = subbump_map.bumps[j]; // each bump object
            let x_pos = bump.x_pos;
            let y_pos = bump.y_pos;

            if (bump_region.flipped) {
                x_pos = -x_pos;
            }

            if (bump_region.rotation == 90) { // all rotations will be clockwise
                const old_x_pos = x_pos;
                x_pos = -y_pos;
                y_pos = old_x_pos;
            } else if (bump_region.rotation == 180) {
                x_pos = -x_pos;
                y_pos = -y_pos;
            } else if (bump_region.rotation == 270) {
                const old_x_pos = x_pos;
                x_pos = y_pos;
                y_pos = -old_x_pos;
            }

            const b = {
                x_pos: Math.round(1000*(x_pos + 1000*offset_x)), // for now assume no rotation, reflection
                y_pos: Math.round(1000*(y_pos + 1000*offset_y)),
                radius: Math.round(bump.radius*1000),
                name: bump.name,
                id: chiplet_id + ".bumpregion." + bump_region._id + ".bump" + bump._id // bump.count
            };
            bump_arr.push(b);
        }
    }

    const export_bumpmap = {
        chiplet_height: Math.round(chiplet.height*1000000),
        chiplet_width: Math.round(chiplet.width*1000000),
        bumps: bump_arr
    };

    const bump_map_json = JSON.stringify(export_bumpmap);

    fs.writeFile('./subbump_map.json', bump_map_json, err => {
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

// export async function export_chiplet_bumpmap(chiplet_id) { // first is the id of the chiplet system, the second is the specific index of the chiplet
//     // aggregated bump map
//     const bump_arr = [];

//     // query with the chiplet_id
//     const chiplet = await Chiplet.findById(chiplet_id).exec();

//     const bump_regions = chiplet.bump_regions; // an array

//     for (let i = 0; i < bump_regions.length; i++) { // iterate over all the bump regions to produce a unified bump map
//         const bump_region = bump_regions[i];
//         const offset_x = bump_region.offset[0]; // 2d array of x, y offsets
//         const offset_y = bump_region.offset[1]; // 2d array of x, y offsets
//         const subbump_map = await SubbumpMap.findById(bump_region.subbump_map_id);
//         console.log(subbump_map);
//         for (let j = 0; j < subbump_map.bumps.length; j++) { // iterate over all the bumps in this subbump map
//             const bump = subbump_map.bumps[j]; // each bump object
//             let x_pos = bump.x_pos;
//             let y_pos = bump.y_pos;

//             if (bump_region.flipped) {
//                 x_pos = -x_pos;
//             }

//             if (bump_region.rotation == 90) { // all rotations will be clockwise
//                 const old_x_pos = x_pos;
//                 x_pos = -y_pos;
//                 y_pos = old_x_pos;
//             } else if (bump_region.rotation == 180) {
//                 x_pos = -x_pos;
//                 y_pos = -y_pos;
//             } else if (bump_region.rotation == 270) {
//                 const old_x_pos = x_pos;
//                 x_pos = y_pos;
//                 y_pos = -old_x_pos;
//             }

//             const b = {
//                 x_pos: Math.round(1000*(x_pos + 1000*offset_x)), // for now assume no rotation, reflection
//                 y_pos: Math.round(1000*(y_pos + 1000*offset_y)),
//                 radius: Math.round(bump.radius*1000),
//                 name: bump.name,
//                 id: bump._id
//             };
//             bump_arr.push(b);
//         }
//     }

//     const export_bumpmap = {
//         chiplet_height: Math.round(chiplet.height*1000000),
//         chiplet_width: Math.round(chiplet.width*1000000),
//         bumps: bump_arr
//     };

//     console.log(chiplet.height);
//     console.log(chiplet.width);

//     const bump_map_json = JSON.stringify(export_bumpmap);

//     fs.writeFile('./subbump_map.json', bump_map_json, err => {
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