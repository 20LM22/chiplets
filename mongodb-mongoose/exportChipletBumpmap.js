import { faker } from '@faker-js/faker';
import Chiplet from './model/Chiplet.js';
import mongoose from 'mongoose';
import * as fs from "fs";
import Subbump_Map from './model/SubbumpMap.js';

export async function export_chiplet_bumpmap(chiplet_id) {
    // aggregated bump map
    const bump_arr = [];

    // query with the chiplet_id
    const chiplet = await Chiplet.findById(chiplet_id).exec();

    const bump_regions = chiplet.bump_regions; // an array
    // console.log(bump_regions);

    for (let i = 0; i < bump_regions.length; i++) { // iterate over all the bump regions to produce a unified bump map
        const bump_region = bump_regions[i];
        const offset_x = bump_region.offset[0]; // 2d array of x, y offsets
        const offset_y = bump_region.offset[1]; // 2d array of x, y offsets
        // console.log(bump_region.subbump_map_id);
        const subbump_map = await Subbump_Map.findById(bump_region.subbump_map_id);
        // console.log(subbump_map);
        for (let j = 0; j < subbump_map.bumps.length; j++) { // iterate over all the bumps in this subbump map
            const bump = subbump_map.bumps[j]; // each bump object
            // set up each bump object
            console.log(bump);
            const b = {
                x_pos: Math.round(1000*(bump.x_pos + 1000*offset_x)), // for now assume no rotation, reflection
                y_pos: Math.round(1000*(bump.y_pos + 1000*offset_y)),
                radius: Math.round(bump.radius*1000),
                name: bump.name
            };
            bump_arr.push(b);
        }
    }

    const export_bumpmap = {
        chiplet_height: Math.round(chiplet.height*1000000),
        chiplet_width: Math.round(chiplet.width*1000000),
        bumps: bump_arr
    };

    console.log(chiplet.height);
    console.log(chiplet.width);

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

    /*
    exported version should look like this:
    {
        bumps: [
            {
                x_pos:
                y_pos:
                radius:
                name/type:
            }
        ]    
    
    }
    */
};