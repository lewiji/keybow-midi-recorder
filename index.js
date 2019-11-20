var JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);
const fs = require('fs');

// Load env / default app config
const config = require('./config/config');

// simple midi format ref, midi track ref, recording true/false, recording start time (MS)
var smf, trk, recording, startTime;

/** 
 * Init a new Simple Midi File and Midi Track
 * Save recording start time in unix time
 */
function newTrack() {
    smf = new JZZ.MIDI.SMF(0, config.ticks_per_quarter_note); // type 0, 192 ticks per quarter note
    trk = new JZZ.MIDI.SMF.MTrk();
    smf.push(trk);
    recording = true;
    trk.add(0, JZZ.MIDI.smfSeqName('Drumlog'))
       .add(0, JZZ.MIDI.smfBPM(120));
    
    startTime = new Date().getTime();
}

/*
Open midi connection to recording device and set up
MIDI message handler
*/
JZZ().openMidiIn(config.device_id_to_record).or('Cannot open MIDI In port!')
    .and(function() { 
        // Confirm connection
        console.log('MIDI-In: ', this.name());
    })
    .connect(function(msg) {
        // While recording and receiving note data, record to track
        if(recording && (msg.isNoteOn() || msg.isNoteOff())) {
            console.log(msg.toString()); 
            trk.add(getTicks(), msg);
            
            if (config.rebounce_notes) {
                // Alesis drums don't send noteOff... so retrigger msg as noteOff
                trk.add(getTicks() + 86, JZZ.MIDI.noteOff(msg.getChannel(), msg.getNote()));
            }
        }   
    });

/**
 * Connect to keybow in midi mode for hotkey
 */
JZZ().openMidiIn(config.device_id_remote).or('Cannot open MIDI In port!')
    .and(function() { 
        console.log('MIDI-In: ', this.name());
    })
    .connect(function(msg) { 
        // if note is pressed, start or stop recording
        if (msg.isNoteOn()) {
            if (msg.getNote() == 80 && !recording) {
                newTrack();
                console.log('recording');
            } else if (msg.getNote() && recording) {
                // on stop save to file and reset
                saveToFile();
                recording = false;
                smf = undefined;
                trk = undefined;
                startTime = 0;
                console.log('stopped recording');
            }
        }     
    });

/**
 * Save current recording to midi file
 */
function saveToFile() {
    if (trk) {
        trk.add(getTicks(), JZZ.MIDI.smfEndOfTrack());
        // sync so we can write during process exit
        fs.writeFileSync("./recordings/" + Date.now() + ".mid", smf.dump(), 'binary');
    }    
}

// callback for process end
function closeAndSave() {
    console.log("process exited, saving...")
    saveToFile();
    process.exit();
}

// ms to ticks multiplier
const midiTime = 60000 / (config.bpm * config.ticks_per_quarter_note);

// convert given current ms to ticks in midi file at current bpm/tpqn
function getTicks(ms) {
    const msSinceRecordingStarted = new Date().getTime() - startTime;
    return Math.floor(msSinceRecordingStarted / midiTime);
}

//do something when app is closing
process.on('exit', closeAndSave);

//catches ctrl+c event
process.on('SIGINT', closeAndSave);