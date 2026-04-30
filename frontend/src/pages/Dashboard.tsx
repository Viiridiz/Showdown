import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import TeamRoster from '../components/TeamRoster';
import api from '../api/axiosConfig';

interface Team {
  _id: string;
  name: string;
  format: string;
  description: string;
  upvotes: string[];
  userId: { _id: string; name: string };
}

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [format, setFormat] = useState('VGC 2026');
  const [description, setDescription] = useState('');
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [metaAlert, setMetaAlert] = useState<string>('');
  
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('presence:update', (count: number) => {
      setActiveUsers(count);
    });

    socket.on('team:upvoted', ({ teamId, newUpvotes }: { teamId: string, newUpvotes: string[] }) => {
      setTeams(prevTeams => prevTeams.map(team => 
        team._id === teamId ? { ...team, upvotes: newUpvotes } : team
      ));
    });

    socket.on('meta:update', ({ message }: { message: string }) => {
      setMetaAlert(message);
      setTimeout(() => setMetaAlert(''), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data.data.teams);
    } catch (err) {
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
    }
  };

  const handleUpvote = async (teamId: string) => {
    try {
      await api.patch(`/teams/${teamId}/upvote`);
    } catch (err) {
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const getUpvoteCount = (upvotes: any) => Array.isArray(upvotes) ? upvotes.length : (upvotes || 0);

  const topTeams = [...teams].sort((a, b) => getUpvoteCount(b.upvotes) - getUpvoteCount(a.upvotes)).slice(0, 3);
  
  const podiumOrder = [topTeams[1], topTeams[0], topTeams[2]];
  const podiumColors = ["#C0C0C0", "#FFD700", "#CD7F32"]; 
  const podiumHeights = ["140px", "180px", "120px"];

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', position: 'relative' }}>
      
      {metaAlert && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', 
          backgroundColor: 'var(--poke-dark)', color: 'white', 
          padding: '15px 20px', borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000,
          animation: 'popIn 0.3s ease-out'
        }}>
          <strong>Meta Alert:</strong> {metaAlert}
        </div>
      )}

      {/* Header Section */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        paddingBottom: '20px', borderBottom: '2px solid var(--poke-gray)', marginBottom: '30px' 
      }}>
        <div>
          <h1 style={{ color: 'var(--poke-red)', margin: 0, fontSize: '2.2rem' }}>Showdown Feed</h1>
          <span style={{ 
            display: 'inline-block', marginTop: '8px', padding: '6px 12px', 
            backgroundColor: '#e8f5e9', color: '#2e7d32', 
            borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            🟢 {activeUsers} Trainer{activeUsers !== 1 ? 's' : ''} Online
          </span>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ backgroundColor: 'var(--poke-dark)', padding: '10px 20px', borderRadius: '8px' }}
        >
          Logout
        </button>
      </div>

      {/* Podium Section */}
      {topTeams.length > 0 && (
        <div style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--poke-dark)', marginBottom: '25px' }}>🏆 Top Rated Teams</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '15px' }}>
            {podiumOrder.map((team, index) => {
              if (!team) return <div key={index} style={{ width: '200px' }} />;
              const rank = index === 0 ? 2 : index === 1 ? 1 : 3;
              
              return (
                <div 
                  key={team._id} 
                  onClick={() => navigate(`/team/${team._id}`)}
                  style={{ 
                    width: '220px', 
                    height: podiumHeights[index],
                    backgroundColor: '#fff', 
                    borderTop: `6px solid ${podiumColors[index]}`,
                    borderRadius: '12px 12px 0 0',
                    boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                    padding: '15px', cursor: 'pointer', transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    backgroundColor: podiumColors[index], color: '#fff', 
                    width: '30px', height: '30px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', marginBottom: '10px' 
                  }}>
                    {rank}
                  </div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--poke-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                    {team.name}
                  </h4>
                  <p style={{ margin: 0, color: 'gray', fontSize: '0.9rem', fontWeight: 'bold' }}>👍 {getUpvoteCount(team.upvotes)}</p>
                </div>
              );
            })}
          </div>
          <div style={{ height: '4px', backgroundColor: 'var(--poke-gray)', width: '100%', maxWidth: '700px', margin: '0 auto', borderRadius: '2px' }} />
        </div>
      )}

      {/* Creation Form */}
      <div style={{ 
        backgroundColor: '#fff', padding: '25px', borderRadius: '12px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', marginBottom: '40px' 
      }}>
        <h3 style={{ borderBottom: '2px solid var(--poke-red)', paddingBottom: '10px', display: 'inline-block', marginBottom: '20px' }}>
          Draft a New Team
        </h3>
        <form onSubmit={handleCreateTeam} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '15px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Team Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--poke-gray)' }}
          />
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--poke-gray)' }}
          >
            <option value="VGC 2026">VGC 2026</option>
            <option value="OU Singles">OU Singles</option>
            <option value="Little Cup">Little Cup</option>
          </select>
          <input 
            type="text" 
            placeholder="Brief strategy description..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--poke-gray)' }}
          />
          <button type="submit" style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: '8px' }}>
            Create
          </button>
        </form>
      </div>

      {/* Teams Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ color: 'var(--poke-dark)', marginBottom: '5px' }}>Recent Builds</h2>
        {teams.map((team) => {
          const hasUpvoted = Array.isArray(team.upvotes) && team.upvotes.includes(currentUserId);
          
          return (
          <div key={team._id} style={{ 
            backgroundColor: '#fff', padding: '25px', borderRadius: '12px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: 'var(--poke-dark)', fontSize: '1.5rem' }}>
                  {team.name} <span style={{ fontSize: '1rem', color: '#888', fontWeight: 'normal' }}>({team.format})</span>
                </h2>
                <p style={{ margin: '0 0 5px 0', color: '#444' }}>{team.description}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>Built by: <strong>{team.userId?.name || 'Unknown Trainer'}</strong></p>
              </div>
              
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', 
                backgroundColor: '#f8f9fa', padding: '8px 16px', borderRadius: '30px',
                border: '1px solid #eee'
              }}>
                <strong style={{ fontSize: '1.25rem', color: 'var(--poke-dark)' }}>{getUpvoteCount(team.upvotes)}</strong>
                <button 
                  onClick={() => handleUpvote(team._id)}
                  style={{ 
                    padding: '8px 16px', fontSize: '0.9rem', borderRadius: '20px', 
                    backgroundColor: hasUpvoted ? 'var(--poke-red)' : '#e0e0e0', 
                    color: hasUpvoted ? 'white' : '#333', 
                    transition: 'background-color 0.2s', border: 'none', cursor: 'pointer' 
                  }}
                >
                  {hasUpvoted ? 'Voted' : '👍 Upvote'}
                </button>
              </div>
            </div>

            <TeamRoster teamId={team._id} />
            
            <button 
              onClick={() => navigate(`/team/${team._id}`)} 
              style={{ marginTop: '20px', width: '100%', padding: '12px', fontSize: '1.05rem', backgroundColor: 'var(--poke-dark)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              View Roster Details
            </button>
          </div>
        )})}
      </div>
    </div>
  );
}