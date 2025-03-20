import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const PHYSchema = new Schema({
    name: String,
    max_bandwidth: String, // bandwidth is for all lanes
    reach: String,
    clock_type: String, // shuld clock type, forwarded vs. recovered be in here?
    _id: String // user sets this explicitly
    // need a physical layer compatibility too? --> no as long as the PHYs are the same they're compat and that's it
}, { collection: 'phys' });

/*
PHYSchema.pre('validate', function(next){
    if (this.reach != undefined) {
        const reach = Number.parseFloat(this.reach); // units will be mm
        if (reach < 0) {
            const err = new Error("PHY cannot have negative reach");
            next(err);
        }
        if (this.reach.match(/cm/) != null || this.reach.match(/centimeters/) != null) {
            this.reach = reach * 10;
        } else if (this.reach.match(/mm/) != null || this.reach.match(/millimeters/) != null) {
            this.reach = reach;
        } else if (this.reach.match(/um/) != null || this.reach.match(/micrometers/) != null) {
            this.reach = reach * 1e-3;
        } else if (this.reach.match(/nm/) != null || this.reach.match(/nanometers/) != null) {
            this.reach = reach * 1e-6;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("PHY reach not specified in known units: cm, mm, um, nm");
            next(err);
        }
    }
    if (this.max_bandwidth != undefined) {
        const bw = Number.parseFloat(this.max_bandwidth); // units will be GB/s
        if (bw <= 0) {
            const err = new Error("PHY cannot have zero, negative max bandwidth");
            next(err);
        }
        if (this.max_bandwidth.match(/GBps/) != null || this.max_bandwidth.match(/GB\/s/) != null || this.max_bandwidth.match(/Gbyte\/s/) != null) {
            this.max_bandwidth = bw;
        } else if (this.max_bandwidth.match(/MBps/) != null || this.max_bandwidth.match(/MB\/s/) != null || this.max_bandwidth.match(/Mbyte\/s/) != null) {
            this.max_bandwidth = bw * 1e-3;
        } else if (this.max_bandwidth.match(/KBps/) != null || this.max_bandwidth.match(/KB\/s/) != null || this.max_bandwidth.match(/Kbyte\/s/) != null) {
            this.max_bandwidth = bw * 1e-6;
        } else if (this.max_bandwidth.match(/Gbps/) != null || this.max_bandwidth.match(/Gb\/s/) != null || this.max_bandwidth.match(/Gbit\/s/) != null) {
            this.max_bandwidth = bw * 0.125;
        } else if (this.max_bandwidth.match(/Mbps/) != null || this.max_bandwidth.match(/Mb\/s/) != null || this.max_bandwidth.match(/Mbit\/s/) != null) {
            this.max_bandwidth = bw * 1e-3 * 0.125;
        } else if (this.max_bandwidth.match(/Kbps/) != null || this.max_bandwidth.match(/Kb\/s/) != null || this.max_bandwidth.match(/Kbit\/s/) != null) {
            this.max_bandwidth = bw * 1e-6 * 0.125;
        } else {
            // could not match the units, need to throw an error
            const err = new Error("PHY bandwidth not specified in known units: GB/s, MB/s, KB/s, Gb/s, Mb/s, Kb/s");
            next(err);
        }
    }
}); */

const PHY = model('phy', PHYSchema, 'phys');
export default PHY;