'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface SIPTrunk {
    id: string;
    name: string;
    sip_domain: string;
    username: string;
    password?: string;
    status: string;
    webhook_url: string;
    created_at: string;
}

export default function SIPTrunksPage() {
    const [trunks, setTrunks] = useState<SIPTrunk[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTrunkName, setNewTrunkName] = useState('');
    const [creating, setCreating] = useState(false);
    const [createdTrunk, setCreatedTrunk] = useState<SIPTrunk | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        fetchTrunks();
    }, []);

    const fetchTrunks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sip-trunks');
            setTrunks(response.data);
        } catch (error) {
            console.error('Error fetching SIP trunks:', error);
        } finally {
            setLoading(false);
        }
    };

    const createTrunk = async () => {
        if (!newTrunkName.trim()) return;

        try {
            setCreating(true);
            const response = await api.post('/sip-trunks', { name: newTrunkName });
            setCreatedTrunk(response.data);
            setShowCreateModal(false);
            setNewTrunkName('');
            fetchTrunks();
        } catch (error) {
            console.error('Error creating SIP trunk:', error);
            alert('Failed to create SIP trunk. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const deleteTrunk = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

        try {
            await api.delete(`/sip-trunks/${id}`);
            fetchTrunks();
        } catch (error) {
            console.error('Error deleting SIP trunk:', error);
            alert('Failed to delete SIP trunk. Please try again.');
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">SIP Trunks</h1>
                        <p className="text-gray-600 mt-1">
                            Connect your phone system (3CX, Ziwo, FreePBX) to AI agents
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Add SIP Trunk
                    </button>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">What is a SIP Trunk?</p>
                        <p>
                            A SIP trunk allows you to connect your existing phone system to our AI agents.
                            You'll get credentials to configure in your PBX, and calls will route through our platform.
                        </p>
                    </div>
                </div>

                {/* SIP Trunks List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading SIP trunks...</p>
                    </div>
                ) : trunks.length === 0 ? (
                    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No SIP trunks yet</h3>
                        <p className="text-gray-600 mb-4">Create your first SIP trunk to connect your phone system</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={20} />
                            Create SIP Trunk
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {trunks.map((trunk) => (
                            <div key={trunk.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">{trunk.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Created: {new Date(trunk.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                            {trunk.status}
                                        </span>
                                        <button
                                            onClick={() => deleteTrunk(trunk.id, trunk.name)}
                                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                                            title="Delete SIP trunk"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">SIP Domain</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border border-gray-200">
                                                {trunk.sip_domain}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(trunk.sip_domain, `domain-${trunk.id}`)}
                                                className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                {copiedField === `domain-${trunk.id}` ?
                                                    <Check size={16} className="text-green-600" /> :
                                                    <Copy size={16} />
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border border-gray-200">
                                                {trunk.username}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(trunk.username, `user-${trunk.id}`)}
                                                className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                {copiedField === `user-${trunk.id}` ?
                                                    <Check size={16} className="text-green-600" /> :
                                                    <Copy size={16} />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        <strong>Note:</strong> Password was shown only once during creation.
                                        If you lost it, delete this trunk and create a new one.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <h2 className="text-xl font-bold mb-4">Create SIP Trunk</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Give your SIP trunk a name to identify it (e.g., "Main Office", "Sales Team")
                            </p>
                            <input
                                type="text"
                                placeholder="Trunk Name"
                                value={newTrunkName}
                                onChange={(e) => setNewTrunkName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && createTrunk()}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={createTrunk}
                                    disabled={creating || !newTrunkName.trim()}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {creating ? 'Creating...' : 'Create'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewTrunkName('');
                                    }}
                                    disabled={creating}
                                    className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Credentials Modal */}
                {createdTrunk && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-green-100 rounded-full p-2">
                                    <Check className="text-green-600" size={24} />
                                </div>
                                <h2 className="text-xl font-bold">SIP Trunk Created Successfully!</h2>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-900">
                                    <strong>⚠️ Important:</strong> Copy these credentials now!
                                    The password will only be shown once for security reasons.
                                </p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">SIP Domain</label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 text-sm">
                                            {createdTrunk.sip_domain}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(createdTrunk.sip_domain, 'new-domain')}
                                            className="text-gray-600 hover:text-gray-800 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {copiedField === 'new-domain' ?
                                                <Check size={20} className="text-green-600" /> :
                                                <Copy size={20} />
                                            }
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Username</label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 text-sm">
                                            {createdTrunk.username}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(createdTrunk.username, 'new-user')}
                                            className="text-gray-600 hover:text-gray-800 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {copiedField === 'new-user' ?
                                                <Check size={20} className="text-green-600" /> :
                                                <Copy size={20} />
                                            }
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 text-xs break-all">
                                            {createdTrunk.password}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(createdTrunk.password!, 'new-pass')}
                                            className="text-gray-600 hover:text-gray-800 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {copiedField === 'new-pass' ?
                                                <Check size={20} className="text-green-600" /> :
                                                <Copy size={20} />
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm font-medium text-blue-900 mb-2">Next Steps:</p>
                                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                    <li>Copy all credentials above</li>
                                    <li>Open your phone system (3CX, Ziwo, etc.)</li>
                                    <li>Add a new SIP trunk with these credentials</li>
                                    <li>Configure call routing to your AI agents</li>
                                </ol>
                            </div>

                            <button
                                onClick={() => setCreatedTrunk(null)}
                                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                Done - I've Saved the Credentials
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
