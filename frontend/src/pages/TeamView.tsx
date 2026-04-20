import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import TeamRoster from '../components/TeamRoster';

export default function TeamView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState<any>(null);
  const [pokemonName, setPokemonName] = useState('');
  const [moves, setMoves] = useState('');

  useEffect(() => {
    api.get('/teams').then(res => {
      const found = res.data.data.teams.find((t: any) => t._id === id);
      setTeam(found);
    }).catch(err => console.log(err));
  }, [id]);

  const handleAddPokemon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/slots', {
        teamId: id,
        pokemonId: pokemonName.toLowerCase().trim(), 
        nickname: '',
        ability: '',
        heldItem: '',
        moves: moves.split(',').map(m => m.trim()), 
        evSpread: ''
      });
      setPokemonName('');
      setMoves('');
      window.location.reload();
    } catch (err) {
      console.log("Error adding pokemon", err);
    }
  };

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
      <button 
        onClick={() => navigate('/')} 
        style={{ backgroundColor: 'var(--poke-dark)', marginBottom: '20px' }}
      >
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
        
        {isOwner && (
          <>
            <h3 style={{ marginTop: '30px', borderBottom: '2px solid var(--poke-gray)', paddingBottom: '10px' }}>
              Add a Pokémon
            </h3>
            <form onSubmit={handleAddPokemon} style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Pokémon Name (e.g., Pelipper)" 
                value={pokemonName} 
                onChange={(e) => setPokemonName(e.target.value)} 
                required 
                style={{ flex: 1 }}
              />
              <input 
                type="text" 
                placeholder="Moves (comma separated)" 
                value={moves} 
                onChange={(e) => setMoves(e.target.value)} 
                style={{ flex: 2 }}
              />
              <button type="submit">Slot In</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}