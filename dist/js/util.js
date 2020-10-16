// Util Functions
export const clamp = (v, min, max) => ( v < min ? min : (v > max ? max : v) );
export const attenuate = (val, base = 16) => Math.pow(val, 2) / Math.pow(base, 2);
export const reverseAttenuate = (val, base = 16) => Math.sqrt(Math.pow(base, 2) * val);

// Dom Functions
export const setContent = (el, ct) => { if (el.innerHTML !== ct) el.innerHTML = ct; }

// Note Lengths
const noteLengthMap = {
    0: 0,
    1: 1/8,     // 1/32 note
    2: 1/6,     // 1/24 note
    3: 1/4,     // 1/16 note
    4: 1/3,     // 1/12 note
    5: 1/2,     // 1/8 note
    6: 1/1.5,   // 1/6 note
    7: 1,       // 1/4 note
    8: 1.5,     // 1/3 note
    9: 2,       // 1/2 note
    10: 3,      // 3/4 note
    11: 4,      // whole note / 1 bar
    12: 6,      // 1.5 bars
    13: 8,      // 2 bars
    14: 12,     // 3 bars
    15: 16,     // 4 bars
};

// Convert bpm to time (in seconds) based on note length
export const getLengthFromBpm = (bpm, len = 5) => (60 / bpm) * noteLengthMap[len];
export const bpmLengthToHex = (bpm, noteLength) => {
    if (noteLength <= 0.01) return 0;
    let lengthIndex = -1;
    for (let i in noteLengthMap) { if (getLengthFromBpm(bpm, i) === noteLength) lengthIndex = i; }
    return parseInt(lengthIndex).toString(16);
};

// Note Functions
const inputToNoteMap = {
    'A': 'A0',
    'a': 'a0',
    'B': 'B0',
    'b': 'C1',
    'C': 'C0',
    'c': 'c0',
    'D': 'D0',
    'd': 'd0',
    'E': 'E0',
    'e': 'F0',
    'F': 'F0',
    'f': 'f0',
    'G': 'G0',
    'g': 'g0',
    'H': 'A0',
    'h': 'a0',
    'I': 'B0',
    'i': 'C1',
    'J': 'C1',
    'j': 'c1',
    'K': 'D1',
    'k': 'd1',
    'L': 'E1',
    'l': 'F1',
    'M': 'F1',
    'm': 'f1',
    'N': 'G1',
    'n': 'g1',
    'O': 'A1',
    'o': 'a1',
    'P': 'B1',
    'p': 'C2',
    'Q': 'C2',
    'q': 'c2',
    'R': 'D2',
    'r': 'd2',
    'S': 'E2',
    's': 'F2',
    'T': 'F2',
    't': 'f2',
    'U': 'G2',
    'u': 'g2',
    'V': 'A2',
    'v': 'a2',
    'W': 'B2',
    'w': 'C3',
    'X': 'C3',
    'x': 'c3',
    'Y': 'D3',
    'y': 'd3',
    'Z': 'E3',
    'z': 'F3',
}

// Freq at octave 3
const noteToFreqMap = {
    'C': 261.63,
    'c': 277.18,
    'D': 293.66,
    'd': 311.13,
    'E': 329.63,
    'F': 349.23,
    'f': 369.99,
    'G': 392.00,
    'g': 415.30,
    'A': 440.00,
    'a': 466.16,
    'B': 493.88,
};

export const noteToFreq = (input, octave = 3) => {
    const noteInfo = inputToNoteMap[input];
    const note = noteInfo.slice(0, -1);
    const octMod = parseInt(noteInfo.slice(-1));

    return noteToFreqMap[note] * Math.pow(2, octave + octMod - 3)
};