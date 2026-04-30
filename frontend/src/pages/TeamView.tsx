import { useState, useEffect, useCallback } from 'react';
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
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editName, setEditName] = useState('');
  const [editFormat, setEditFormat] = useState('VGC 2026');
  const [editDescription, setEditDescription] = useState('');

  const loadTeamData = useCallback(async () => {
    try {
      const res = await api.get('/teams');
      const found = res.data.data.teams.find((t: any) => t._id === id);
      setTeam(found);
      setEditName(found.name);
      setEditFormat(found.format);
      setEditDescription(found.description);
    } catch (err) {
      console.error("Error fetching team details", err);
    }
  }, [id]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const handleRosterChange = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditingSlot(null);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/teams/${id}`, { 
        name: editName, 
        format: editFormat, 
        description: editDescription 
      });
      setIsEditingTeam(false);
      loadTeamData();
    } catch (err) {
      console.error("Error updating team metadata", err);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${id}`);
      navigate('/');
    } catch (err) {
      console.error("Error deleting team", err);
    }
  };

  const handleRemovePokemon = async () => {
    try {
      await api.delete(`/slots/${editingSlot._id}`);
      handleRosterChange();
    } catch (err) {
      console.error("Error removing pokemon", err);
    }
  };

  if (!team) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</h2>;

  const token = localStorage.getItem('token');
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
  const teamOwnerId = typeof team.userId === 'string' ? team.userId : team.userId?._id;
  const isOwner = teamOwnerId === currentUserId;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', position: 'relative' }}>
      
      <button 
        onClick={() => navigate('/')} 
        style={{ backgroundColor: 'var(--poke-dark)', marginBottom: '30px', padding: '10px 20px', borderRadius: '8px', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        ← Back to Feed
      </button>
      
      <div style={{ 
        border: '2px solid var(--poke-gray)', 
        padding: '30px', 
        borderRadius: '12px', 
        backgroundColor: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        
        {isEditingTeam && isOwner ? (
          <form onSubmit={handleUpdateTeam} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0, color: 'var(--poke-dark)' }}>Edit Team Details</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <input 
                type="text" 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                required 
                style={{ flex: 1, padding: '10px' }}
              />
              <select 
                value={editFormat} 
                onChange={e => setEditFormat(e.target.value)}
                style={{ padding: '10px' }}
              >
                <option value="VGC 2026">VGC 2026</option>
                <option value="OU Singles">OU Singles</option>
                <option value="Little Cup">Little Cup</option>
              </select>
            </div>
            <textarea 
              value={editDescription} 
              onChange={e => setEditDescription(e.target.value)} 
              rows={3}
              style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}>Save Changes</button>
              <button type="button" onClick={() => setIsEditingTeam(false)} style={{ backgroundColor: 'var(--poke-gray)', color: '#333', border: 'none', padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ color: 'var(--poke-red)', margin: '0 0 10px 0', fontSize: '2.5rem' }}>
                  {team.name}
                </h1>
                <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#555' }}>
                  <strong>Format:</strong> {team.format}
                </p>
                <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem', lineHeight: '1.5' }}>
                  {team.description}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>
                  Built by: <strong>{team.userId?.name || 'Unknown Trainer'}</strong>
                </p>
              </div>
              
              {isOwner && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => setIsEditingTeam(true)} style={{ backgroundColor: 'var(--poke-dark)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                    Edit Details
                  </button>
                  <button onClick={handleDeleteTeam} style={{ backgroundColor: 'var(--poke-red)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete Team
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <h3 style={{ color: 'var(--poke-dark)', margin: '30px 0 10px 0' }}>Current Roster</h3>
        
        <TeamRoster 
          teamId={id || ''} 
          onPokemonClick={setEditingSlot} 
          onSlotCountUpdate={setSlotCount}
          refreshTrigger={refreshTrigger} 
        />
        
        {isOwner && slotCount < 6 && (
          <div style={{ marginTop: '40px' }}>
            <AddPokemonForm 
              teamId={id || ''} 
              onAddSuccess={handleRosterChange} 
            />
          </div>
        )}
        
        {isOwner && slotCount >= 6 && (
          <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '15px', borderRadius: '8px', textAlign: 'center', marginTop: '30px' }}>
            <strong>Roster is full!</strong> Click an existing Pokémon above to edit its stats or release it from the team.
          </div>
        )}
      </div>

      {editingSlot && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.6)'
        }}>
          <div className="modal-content" style={{ 
            backgroundColor: '#fff', padding: '30px', borderRadius: '12px', 
            width: '95%', maxWidth: '850px', border: '2px solid var(--poke-red)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ textTransform: 'capitalize', color: 'var(--poke-dark)', margin: 0 }}>
                {isOwner ? 'Editing' : 'Viewing'} {editingSlot.pokemonId}
              </h2>
              {isOwner && (
                <button onClick={handleRemovePokemon} style={{ backgroundColor: 'var(--poke-red)', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.9rem', borderRadius: '4px', cursor: 'pointer' }}>
                  Release (Delete)
                </button>
              )}
            </div>
            
            <AddPokemonForm 
              teamId={id || ''} 
              initialSlot={editingSlot}
              onAddSuccess={handleRosterChange} 
              onCancel={() => setEditingSlot(null)}
              isReadOnly={!isOwner}
            />
          </div>
        </div>
      )}
    </div>
  );
}