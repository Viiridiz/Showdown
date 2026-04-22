import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import TeamRoster from '../components/TeamRoster';
import AddPokemonForm from '../components/AddPokemonForm';

export default function TeamView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any>(null);
  
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [slotCount, setSlotCount] = useState(0);

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

  const handleRemovePokemon = async () => {
    try {
      await api.delete(`/slots/${editingSlot._id}`);
      window.location.reload();
    } catch (err) {
      console.log("Error removing pokemon", err);
    }
  };

  if (!team) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</h2>;

  const token = localStorage.getItem('token');
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
  const teamOwnerId = typeof team.userId === 'string' ? team.userId : team.userId?._id;
  const isOwner = teamOwnerId === currentUserId;

  const openEditModal = (slot: any) => {
    setEditingSlot(slot);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', position: 'relative' }}>
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
        
        <TeamRoster 
          teamId={id || ''} 
          isOwner={isOwner} 
          onPokemonClick={openEditModal} 
          onSlotCountUpdate={setSlotCount}
        />
        
        {isOwner && slotCount < 6 && (
          <AddPokemonForm 
            teamId={id || ''} 
            onAddSuccess={() => window.location.reload()} 
          />
        )}
        
        {/* Show a message if the team is full */}
        {isOwner && slotCount >= 6 && (
          <p style={{ textAlign: 'center', color: 'var(--poke-red)', fontWeight: 'bold', marginTop: '20px' }}>
            Roster is full. Click a Pokémon to edit or release it.
          </p>
        )}
      </div>

      {editingSlot && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div className="modal-content" style={{ 
            backgroundColor: '#fff', padding: '20px', borderRadius: '12px', 
            width: '95%', maxWidth: '800px', border: '2px solid var(--poke-red)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ textTransform: 'capitalize', color: 'var(--poke-dark)' }}>
                Editing {editingSlot.pokemonId}
              </h2>
              <button onClick={handleRemovePokemon} style={{ backgroundColor: 'var(--poke-red)', padding: '8px 16px', fontSize: '0.9rem' }}>
                Release
              </button>
            </div>
            
            <AddPokemonForm 
              teamId={id || ''} 
              initialSlot={editingSlot}
              onAddSuccess={() => window.location.reload()} 
              onCancel={() => setEditingSlot(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}