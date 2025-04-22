import { faker } from '@faker-js/faker';
import Chiplet from './model/Chiplet.js';
import ChipletSystem from './model/ChipletSystem.js';
import mongoose from 'mongoose';

export function generate_chiplet_system(system_id, chiplet_id_arr, connection_input_arr) {

    const chiplet_arr = [];
    for (let i = 0; i < chiplet_id_arr.length; i++) {
        const c = {
            _id: "chiplet" + i,
            chiplet_doc: chiplet_id_arr[i]
        };
        chiplet_arr.push(c);
    }

    const connection_arr = [];
    console.log(connection_input_arr);
    for (let i = 0; i < connection_input_arr.length; i++) {
        const connection_tuple = [];

        const chiplet_a_interface_id = "chiplet" + connection_input_arr[i][0] + "." + connection_input_arr[i][1];
        const chiplet_b_interface_id = "chiplet" + connection_input_arr[i][2] + "." + connection_input_arr[i][3];

        connection_tuple.push(chiplet_a_interface_id);
        connection_tuple.push(chiplet_b_interface_id);

        const c = {
            _id: "connection" + i,
            connection: connection_tuple
        }; 

        connection_arr.push(c);
    }

    const chiplet_system_schema = new ChipletSystem({
        chiplets: chiplet_arr,
        chiplet_connections: connection_arr,
        _id: system_id // faker.string.uuid()
    });
    
    return chiplet_system_schema;
};
