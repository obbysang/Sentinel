import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const [maskedKey, setMaskedKey] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    
    // Form States
    const [newKey, setNewKey] = useState('');
    const [password, setPassword] = useState('');
    
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchKey();
    }, []);

    const fetchKey = async () => {
        try {
            const data = await api.getGeminiKey();
            setMaskedKey(data.masked_key);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        // Regex Validation
        if (!/^[A-Za-z0-9_\-]+$/.test(newKey)) {
            setMessage({ type: 'error', text: 'Invalid API Key format.' });
            setLoading(false);
            return;
        }

        try {
            const data = await api.updateGeminiKey(newKey, password);
            setMaskedKey(data.masked_key);
            setMessage({ type: 'success', text: 'API Key updated successfully.' });
            setIsEditing(false);
            setNewKey('');
            setPassword('');
        } catch (err: any) {
             setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update key.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.removeGeminiKey(password);
            setMaskedKey(null);
            setMessage({ type: 'success', text: 'API Key removed successfully.' });
            setIsRemoving(false);
            setPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to remove key.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-emerald-500">User Profile</h1>
                    <div className="space-x-4">
                        <Link to="/dashboard" className="text-zinc-400 hover:text-white">Back to Dashboard</Link>
                        <button onClick={logout} className="text-red-400 hover:text-red-300">Logout</button>
                    </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <div className="mb-6">
                        <label className="block text-sm text-zinc-500 uppercase tracking-wider mb-1">Username</label>
                        <div className="text-xl font-medium">{user?.username}</div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm text-zinc-500 uppercase tracking-wider mb-1">Gemini API Key</label>
                        <div className="flex items-center justify-between bg-zinc-800 p-3 rounded border border-zinc-700">
                            <code className="text-zinc-300">
                                {maskedKey ? maskedKey : <span className="text-zinc-500 italic">No API key set</span>}
                            </code>
                            <div className="space-x-2">
                                {!isEditing && !isRemoving && (
                                    <>
                                        <button 
                                            onClick={() => setIsEditing(true)} 
                                            className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 text-sm"
                                        >
                                            {maskedKey ? 'Update' : 'Add Key'}
                                        </button>
                                        {maskedKey && (
                                            <button 
                                                onClick={() => setIsRemoving(true)} 
                                                className="px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-3 rounded mb-4 text-sm ${message.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-emerald-900/50 text-emerald-200'}`}>
                            {message.text}
                        </div>
                    )}

                    {isEditing && (
                        <form onSubmit={handleUpdate} className="bg-zinc-800/50 p-4 rounded border border-zinc-700 animate-in fade-in slide-in-from-top-2">
                            <h3 className="text-lg font-medium mb-4">Update API Key</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">New API Key</label>
                                    <input
                                        type="text"
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-emerald-500 outline-none"
                                        placeholder="AIza..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Password (for verification)</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-emerald-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsEditing(false); setMessage({type:'', text:''}); }}
                                        className="px-4 py-2 text-zinc-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Key'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {isRemoving && (
                        <form onSubmit={handleRemove} className="bg-red-900/10 p-4 rounded border border-red-900/30 animate-in fade-in slide-in-from-top-2">
                            <h3 className="text-lg font-medium mb-4 text-red-400">Remove API Key</h3>
                            <p className="text-sm text-zinc-400 mb-4">Are you sure you want to remove your API key? This will stop AI analysis features.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Password (for verification)</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-red-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsRemoving(false); setMessage({type:'', text:''}); }}
                                        className="px-4 py-2 text-zinc-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded disabled:opacity-50"
                                    >
                                        {loading ? 'Removing...' : 'Confirm Remove'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
