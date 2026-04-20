const mongoose = require('mongoose');

const buildSlotSchema = new mongoose.Schema({
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    pokemonId: { type: String, required: true }, // name or dex number for pokeapi
    nickname: { type: String },
    ability: { type: String }, 
    heldItem: { type: String },
    moves: [{ type: String }], // array of strings for the 4 moves
    evSpread: { type: String, default: "0/0/0/0/0/0" } // hp/atk/def/spa/spd/spe
}, { timestamps: true });

module.exports = mongoose.model('BuildSlot', buildSlotSchema);