import { faker } from '@faker-js/faker';
import PHY from './model/PHY.js'

const Bow_32_PHY = new PHY({ // this is 1 PHY
    name: "BoW-32",
    max_bandwidth: "32 Gbps",
    reach: "4 mm",
    clock_type: "forwarded",
    _id: "BoW-32" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const Bow_64_PHY = new PHY({ // this is 1 PHY
    name: "BoW-64",
    max_bandwidth: "64 Gbps",
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "BoW-64" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const Bow_128_PHY = new PHY({ // this is 1 PHY
    name: "BoW-128",
    max_bandwidth: "128 Gbps",
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "BoW-128" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const Bow_256_PHY = new PHY({ // this is 1 PHY
    name: "BoW-256",
    max_bandwidth: "256 Gbps",
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "BoW-256" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const Bow_384_PHY = new PHY({ // this is 1 PHY
    name: "BoW-384",
    max_bandwidth: "384 Gbps",
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "BoW-384" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const Bow_512_PHY = new PHY({ // this is 1 PHY
    name: "BoW-512",
    max_bandwidth: "512 Gbps",
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "BoW-512" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

// "16x PCIe", "UCIe", "AIB", "LIPINCON", "USB", "ethernet", "SATA", "PCIe", "DisplayPort"]

const UCIe_A_x64_64_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x64-64",
    max_bandwidth: "64 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x64-64" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x64_128_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x64-128",
    max_bandwidth: "128 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x64-128" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x64_192_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x64-192",
    max_bandwidth: "192 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x64-192" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x64_256_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x64-256",
    max_bandwidth: "256 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x64-256" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x64_384_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x64-384",
    max_bandwidth: "384 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x64-384" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x64_512_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x64-512",
    max_bandwidth: "512 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x64-512" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x32_32_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x32-32",
    max_bandwidth: "32 GB/s", // is it just cut in half?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x32-32" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x32_64_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x32-64",
    max_bandwidth: "64 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x32-64" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x32_96_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x32-96",
    max_bandwidth: "96 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x32-96" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x32_128_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x32-128",
    max_bandwidth: "128 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x32-128" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x32_192_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x32-192",
    max_bandwidth: "192 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x32-192" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

const UCIe_A_x32_256_PHY = new PHY({ // not sure if math for ucie is right
    name: "UCIe_A_x32-256",
    max_bandwidth: "256 GB/s", // not sure if I distilled this correctly?
    reach: "2 mm",
    clock_type: "forwarded",
    _id: "UCIe_A_x32-256" // this is what's going to let us find these maps and attach them to chiplet interfaces
});

// should also have some way to make them tx or rx patterns
export function generate_PHY() { // generate one based on BoW
    const PHY_array = [Bow_32_PHY, Bow_64_PHY, Bow_128_PHY, Bow_256_PHY, Bow_384_PHY, Bow_512_PHY,
        UCIe_A_x64_64_PHY, UCIe_A_x64_128_PHY, UCIe_A_x64_192_PHY, UCIe_A_x64_256_PHY, UCIe_A_x64_384_PHY,
        UCIe_A_x64_512_PHY, UCIe_A_x32_32_PHY, UCIe_A_x32_64_PHY, UCIe_A_x32_96_PHY, UCIe_A_x32_128_PHY,
        UCIe_A_x32_192_PHY, UCIe_A_x32_256_PHY
    ];
    return PHY_array;
};

// before creating the chiplet data, need to create the protocol data so that i have the ids to link to
// then afer creating the protocol data, can fill up the compatibility table as well
// the exception table is the last thing that gets created because it depends on the chiplet ids
// need the bump maps before you create the chiplets

// could make the two subbump regions more flexible by allowing the depth (i.e., number of rows) to be
// adjusted as well