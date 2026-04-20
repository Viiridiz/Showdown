import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import TeamRoster from '../components/TeamRoster';
import AddPokemonForm from '../components/AddPokemonForm'; // Import your new component

export default function TeamView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    api.get('/teams').then(res => {
      const found = res.data.data.teams.find((t: any) => t._id === id);
      setTeam(found);
    }).catch(err => console.log(err));
  }, [id]);

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${id}`);
      navigate('/');
    } catch (err) {
      console.log("Error deleting team", err);
    }
  };

  if (!team) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</h2>;

  const currentUserId = JSON.parse(atob(localStorage.getItem('token')!.split('.')[1])).id;
  const isOwner = team.userId._id === currentUserId;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <button onClick={() => navigate('/')} style={{ backgroundColor: 'var(--poke-dark)', marginBottom: '20px' }}>
        ← Back to Feed
      </button>
      
      <div style={{ border: '2px solid var(--poke-red)', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'var(--poke-red)' }}>{team.name}</h1>
          {isOwner && (
            <button onClick={handleDeleteTeam} style={{ backgroundColor: 'var(--poke-dark)' }}>
              Delete Team
            </button>
          )}
        </div>
        <p><strong>Format:</strong> {team.format}</p>
        <p style={{ marginBottom: '20px' }}>{team.description}</p>
        
        <TeamRoster teamId={id || ''} />
        
        {/* The Smart Add Form */}
        {isOwner && (
          <AddPokemonForm 
            teamId={id || ''} 
            onAddSuccess={() => window.location.reload()} 
          />
        )}
      </div>
    </div>
  );
}