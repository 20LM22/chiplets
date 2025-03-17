import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

const { Schema, model } = mongoose;

const protocolcompatibilitySchema = new Schema({
    protocol_a_id: String,
    protocol_b_id: String,
    compatible: Boolean,
    _id: false
});

// ccix controller ip
/*
if protocol1 = protocol2
    if yes, check exceptions
        if no exceptions, then it's compatible
        if yes exceptions, then it's not compatible
if no match
    check compatibility
*/
// should not grow large
// obivously if protocol ids are the same, then compatible is true

// both the physical and protocol layers need to be compatible in order for the interfaces to be compatible
// if a chip speaks cxl it should also pcie

const ProtocolCompatibility = model('ProtocolCompatibility', protocolcompatibilitySchema);
export default ProtocolCompatibility;

export function generate_synthetic_protocol_compatibility_docs() {
    let synthetic_compat = [];
    const ids = ["lipincon", "cxlio", "cxlcache", "cxlmem", "pcie_16", "axi", "sata"]
    for (let i = 0; i < ids.length; i++) {
        for (let j = i+1; j < ids.length; j++) {
            const compat_doc = new ProtocolCompatibility({
                protocol_a_id: ids[i],
                protocol_b_id: ids[j],
                compatible: faker.datatype.boolean(0.3)
            });
            synthetic_compat.push(compat_doc);
        }
    }
    for (let i = 0; i < ids.length; i++) {
        const compat_doc = new ProtocolCompatibility({
            protocol_a_id: ids[i],
            protocol_b_id: ids[i],
            compatible: true
        });
        synthetic_compat.push(compat_doc);
    } return synthetic_compat;
}
