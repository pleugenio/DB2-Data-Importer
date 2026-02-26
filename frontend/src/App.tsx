import { useState, useRef } from 'react';
import { Upload, Database, FileText, CheckCircle, XCircle, Loader2, ChevronRight } from 'lucide-react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState('ipt.importacao_telefones_claro_fev_2026');
  const [method, setMethod] = useState('P');
  const [columns, setColumns] = useState('1, 2, 3, 4, 6, 7');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string, log?: string }>({
    type: null,
    message: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !tableName) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tableName', tableName);
    formData.append('method', method);
    formData.append('columns', columns);

    try {
      const response = await fetch('http://localhost:8080/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: data.message || 'Importação realizada com sucesso!',
          log: data.log || data.output
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Falha na importação',
          log: data.output
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Erro ao conectar com o servidor. Certifique-se de que o backend Go está rodando.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>DB2 Data Importer</h1>
        <p className="subtitle">Importação simplificada para o banco APNPRD</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tableName">Tabela de Destino</label>
          <div style={{ position: 'relative' }}>
            <Database size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="tableName"
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Ex: ipt.sua_tabela"
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="method">Método</label>
            <input
              id="method"
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="Ex: P"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="columns">Colunas (Method Params)</label>
            <input
              id="columns"
              type="text"
              value={columns}
              onChange={(e) => setColumns(e.target.value)}
              placeholder="Ex: 1, 2, 3"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Arquivo de Dados (.txt, .csv)</label>
          <div 
            className="upload-area" 
            onClick={() => fileInputRef.current?.click()}
            style={{ borderColor: file ? 'var(--primary)' : 'var(--border)' }}
          >
            <Upload className="upload-icon" size={32} />
            {file ? (
              <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 500 }}>Clique para anexar o arquivo</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>O arquivo será processado e excluído imediatamente após o import</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".txt,.csv"
            />
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading || !file}>
          {loading ? (
            <>
              <Loader2 className="loading-spinner" size={18} />
              Processando Importação...
            </>
          ) : (
            <>
              Iniciar Importação para APNPRD
              <ChevronRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
            </>
          )}
        </button>
      </form>

      {status.type && (
        <div className={`status-card ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {status.type === 'success' ? (
              <CheckCircle color="var(--success)" size={24} />
            ) : (
              <XCircle color="var(--error)" size={24} />
            )}
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{status.message}</h3>
            </div>
          </div>

          {status.log && (
            <div className="log-container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <FileText size={14} />
                <span>MESSAGES / LOG OUTPUT</span>
              </div>
              {status.log}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
