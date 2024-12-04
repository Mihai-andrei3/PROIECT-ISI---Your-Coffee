import React, { useState } from "react";
import { addCafe } from "../firebase";

const AddCafeForm = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false); // Pentru a gestiona starea de încărcare
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addCafe(name, address, parseFloat(latitude), parseFloat(longitude));
      setName("");
      setAddress("");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Adaugă o cafenea</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Numele cafenelei"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Adresa"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={loading}
      />
      <input
        type="number"
        step="0.000001"
        placeholder="Latitudine"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        disabled={loading}
      />
      <input
        type="number"
        step="0.000001"
        placeholder="Longitudine"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Se încarcă..." : "Adaugă"}
      </button>
    </form>
  );
};

export default AddCafeForm;
