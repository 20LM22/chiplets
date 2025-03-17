import { faker } from '@faker-js/faker';

export default function generateSubbumpRegion() { // generate one based on BoW
    const bump_pitch = faker.number.float({ min: -5, max: 2000, fractionDigits: 2 }) + " " + faker.helpers.arrayElement(['mm', 'um', 'cm', 'nm']);

  
    const bumpSchema = new bump({
        x_pos: Number,
        y_pos: Number,
        diameter: Number,
        bump_type: String,
        _id: false
    });

    const synthetic_subbump_region = new Subbump_Region({ // this is 1 subbump region
        bumps: [bumpSchema], // a subbump region is a list of bumps that make up the region
        subbump_region_id: String 
    });
    
    return synthetic_subbump_region;
};

export default function generateBOWSubbumpRegion() { // generate one based on BoW
    const subbump_region = [];
    // generate it row by row
    let row1_types = ["AUX", "data", "data", "data", "data", "clock", "data", "data", "data", "data", "data"];
    let row2_types = ["data", "data", "data", "data", "clock", "data", "data", "data", "data", "FEC"];
    let row3_types = ["gnd", "gnd", "pwr", "pwr", "gnd", "gnd", "pwr", "pwr", "gnd", "gnd"];
    let bump_pitch = 2; // find out what the actual pitch should be
    let diameter = 20; // units of um

    let x_pos = 0;
    let y_pos = 0;

    for (let i = 0; i < 10; i++) { // first row is aux, d1, d3, d5, d7, ck-, d9, d11, d13, d15
        // each time through x and y need to be updated based on the bump pitch
        // it depends on hexagonal or square since hexagonal you need to do some math
        const new_bump = new Bump({ // this is 1 chiplet
            x_pos: x_pos,
            y_pos: y_pos,
            diameter: diameter,
            bump_type: row1_types[i],
        });
        subbump_region.push(bump);
    }
  
    const synthetic_subbump_region = new Subbump_Region({ // this is 1 subbump region
        bumps: [bumpSchema], // a subbump region is a list of bumps that make up the region
        subbump_region_id: String 
    });
    
    return synthetic_subbump_region;
};

// before creating the chiplet data, need to create the protocol data so that i have the ids to link to
// then afer creating the protocol data, can fill up the compatibility table as well
// the exception table is the last thing that gets created because it depends on the chiplet ids
// need the bump maps before you create the chiplets