require('dotenv').config();

var config = {
    ticks_per_quarter_note: process.env.TICKS_PER_QUARTER_NOTE || 96,
    device_id_to_record: process.env.MIDI_DEVICE_IN || 1,
    device_id_remote: process.env.MIDI_DEVICE_KEYBOW || 'Keybow MIDI 1',
    bpm: process.env.BPM || 120,
    rebounce_notes: process.env.REBOUNCE_NOTES || false
};

module.exports = config;