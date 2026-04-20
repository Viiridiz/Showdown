import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';

const NATURES = ["Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile", "Gentle", "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", "Mild", "Modest", "Naive", "Naughty", "Quiet", "Quirky", "Rash", "Relaxed", "Sassy", "Serious", "Timid"];

const COMMON_ITEMS = [
  "Leftovers", "Life Orb", "Focus Sash", "Choice Band", "Choice Specs", "Choice Scarf", 
  "Assault Vest", "Heavy-Duty Boots", "Rocky Helmet", "Eviolite", "Air Balloon", 
  "Weakness Policy", "Lum Berry", "Sitrus Berry", "White Herb", "Mental Herb", "Expert Belt"
];

const STAT_LABELS = { hp: 'HP', atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed' };

const formatName = (str: string) => {
  if (!str) return '';
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function AddPokemonForm({ teamId, onAddSuccess }: { teamId: string, onAddSuccess: () => void }) {
  // Autocomplete State
  const [allPokemon, setAllPokemon] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLFormElement>(null);

  // Search State
  const [searchName, setSearchName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Data State
  const [pokeData, setPokeData] = useState<{ abilities: string[], moves: string[] } | null>(null);
  const [pokeImg, setPokeImg] = useState(''); 
  const [ability, setAbility] = useState('');
  const [item, setItem] = useState('');
  const [nature, setNature] = useState('Adamant');
  const [moves, setMoves] = useState(['', '', '', '']);
  const [evs, setEvs] = useState({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });

  useEffect(() => {
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=10000')
      .then(res => setAllPokemon(res.data.results.map((p: any) => p.name)))
      .catch(err => console.log("Failed to load pokemon list", err));
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchName(value);

    if (value.length > 0) {
      const filtered = allPokemon
        .filter(p => p.includes(value.toLowerCase()))
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const fetchPokemonData = async (targetName: string) => {
    if (!targetName) return;
    setIsSearching(true);
    setShowSuggestions(false); // Hide dropdown
    setSearchName(formatName(targetName));

    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${targetName.toLowerCase().trim()}`);
      setPokeData({
        abilities: res.data.abilities.map((a: any) => a.ability.name),
        moves: res.data.moves.map((m: any) => m.move.name).sort()
      });
      
      setPokeImg(res.data.sprites.other['official-artwork'].front_default || res.data.sprites.front_default);
      setAbility(res.data.abilities[0].ability.name);
      setMoves(['', '', '', '']); 
      setEvs({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }); 
    } catch (err) {
      alert("Pokémon not found!");
      setPokeData(null);
      setPokeImg('');
    }
    setIsSearching(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPokemonData(searchName);
  };
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEvChange = (stat: keyof typeof evs, value: string) => {
    let numValue = Math.max(0, Math.min(252, Number(value) || 0));
    const otherStatsTotal = Object.keys(evs).reduce((total, currentStat) => {
      return total + (currentStat === stat ? 0 : evs[currentStat as keyof typeof evs]);
    }, 0);

    if (otherStatsTotal + numValue > 510) {
      numValue = 510 - otherStatsTotal;
    }
    setEvs({ ...evs, [stat]: numValue });
  };

  const remainingEvs = 510 - Object.values(evs).reduce((a, b) => a + b, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const evSpread = `${evs.hp}/${evs.atk}/${evs.def}/${evs.spa}/${evs.spd}/${evs.spe}`;
    const finalMoves = moves.filter(m => m !== '');

    try {
      await api.post('/slots', {
        teamId,
        pokemonId: searchName.toLowerCase().trim(),
        nickname: nature, 
        ability,
        heldItem: item,
        moves: finalMoves,
        evSpread
      });
      onAddSuccess(); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f4f4f5', borderRadius: '8px', border: '1px solid var(--poke-gray)' }}>
      
      {/* Search Bar with Autocomplete */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', position: 'relative' }} ref={dropdownRef}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Enter Pokémon Name..." 
            value={searchName} 
            onChange={handleInputChange} 
            onFocus={() => {
                if (searchName.length > 0) setShowSuggestions(true);
                }}
                            required 
            style={{ width: '100%', padding: '10px' }}
            autoComplete="off"
          />
          
          {/* The Dropdown Menu */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ 
              position: 'absolute', top: '100%', left: 0, right: 0, 
              backgroundColor: '#fff', border: '1px solid var(--poke-gray)', 
              borderRadius: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {suggestions.map(suggestion => (
                <div 
                  key={suggestion} 
                  onClick={() => fetchPokemonData(suggestion)}
                  style={{ 
                    padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#333'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  {formatName(suggestion)}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSearching} style={{ backgroundColor: 'var(--poke-dark)' }}>
          {isSearching ? 'Loading...' : 'Search'}
        </button>
      </form>

      {/* The Configuration Form */}
      {pokeData && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {pokeImg && (
              <div style={{ flex: '0 0 150px', display: 'flex', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '8px', padding: '10px', border: '1px solid #ddd' }}>
                <img src={pokeImg} alt="Pokemon" style={{ width: '100%', height: '150px', objectFit: 'contain' }} />
              </div>
            )}

            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666' }}>Item</label>
                <input 
                  type="text" 
                  list="common-items"
                  placeholder="Select or type item..." 
                  value={item} 
                  onChange={e => setItem(e.target.value)} 
                  style={{ width: '100%' }} 
                />
                <datalist id="common-items">
                  {COMMON_ITEMS.map(i => <option key={i} value={i} />)}
                </datalist>
              </div>
              
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666' }}>Ability</label>
                <select value={ability} onChange={e => setAbility(e.target.value)} style={{ width: '100%' }}>
                  {pokeData.abilities.map(a => <option key={a} value={a}>{formatName(a)}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666' }}>Nature</label>
                <select value={nature} onChange={e => setNature(e.target.value)} style={{ width: '100%' }}>
                  {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666' }}>Moveset</label>
              {[0, 1, 2, 3].map(i => (
                <select key={i} value={moves[i]} onChange={e => {
                  const newMoves = [...moves];
                  newMoves[i] = e.target.value;
                  setMoves(newMoves);
                }} style={{ width: '100%' }}>
                  <option value="">Select Move</option>
                  {pokeData.moves.map(m => <option key={m} value={m}>{formatName(m)}</option>)}
                </select>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <strong>EV Training</strong>
              <strong style={{ color: remainingEvs === 0 ? 'var(--poke-red)' : '#2e7d32' }}>
                Remaining: {remainingEvs}
              </strong>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(evs).map((stat) => (
                <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ width: '60px', fontSize: '0.85rem', fontWeight: 'bold', color: '#666' }}>
                    {STAT_LABELS[stat as keyof typeof evs]}
                  </span>
                  <input 
                    type="number" 
                    value={evs[stat as keyof typeof evs]} 
                    onChange={e => handleEvChange(stat as keyof typeof evs, e.target.value)}
                    style={{ width: '65px', textAlign: 'center' }}
                  />
                  <input 
                    type="range" 
                    min="0" max="252" step="4"
                    value={evs[stat as keyof typeof evs]} 
                    onChange={e => handleEvChange(stat as keyof typeof evs, e.target.value)}
                    style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--poke-red)' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px' }}>Add to Team</button>
        </form>
      )}
    </div>
  );
}