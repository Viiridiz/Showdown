const BuildSlot = require('../models/BuildSlot');
const Team = require('../models/Team');

const addSlot = async (req, res) => {
    try {
        const { teamId, pokemonId, nickname, ability, heldItem, moves, evSpread } = req.body;

        // make sure team exists and belongs to the user
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });
        if (team.userId.toString() !== req.user.id) return res.status(403).json({ message: "Not your team bro" });

        const existingSlots = await BuildSlot.find({ teamId });
        if (existingSlots.length >= 6) {
            return res.status(400).json({ message: "This team already has 6 Pokémon!" });
        }

        const slot = await BuildSlot.create({
            teamId, pokemonId, nickname, ability, heldItem, moves, evSpread
        });
        
        const io = req.app.get('io');
        io.emit('meta:update', { message: 'New pokemon added to the meta!' });

        return res.status(201).json({ message: "Pokemon added", data: { slot } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error adding pokemon" });
    }
};

const getTeamSlots = async (req, res) => {
    try {
        const { teamId } = req.params;
        const slots = await BuildSlot.find({ teamId });
        return res.status(200).json({ data: { slots } });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching slots" });
    }
};

const updateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const slot = await BuildSlot.findById(id).populate('teamId');

        if (!slot) return res.status(404).json({ message: "Slot not found" });
        if (slot.teamId.userId.toString() !== req.user.id) return res.status(403).json({ message: "Not your team" });

        const updatedSlot = await BuildSlot.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json({ data: { slot: updatedSlot } });
    } catch (error) {
        return res.status(500).json({ message: "Error updating slot" });
    }
};

const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const slot = await BuildSlot.findById(id).populate('teamId');

        if (!slot) return res.status(404).json({ message: "Slot not found" });
        if (slot.teamId.userId.toString() !== req.user.id) return res.status(403).json({ message: "Not your team" });

        await slot.deleteOne();
        return res.status(200).json({ message: "Pokemon removed" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting slot" });
    }
};

module.exports = { addSlot, getTeamSlots, updateSlot, deleteSlot };