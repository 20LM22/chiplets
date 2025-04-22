import { faker } from '@faker-js/faker';
import SubbumpMap from './model/SubbumpMap.js'

// should also have some way to make them tx or rx patterns
export function generate_bidirectional_Bow_Subbump_Map(subbump_region_id, bump_pitch, radius, hexagonal, half_slice) { // generate one based on BoW
    // bumps property
    const bumps = [];
    // let counter = 0;

    // row options
    const row1_types_r = ["AUX", "data", "data", "data", "data", "clock", "data", "data", "data", "data", "FEC", "data", "data", "data", "data", "clock", "data", "data", "data", "data"];
    const row1_names_r = ["AUX", "D1", "D3", "D5", "D7", "CK-", "D9", "D11", "D13", "D15", "FEC", "D14", "D12", "D10", "D8", "CK+", "D6", "D4", "D2", "D0"];
    const power_r = ["gnd", "gnd", "pwr", "pwr", "gnd", "gnd", "pwr", "pwr", "gnd", "gnd", "gnd", "gnd", "pwr", "pwr", "gnd", "gnd", "pwr", "pwr", "gnd", "gnd"];
    
    const row1_types_half = ["AUX", "data", "data", "data", "data", "clock", "FEC", "clock", "data", "data", "data", "data"];
    const row1_names_half = ["AUX", "D1", "D3", "D5", "D7", "CK-", "FEC", "CK+", "D6", "D4", "D2", "D0"];
    const power_half = ["gnd", "gnd", "pwr", "pwr", "gnd", "gnd", "gnd", "gnd", "pwr", "pwr", "gnd", "gnd"];

    // decide whether full or half slice
    const power_types = half_slice ? power_half : power_r;

    const row1_types = half_slice ? row1_types_half
                    :  row1_types_r;

    const row1_names = half_slice ? row1_names_half
                    :  row1_names_r;

    // the position of the bumps will be shifted as new bumps are added
    let x_pos = 0;
    let y_pos = 0;

    // generate the first signal row
    let index = 0; // figure out if we should start from the beginning or the end
    for (let i = 0; i < row1_types.length*2; i++) { // first row is aux, d1, d3, d5, d7, ck-, d9, d11, d13, d15
        const unit_name = (i < row1_types.length/2 || (i >= row1_types.length && i < row1_types.length*1.5)) ? "tx" : "rx";
        const unit_counter = (i >= row1_types.length/2 && i < row1_types.length*1.5) ? 1 : 0;
        bumps.push({
            x_pos: x_pos,
            y_pos: y_pos,
            radius: radius,
            bump_type: row1_types[index],
            name: row1_names[index],
            _id: unit_name + unit_counter + "." + row1_names[index], // faker.string.uuid(),
            // count: counter,
            // BoW requires 0.75V support, can deviate but needs to still support 0.75V
            voltage_domain: { operational_v: 0.75, is_range: false },
            clk_domain: {operational_clk: faker.helpers.arrayElement([250, 500, 1000]), is_range: false}, // TXclk vs pclk --> txclk is specific
        });
        // counter++;
        x_pos += bump_pitch;
        index = (index + 1) % row1_types.length;
    }
    
    // console.log("how many bumps after row 1: " + counter);

    x_pos = hexagonal ? 0.5*bump_pitch : 0;
    y_pos += hexagonal ? bump_pitch * Math.cos(Math.PI * (1/6)) : bump_pitch;

    // generate the second signal row
    index = row1_types.length-1; // figure out if we should start from the beginning or the end

    for (let i = 0; i < row1_types.length*2; i++) { // second row is d0, d2, d4, d6, ck+, d8, d10, d12, d14, fec
        const unit_name = (i < row1_types.length/2 || (i >= row1_types.length && i < row1_types.length*1.5))? "tx" : "rx";
        // console.log("i is: " + i);
        const unit_counter = (i >= row1_types.length/2 && i < row1_types.length*1.5) ? 1 : 0;
        // console.log("unit name and counter: " + unit_name + " " + unit_counter);
        bumps.push({
            x_pos: x_pos,
            y_pos: y_pos,
            radius: radius,
            bump_type: row1_types[index],
            name: row1_names[index],
            _id: unit_name + unit_counter + "." + row1_names[index], // faker.string.uuid(),
            // count: counter,
            // BoW requires 0.75V support, can deviate but needs to still support 0.75V
            voltage_domain: { operational_v: 0.75, is_range: false },
            clk_domain: {operational_clk: faker.helpers.arrayElement([250, 500, 1000]), is_range: false}, // TXclk vs pclk --> txclk is specific
        });
        // counter++;
        x_pos += bump_pitch;
        index = index - 1 < 0 ? row1_types.length-1 : index-1;
    }

    // console.log("how many bumps after row 2: " + counter);

    x_pos = 0;
    y_pos += hexagonal ? bump_pitch * Math.cos(Math.PI * (1/6)) : bump_pitch;
    index = 0;

    // power goes father away from the chiplet edge
    let counter = 0;
    for (let i = 0; i < power_types.length*2; i++) {
        const unit_name = (i < row1_types.length/2 || (i >= row1_types.length && i < row1_types.length*1.5)) ? "tx" : "rx";
        const unit_counter = (i >= row1_types.length/2 && i < row1_types.length*1.5) ? 1 : 0;
        // console.log("unit counter is: " + unit_counter);
        bumps.push({
            x_pos: x_pos,
            y_pos: y_pos,
            radius: radius,
            bump_type: power_types[index],
            name: power_types[index],
            _id: unit_name + unit_counter + "." + power_types[index] + counter, // faker.string.uuid(),
            // count: counter,                      
            // BoW requires 0.75V support, can deviate but needs to still support 0.75V
            voltage_domain: { operational_v: 0.75, is_range: false },
            clk_domain: {operational_clk: faker.helpers.arrayElement([250, 500, 1000]), is_range: false}, // TXclk vs pclk --> txclk is specific
        });
        counter++;
        x_pos += bump_pitch;
        index = (index + 1) % row1_types.length;
    }

    // console.log("how many bumps after row 3: " + counter);

    const synthetic_subbump_map = new SubbumpMap({ // this is 1 subbump region
        width: x_pos,
        height: y_pos,
        bumps: bumps, // a subbump region is a list of bumps that make up the region
        _id: subbump_region_id // this is what's going to let us find these maps and attach them to chiplet interfaces
    });

    // return the subbump map
    // console.log(synthetic_subbump_map);
    return synthetic_subbump_map;
};

// should also have some way to make them tx or rx patterns
export function generate_unidirectional_Bow_Subbump_Map(subbump_region_id, bump_pitch, radius, hexagonal, half_slice, tx) { // generate one based on BoW
    // bumps property
    const bumps = [];
    // let counter = 0;

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

    const row1_types = tx && half_slice ? row1_types_half
                    :  tx && !half_slice ? row1_types_r
                    :  !tx && half_slice ? row2_types_half
                    :  row2_types_r // aka !tx and !half_slice

    const row2_types = tx && half_slice ? row2_types_half
                    :  tx && !half_slice ? row2_types_r
                    :  !tx && half_slice ? row1_types_half
                    :  row1_types_r // aka !tx and !half_slice

    const row1_names = tx && half_slice ? row1_names_half
                    :  tx && !half_slice ? row1_names_r
                    :  !tx && half_slice ? row2_names_half
                    :  row2_names_r // aka !tx and !half_slice  

    const row2_names = tx && half_slice ? row2_names_half
                    :  tx && !half_slice ? row2_names_r
                    :  !tx && half_slice ? row1_names_half
                    :  row1_names_r // aka !tx and !half_slice

    const unit_name = tx ? 'tx' : 'rx';
    const unit_counter = 0;

    // the position of the bumps will be shifted as new bumps are added
    let x_pos = 0; // hexagonal ? 0.5*bump_pitch : 0;
    let y_pos = 0;

    // generate the first signal row
    let index = tx ? 0 : row1_types.length-1; // figure out if we should start from the beginning or the end

    for (let i = 0; i < row1_types.length; i++) { // first row is aux, d1, d3, d5, d7, ck-, d9, d11, d13, d15
        bumps.push({
            x_pos: x_pos,
            y_pos: y_pos,
            radius: radius,
            bump_type: row1_types[index],
            name: row1_names[index],
            _id: unit_name + unit_counter + "." + row1_names[index], // faker.string.uuid(),
            // count: counter,
            // BoW requires 0.75V support, can deviate but needs to still support 0.75V
            voltage_domain: { operational_v: 0.75, is_range: false },
            clk_domain: {operational_clk: faker.helpers.arrayElement([250, 500, 1000]), is_range: false}, // TXclk vs pclk --> txclk is specific
        });
        // counter++;
        x_pos += bump_pitch;
        index = tx ? index + 1 : index - 1;
    }

    x_pos = hexagonal ? 0.5*bump_pitch : 0;
    y_pos += hexagonal ? bump_pitch * Math.cos(Math.PI * (1/6)) : bump_pitch;

    // generate the second signal row
    index = tx ? 0 : row1_types.length-1; // figure out if we should start from the beginning or the end

    for (let i = 0; i < row2_types.length; i++) { // second row is d0, d2, d4, d6, ck+, d8, d10, d12, d14, fec
        bumps.push({
            x_pos: x_pos,
            y_pos: y_pos,
            radius: radius,
            bump_type: row2_types[index],
            name: row2_names[index],
            _id: unit_name + unit_counter + "." + row2_names[index], // faker.string.uuid(),
            // count: counter,
            // BoW requires 0.75V support, can deviate but needs to still support 0.75V
            voltage_domain: { operational_v: 0.75, is_range: false },
            clk_domain: {operational_clk: faker.helpers.arrayElement([250, 500, 1000]), is_range: false}, // TXclk vs pclk --> txclk is specific
        });
        // counter++;
        x_pos += bump_pitch;
        index = tx ? index + 1 : index - 1;
    }

    x_pos = 0;
    y_pos += hexagonal ? bump_pitch * Math.cos(Math.PI * (1/6)) : bump_pitch;

    // power goes father away from the chiplet edge
    let count = 0;
    for (let i = 0; i < power_types.length; i++) {
        bumps.push({
            x_pos: x_pos,
            y_pos: y_pos,
            radius: radius,
            bump_type: power_types[i],
            name: power_types[i],
            _id: unit_name + unit_counter + "." + power_types[index] + count, // faker.string.uuid(),
            // count: counter,
            // BoW requires 0.75V support, can deviate but needs to still support 0.75V
            voltage_domain: { operational_v: 0.75, is_range: false },
            clk_domain: {operational_clk: faker.helpers.arrayElement([250, 500, 1000]), is_range: false}, // TXclk vs pclk --> txclk is specific
        });
        count++;
        x_pos += bump_pitch;
    }

    const synthetic_subbump_map = new SubbumpMap({ // this is 1 subbump region
        width: x_pos,
        height: y_pos,
        bumps: bumps, // a subbump region is a list of bumps that make up the region
        _id: subbump_region_id // this is what's going to let us find these maps and attach them to chiplet interfaces
    });

    // return the subbump map
    // console.log(synthetic_subbump_map);
    return synthetic_subbump_map;
};

// before creating the chiplet data, need to create the protocol data so that i have the ids to link to
// then afer creating the protocol data, can fill up the compatibility table as well
// the exception table is the last thing that gets created because it depends on the chiplet ids
// need the bump maps before you create the chiplets

// could make the two subbump regions more flexible by allowing the depth (i.e., number of rows) to be
// adjusted as well