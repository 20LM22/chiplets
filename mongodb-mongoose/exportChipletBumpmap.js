import { faker } from '@faker-js/faker';
import Chiplet from './model/Chiplet.js';
import mongoose from 'mongoose';
import * as fs from "fs";

export function export_chiplet_bumpmap() {
    
    const out = JSON.stringify(bump_map);
    fs.writeFile();

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
    return synthetic_chiplet;
};