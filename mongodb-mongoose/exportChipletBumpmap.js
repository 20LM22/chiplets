import { faker } from '@faker-js/faker';
import Chiplet from './model/Chiplet.js';
import mongoose from 'mongoose';
import * as fs from "fs";
import Subbump_Map from './model/SubbumpMap.js';

export async function export_chiplet_bumpmap(chiplet_id) {
    mongoose.connect("mongodb+srv://Lauren:dtuk2o8uCrB4FYFa@chipletrepository.rgz8c.mongodb.net/chiplet_repository")
    // aggregated bump map
    const bump_arr = [];

    // query with the chiplet_id
    const chiplet = await Chiplet.findById(chiplet_id);
    console.log(chiplet);
    // const bump_regions = chiplet.bump_regions; // an array

    // for (let i = 0; i < bump_regions.length; i++) { // iterate over all the bump regions to produce a unified bump map
    //     const bump_region = bump_regions[i];
    //     const offset_x = bump_region.offset[0]; // 2d array of x, y offsets
    //     const offset_y = bump_region.offset[1]; // 2d array of x, y offsets
    //     const subbump_map = await Subbump_Map.findById(bump_region.subbump_map_id).exec();
    //     for (let j = 0; j < subbump_map.bumps.length; j++) { // iterate over all the bumps in this subbump map
    //         const bump = subbump_map.bumps[i]; // each bump object
    //         // set up each bump object
    //         const b = {
    //             x_pos: bump.x_pos + offset_x, // for now assume no rotation, reflection
    //             y_pos: bump.y_pos + offset_y,
    //             radius: bump.radius,
    //             name: bump.name
    //         };
    //         bump_arr.push(b);
    //     }
    // }

    // const bump_map_json = JSON.stringify(bump_arr);

    // fs.writeFile('./subbump_map.json.json', bump_map_json, err => {
    //     if (err) {
    //         console.error(err);
    //     } else {
    //         return "success";
    //     }
    // });

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