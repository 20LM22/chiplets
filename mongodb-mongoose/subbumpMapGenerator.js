import { faker } from '@faker-js/faker';
import Subbump_Map from './model/SubbumpMap.js'

export function generateSubbumpRegion() { // generate one based on BoW
    // can also make synthetic subbump regions
};

// should also have some way to make them tx or rx patterns
export function generate_Bow_Subbump_Map(subbump_region_id, bump_pitch, radius, hexagonal, half_slice) { // generate one based on BoW
    // bumps property
    const bumps = [];

    // row options
    const row1_types_r = ["AUX", "data", "data", "data", "data", "clock", "data", "data", "data", "data"];
    const row1_names_r = ["AUX", "D1", "D3", "D5", "D7", "CK-", "D9", "D11", "D13", "D15"];
    const row2_types_r = ["data", "data", "data", "data", "clock", "data", "data", "data", "data", "FEC"];
    const row2_names_r = ["D0", "D2", "D4", "D6", "CK+", "D8", "D10", "D12", "D14", "FEC"];
    const power_r = ["gnd", "gnd", "pwr", "pwr", "gnd", "gnd", "pwr", "pwr", "gnd", "gnd"];
    
    const row1_types_half = ["AUX", "data", "data", "data", "data", "clock"];
    const row1_names_half = ["AUX", "D1", "D3", "D5", "D7", "CK-"];
    const row2_types_half = ["data", "data", "data", "data", "clock", "FEC"];
    const row2_names_half = ["D0", "D2", "D4", "D6", "CK+", "FEC"];
    const power_half = ["gnd", "gnd", "pwr", "pwr", "gnd", "gnd"];

    // decide whether full or half slice
    const power_types = half_slice ? power_half : power_r;
    const power_names = half_slice ? power_half : power_r;

    const row1_types = half_slice ? row1_types_half : row1_types_r;
    const row2_types = half_slice ? row2_types_half : row2_types_r;

    const row1_names = half_slice ? row1_names_half : row1_names_r;
    const row2_names = half_slice ? row2_names_half : row2_names_r;

    // the position of the bumps will be shifted as new bumps are added
    let x_pos = hexagonal ? 0.5*bump_pitch : 0;
    let y_pos = 0;

    // power goes father away from the chiplet edge
    for (let i = 0; i < power_types.length; i++) {
        bumps.push({
            x_pos: x_pos,
            y_pos: y_pos,
            radius: radius,
            bump_type: power_types[i],
            name: power_types[i]
        });
        x_pos += bump_pitch;
    }

    x_pos = 0;
    y_pos += hexagonal ? bump_pitch * Math.cos(Math.PI * (1/6)) : bump_pitch;

    // generate the first signal row
    for (let i = 0; i < row1_types.length; i++) { // first row is aux, d1, d3, d5, d7, ck-, d9, d11, d13, d15
        bumps.push({
            x_pos: x_pos,
            y_pos: y_pos,
            radius: radius,
            bump_type: row1_types[i],
            name: row1_names[i]
        });
        x_pos += bump_pitch;
    }

    x_pos = hexagonal ? 0.5*bump_pitch : 0;
    y_pos += hexagonal ? bump_pitch * Math.cos(Math.PI * (1/6)) : bump_pitch;

    // generate the second signal row
    for (let i = 0; i < row2_types.length; i++) { // second row is d0, d2, d4, d6, ck+, d8, d10, d12, d14, fec
        bumps.push({
            x_pos: x_pos,
            y_pos: y_pos,
            radius: radius,
            bump_type: row2_types[i],
            name: row2_names[i]
        });
        x_pos += bump_pitch;
    }

    const synthetic_subbump_map = new Subbump_Map({ // this is 1 subbump region
        bumps: bumps, // a subbump region is a list of bumps that make up the region
        // BoW requires 0.75V support, can deviate but needs to still support 0.75V
        voltage_domain: { operational_v: "0.75", is_range: false },
        clk_domain: {operational_clk: faker.helpers.arrayElement(['250', '500', '1000']), is_range: false}, // TXclk vs pclk --> txclk is specific
        _id: subbump_region_id // this is what's going to let us find these maps and attach them to chiplet interfaces
    });
    
    // return the subbump map
    return synthetic_subbump_map;
};

// before creating the chiplet data, need to create the protocol data so that i have the ids to link to
// then afer creating the protocol data, can fill up the compatibility table as well
// the exception table is the last thing that gets created because it depends on the chiplet ids
// need the bump maps before you create the chiplets

// could make the two subbump regions more flexible by allowing the depth (i.e., number of rows) to be
// adjusted as well