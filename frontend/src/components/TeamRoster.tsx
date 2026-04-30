import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';

interface Slot {
  _id: string;
  pokemonId: string;
  heldItem?: string;
  nickname?: string;
}

export default function TeamRoster({ teamId, onPokemonClick, onSlotCountUpdate, refreshTrigger }: { teamId: string, isOwner?: boolean, onPokemonClick?: (slot: Slot) => void, onSlotCountUpdate?: (count: number) => void, refreshTrigger?: number }) {
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
      .catch(() => {}); 
  }, [teamId, onSlotCountUpdate, refreshTrigger]); 

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-evenly', 
      alignItems: 'center',
      margin: '25px 0', 
      padding: '15px',
      backgroundColor: '#f8f9fa', 
      borderRadius: '12px',
      border: '1px solid var(--poke-gray)'
    }}>
      {slots.map(slot => (
        <div 
          key={slot._id} 
          onClick={() => onPokemonClick && onPokemonClick(slot)}
          style={{ 
            cursor: 'pointer',
            transition: 'transform 0.2s, opacity 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <PokemonSprite name={slot.pokemonId} />
        </div>
      ))}
      
      {Array.from({ length: 6 - slots.length }).map((_, i) => (
        <div key={`empty-${i}`} style={{ 
          width: '70px', 
          height: '70px', 
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
      style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
    />
  ) : (
    <div style={{ width: '70px', height: '70px', border: '2px dotted red', borderRadius: '50%' }} />
  );
}