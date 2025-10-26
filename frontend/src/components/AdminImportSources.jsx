import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

export default function AdminImportSources({ currentUser }) {
  const [sources, setSources] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [rateLimit, setRateLimit] = useState(100);

  useEffect(() => {
    loadSources();
    loadStats();
  }, []);

  const loadSources = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/import-sources`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSources(data.sources);
      }
    } catch (err) {
      setError('Chyba pri nacitani zdroju');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/import-stats`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Chyba pri nacitani statistik:', err);
    }
  };

  const loadSourceDetail = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/import-sources/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSelectedSource(data);
        setShowDetailModal(true);
      }
    } catch (err) {
      setError('Chyba pri nacitani detailu');
      console.error(err);
    }
  };

  const generateApiKey = async (agentId, rateLimit) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/import-sources/${agentId}/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rate_limit: rateLimit })
      });
      const data = await response.json();
      if (data.success) {
        setShowGenerateModal(false);
        loadSources();
        setSelectedSource(data);
        setShowApiKeyModal(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Chyba pri generovani API klice');
      console.error(err);
    }
  };

  const updateSource = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/import-sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        loadSources();
        if (showDetailModal) {
          loadSourceDetail(id);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Chyba pri aktualizaci');
      console.error(err);
    }
  };

  const regenerateApiKey = async (id) => {
    if (!confirm('Opravdu chcete regenerovat API klic? Stary klic prestane fungovat.')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/import-sources/${id}/regenerate-key`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSelectedSource(data);
        setShowApiKeyModal(true);
        loadSources();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Chyba pri regeneraci klice');
      console.error(err);
    }
  };

  const revokeApiKey = async (id) => {
    if (!confirm('Opravdu chcete odebrat API pristup tomuto agentovi?')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/import-sources/${id}/revoke-key`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        loadSources();
        setShowDetailModal(false);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Chyba pri odebirani pristupu');
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Zkopirováno do schránky');
  };

  if (loading) {
    return <div className="p-6">Nacitam...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Import API - Agenti</h1>
            <p className="text-gray-600 text-sm mt-1">Sprava API pristupu pro agenty</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">×</button>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-gray-600 text-sm">Celkem zdroju</div>
              <div className="text-2xl font-bold text-blue-600">{stats.total_stats.total_sources}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-gray-600 text-sm">Celkem importu</div>
              <div className="text-2xl font-bold">{stats.total_stats.total_imports}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-gray-600 text-sm">Uspesnych</div>
              <div className="text-2xl font-bold text-green-600">{stats.total_stats.successful}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-gray-600 text-sm">Chybnych</div>
              <div className="text-2xl font-bold text-red-600">{stats.total_stats.failed}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spolecnost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Pristup</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Importy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uspesnost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posledni import</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sources.map(source => {
              const successRate = source.total_imports > 0 
                ? Math.round((source.successful_imports / source.total_imports) * 100) 
                : 0;
              
              return (
                <tr key={source.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{source.name}</div>
                    <div className="text-sm text-gray-500">{source.email}</div>
                    <div className="text-sm text-gray-500">{source.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{source.company_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {source.api_key ? (
                      <div>
                        <div className="text-xs text-green-600 font-medium">Aktivni</div>
                        <div className="text-xs text-gray-500">Limit: {source.rate_limit}/h</div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAgentId(source.id);
                          setRateLimit(100);
                          setShowGenerateModal(true);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Vygenerovat klic
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {source.total_imports || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{successRate}%</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {source.last_import ? new Date(source.last_import).toLocaleString('cs-CZ') : 'Nikdy'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => updateSource(source.id, { is_active: source.is_active ? 0 : 1 })}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        source.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {source.is_active ? 'Aktivni' : 'Neaktivni'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadSourceDetail(source.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Detail
                      </button>
                      {source.api_key && (
                        <button
                          onClick={() => updateSource(source.id, { rate_limit: prompt('Novy rate limit:', source.rate_limit) || source.rate_limit })}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                          Upravit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Vygenerovat API klic</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate limit (requestu/hodina)
              </label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="1000"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => generateApiKey(selectedAgentId, rateLimit)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
              >
                Vygenerovat
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-300"
              >
                Zrusit
              </button>
            </div>
          </div>
        </div>
      )}

      {showApiKeyModal && selectedSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">API Klic</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-800 mb-2">
                DULEZITE: Tento API klic se zobrazi pouze jednou. Ulozte si ho na bezpecne misto.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <code className="text-sm break-all">{selectedSource.source?.api_key}</code>
                <button
                  onClick={() => copyToClipboard(selectedSource.source?.api_key)}
                  className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Kopirovat
                </button>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Priklad pouziti:</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST http://localhost:3001/api/import/properties \\
  -H "X-API-Key: ${selectedSource.source?.api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "external_id": "RK123",
    "transaction_type": "sale",
    "property_type": "flat",
    "price": 5000000,
    "title": "Byt 2+kk",
    "description": "Popis...",
    "city": "Praha",
    "area": 65
  }'`}
              </pre>
            </div>
            <button
              onClick={() => setShowApiKeyModal(false)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              Rozumim
            </button>
          </div>
        </div>
      )}

      {showDetailModal && selectedSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedSource.source.name}</h2>
                <p className="text-gray-600">ID: {selectedSource.source.id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Celkem importu</div>
                <div className="text-2xl font-bold">{selectedSource.stats.total_imports}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Uspesnych</div>
                <div className="text-2xl font-bold text-green-600">{selectedSource.stats.successful}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Chybnych</div>
                <div className="text-2xl font-bold text-red-600">{selectedSource.stats.failed}</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-3">Informace</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div>{selectedSource.source.email || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Telefon</div>
                  <div>{selectedSource.source.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Spolecnost</div>
                  <div>{selectedSource.source.company_name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">API Pristup</div>
                  <div>{selectedSource.source.api_key ? 'Aktivni' : 'Neaktivni'}</div>
                </div>
                {selectedSource.source.api_key && (
                  <div>
                    <div className="text-sm text-gray-600">Rate limit</div>
                    <div>{selectedSource.source.rate_limit} requestu/hodina</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-600">Posledni import</div>
                  <div>{selectedSource.stats.last_import ? new Date(selectedSource.stats.last_import).toLocaleString('cs-CZ') : 'Nikdy'}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-3">Posledni importy</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Datum</th>
                      <th className="px-4 py-2 text-left">Akce</th>
                      <th className="px-4 py-2 text-left">External ID</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSource.recent_imports.map(log => (
                      <tr key={log.id}>
                        <td className="px-4 py-2">{new Date(log.created_at).toLocaleString('cs-CZ')}</td>
                        <td className="px-4 py-2">{log.action}</td>
                        <td className="px-4 py-2">{log.external_id || '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2">
              {selectedSource.source.api_key ? (
                <>
                  <button
                    onClick={() => regenerateApiKey(selectedSource.source.id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700"
                  >
                    Regenerovat API klic
                  </button>
                  <button
                    onClick={() => revokeApiKey(selectedSource.source.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    Odebrat pristup
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAgentId(selectedSource.source.id);
                    setRateLimit(100);
                    setShowGenerateModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                >
                  Vygenerovat API klic
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="ml-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
              >
                Zavrit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
