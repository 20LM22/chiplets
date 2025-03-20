import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const protocolSchema = new Schema({
    name: String,
    max_bandwidth: String,
    num_lanes: Number,
    _id: String // user sets this explicitly
});

// synopsys, designerware_ip/interface-ip

const Protocol = model('Protocol', protocolSchema);
export default Protocol;

/*
protocolSchema.pre('validate', function(next){
    if (this.max_bandwidth != undefined) {
        const bw = Number.parseFloat(this.max_bandwidth); // units will be GB/s
        if (bw <= 0) {
            const err = new Error("Protocol cannot have zero, negative max bandwidth");
            next(err);
        }
        if (this.max_bandwidth.match(/GBps/) != null || this.max_bandwidth.match(/GB\/ps/) != null || this.max_bandwidth.match(/Gbyte\/ps/) != null) {
            this.max_bandwidth = bw;
        } else if (this.max_bandwidth.match(/MBps/) != null || this.max_bandwidth.match(/MB\/ps/) != null || this.max_bandwidth.match(/Mbyte\/ps/) != null) {
            this.max_bandwidth = bw * 1e-3;
        } else if (this.max_bandwidth.match(/KBps/) != null || this.max_bandwidth.match(/KB\/ps/) != null || this.max_bandwidth.match(/Kbyte\/ps/) != null) {
            this.max_bandwidth = bw * 1e-6;
        } else if (this.max_bandwidth.match(/Gbps/) != null || this.max_bandwidth.match(/Gb\/ps/) != null || this.max_bandwidth.match(/Gbit\/ps/) != null) {
            this.max_bandwidth = bw * 0.125;
        } else if (this.max_bandwidth.match(/Mbps/) != null || this.max_bandwidth.match(/Mb\/ps/) != null || this.max_bandwidth.match(/Mbit\/ps/) != null) {
            this.max_bandwidth = bw * 1e-3 * 0.125;
        } else if (this.max_bandwidth.match(/Kbps/) != null || this.max_bandwidth.match(/Kb\/ps/) != null || this.max_bandwidth.match(/Kbit\/ps/) != null) {
            this.max_bandwidth = bw * 1e-6 * 0.125;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("Protocol bandwidth not specified in known units: GB/s, MB/s, KB/s, Gb/s, Mb/s, Kb/s");
            next(err);
        }
    }
});
*/