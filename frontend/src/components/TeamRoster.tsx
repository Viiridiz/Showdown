import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';

interface Slot {
  _id: string;
  pokemonId: string;
  heldItem?: string;
  nickname?: string;
}

export default function TeamRoster({ teamId, isOwner, onPokemonClick, onSlotCountUpdate }: { teamId: string, isOwner?: boolean, onPokemonClick?: (slot: Slot) => void, onSlotCountUpdate?: (count: number) => void }) {
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    api.get(`/slots/team/${teamId}`)
      .then(res => {
        const fetchedSlots = res.data.data.slots;
        setSlots(fetchedSlots);
        if (onSlotCountUpdate) {
          onSlotCountUpdate(fetchedSlots.length);
        }
      })
      .catch(err => console.log("Error fetching slots", err));
  }, [teamId, onSlotCountUpdate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-evenly', 
      alignItems: 'center',
      margin: '15px 0', 
      padding: '10px',
      backgroundColor: 'var(--poke-white)', 
      borderRadius: '8px',
      border: '1px solid var(--poke-gray)'
    }}>
      {slots.map(slot => (
        <div 
          key={slot._id} 
          onClick={() => isOwner && onPokemonClick && onPokemonClick(slot)}
          style={{ 
            cursor: isOwner ? 'pointer' : 'default',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => isOwner && (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => isOwner && (e.currentTarget.style.opacity = '1')}
        >
          <PokemonSprite name={slot.pokemonId} />
        </div>
      ))}
      
      {Array.from({ length: 6 - slots.length }).map((_, i) => (
        <div key={`empty-${i}`} style={{ 
          width: '60px', 
          height: '60px', 
          border: '2px dashed var(--poke-gray)', 
          borderRadius: '50%',
          opacity: 0.5
        }} />
      ))}
    </div>
  );
}

function PokemonSprite({ name }: { name: string }) {
  const [imgUrl, setImgUrl] = useState('');

  useEffect(() => {
    axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
      .then(res => setImgUrl(res.data.sprites.front_default))
      .catch(() => setImgUrl('')); 
  }, [name]);

  return imgUrl ? (
    <img 
      src={imgUrl} 
      alt={name} 
      title={name} 
      style={{ width: '70px', height: '70px', objectFit: 'contain' }} 
    />
  ) : (
    <div style={{ width: '60px', height: '60px', border: '2px dotted red', borderRadius: '50%' }} />
  );
}