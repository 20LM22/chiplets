import { faker } from '@faker-js/faker';
import { Subbump_Region } from './model/SubbumpRegion.js'

export function generateSubbumpRegion() { // generate one based on BoW
    // can also make synthetic subbump regions
};

// should also have some way to make them tx or rx patterns
export function generate_Bow_Signal_Subbump_Region(subbump_region_id, bump_pitch, diameter, hexagonal) { // generate one based on BoW
    const subbump_region = [];
    // generate it row by row
    let row1_types_regular = ["AUX", "data", "data", "data", "data", "clock", "data", "data", "data", "data", "data"];
    let row2_types_regular = ["data", "data", "data", "data", "clock", "data", "data", "data", "data", "FEC"];
    let row1_types_half = ["AUX", "data", "data", "data", "data", "clock", "data", "data", "data", "data", "data"];
    let row2_types_half = ["data", "data", "data", "data", "clock", "data", "data", "data", "data", "FEC"];
    
    // generate the row types
    const row1_types = half_slice ? row1_types_half : row1_types_regular;
    const row2_types = half_slice ? row2_types_half : row2_types_regular;

    let x_pos = 0;
    let y_pos = 0;

    // generate the first row
    for (let i = 0; i < row1_types.length; i++) { // first row is aux, d1, d3, d5, d7, ck-, d9, d11, d13, d15
        const new_bump = new Bump({ // this is 1 bump
            x_pos: x_pos,
            y_pos: y_pos,
            diameter: diameter,
            bump_type: row1_types[i],
        });
        subbump_region.push(new_bump);
        x_pos += bump_pitch;
    }

    // assume a hexagaonal layout for the moment
    x_pos = hexagonal ? 0.5*bump_pitch : 0;
    y_pos += hexagonal ? bump_pitch * Math.cos(Math.PI * (1/6)) : bump_pitch;

    // generate the second row
    for (let i = 0; i < row2_types.length; i++) { // second row is d0, d2, d4, d6, ck+, d8, d10, d12, d14, fec
        const new_bump = new Bump({ // this is 1 bump
            x_pos: x_pos,
            y_pos: y_pos,
            diameter: diameter,
            bump_type: row2_types[i],
        });
        subbump_region.push(new_bump);
        x_pos += bump_pitch;
    }
  
    const synthetic_subbump_region = new Subbump_Region({ // this is 1 subbump region
        bumps: subbump_region, // a subbump region is a list of bumps that make up the region
        _id: subbump_region_id 
    });
    
    // return the subbump region; however, it represents a document that needs to be ingested if the chiplet
    // is successfully ingested as well
    return synthetic_subbump_region;
};

// before creating the chiplet data, need to create the protocol data so that i have the ids to link to
// then afer creating the protocol data, can fill up the compatibility table as well
// the exception table is the last thing that gets created because it depends on the chiplet ids
// need the bump maps before you create the chiplets

// could make the two subbump regions more flexible by allowing the depth (i.e., number of rows) to be
// adjusted as well
export function generate_Bow_Power_Subbump_Region(subbump_region_id, bump_pitch, diameter, hexagonal, half_slice) { // generate one based on BoW
    const subbump_region = [];
    // generate it row by row
    const power_half = ["gnd", "gnd", "pwr", "pwr", "gnd", "gnd"];
    const power_regular = ["gnd", "gnd", "pwr", "pwr", "gnd", "gnd", "pwr", "pwr", "gnd", "gnd"];

    let x_pos = 0;
    let y_pos = 0;

    // generate the power row
    const power_types = half_slice ? power_half : power_regular;

    for (let i = 0; i < power_types.length; i++) { // first row is aux, d1, d3, d5, d7, ck-, d9, d11, d13, d15
        const new_bump = new Bump({ // this is 1 bump
            x_pos: x_pos,
            y_pos: y_pos,
            diameter: diameter,
            bump_type: row1_types[i],
        });
        subbump_region.push(new_bump);
        x_pos += bump_pitch;
    }
  
    const synthetic_subbump_region = new Subbump_Region({ // this is 1 subbump region
        bumps: subbump_region, // a subbump region is a list of bumps that make up the region
        subbump_region_id: subbump_region_id 
    });
    
    return synthetic_subbump_region;
};