import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamRoster from '../components/TeamRoster';
import api from '../api/axiosConfig';

interface Team {
  _id: string;
  name: string;
  format: string;
  description: string;
  upvotes: number;
  userId: { _id: string; name: string };
}

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [format, setFormat] = useState('VGC 2026');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data.data.teams);
    } catch (err) {
      console.log("Error fetching teams", err);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teams', { name, format, description });
      setName('');
      setDescription('');
      fetchTeams();
    } catch (err) {
      console.log("Error creating team", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--poke-red)' }}>Showdown Global Feed</h1>
        <button onClick={handleLogout} style={{ backgroundColor: 'var(--poke-dark)' }}>Logout</button>
      </div>

      {/* CREATE TEAM FORM */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '2px solid var(--poke-gray)', marginTop: '20px' }}>
        <h3>Draft a New Team</h3>
        <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Team Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ flex: 1 }}
          />
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="VGC 2026">VGC 2026</option>
            <option value="OU Singles">OU Singles</option>
            <option value="Little Cup">Little Cup</option>
          </select>
          <input 
            type="text" 
            placeholder="Brief strategy..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ flex: 2 }}
          />
          <button type="submit">Create</button>
        </form>
      </div>

      {/* TEAMS FEED */}
      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {teams.map((team) => (
          <div key={team._id} style={{ padding: '15px', border: '2px solid var(--poke-gray)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>{team.name} <span style={{ fontSize: '0.9rem', color: 'gray' }}>({team.format})</span></h2>
              <strong>👍 {team.upvotes}</strong>
            </div>
            <p style={{ margin: '10px 0' }}>{team.description}</p>
            <p style={{ fontSize: '0.8rem', color: 'gray' }}>Built by: {team.userId?.name || 'Unknown Trainer'}</p>

            <TeamRoster teamId={team._id} />
            
            <button 
              onClick={() => navigate(`/team/${team._id}`)} 
              style={{ marginTop: '10px', width: '100%' }}
            >
              View Roster & Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}