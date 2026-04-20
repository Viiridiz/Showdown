const Team = require('../models/Team');

const createTeam = async (req, res) => {
    try {
        const { name, format, description } = req.body;

        if (!name || !format) {
            return res.status(400).json({ message: "Name and format are required!" });
        }

        const team = await Team.create({
            name,
            format,
            description,
            userId: req.user.id
        });

        return res.status(201).json({
            message: "Team created successfully!",
            data: { team }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error while creating team." });
    }
};

const getTeams = async (req, res) => {
    try {
        // gets all teams so the community dashboard works later
        const teams = await Team.find()
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Teams fetched successfully.",
            data: { teams }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error while fetching teams." });
    }
};

const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id);

        if (!team) return res.status(404).json({ message: "Team not found!" });

        // only the owner can edit
        if (team.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden. Not your team." });
        }

        const updatedTeam = await Team.findByIdAndUpdate(id, req.body, { new: true });

        return res.status(200).json({
            message: "Team updated successfully",
            data: { team: updatedTeam }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error while updating team." });
    }
};

const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id);

        if (!team) return res.status(404).json({ message: "Team not found!" });

        // only the owner can delete
        if (team.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden. Not your team." });
        }

        await team.deleteOne();

        return res.status(200).json({
            message: "Team deleted successfully",
            data: { team }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error while deleting team." });
    }
};

const upvoteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findByIdAndUpdate(id, { $inc: { upvotes: 1 } }, { new: true });

        if (!team) return res.status(404).json({ message: "Team not found!" });

        const io = req.app.get('io');
        io.emit('team:upvoted', { teamId: team._id, newUpvotes: team.upvotes });

        return res.status(200).json({ message: "Upvoted!", data: { team } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error upvoting team." });
    }
};

module.exports = { createTeam, getTeams, updateTeam, deleteTeam, upvoteTeam };