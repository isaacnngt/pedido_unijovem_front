import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Check, X, Package, User, CreditCard, Calendar } from 'lucide-react';

// Serviço para comunicação com a API
const api = {
  baseURL: 'http://localhost:8080/api',

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) throw new Error('Erro ao buscar dados');
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar pedido');
    return response.json();
  },

  async put(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar pedido');
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao deletar pedido');
    return response.json();
  },

  async patch(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Erro ao marcar como entregue');
    return response.json();
  }
};

// Componente principal
export default function DeliverySystem() {
  const [activeTab, setActiveTab] = useState('list');
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nomePessoa: '',
    quantidade: 1,
    formaPagamento: ''
  });

  // Carregar pedidos
  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const data = await api.get('/pedidos');
      setPedidos(data);
    } catch (error) {
      alert('Erro ao carregar pedidos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Usar useEffect para carregar pedidos na inicialização
  useEffect(() => {
    carregarPedidos();
  }, []);

  // Criar pedido
  const criarPedido = async () => {
    if (!formData.nomePessoa || !formData.quantidade) {
      alert('Nome e quantidade são obrigatórios!');
      return;
    }

    try {
      setLoading(true);
      await api.post('/pedidos', formData);
      setFormData({ nomePessoa: '', quantidade: 1, formaPagamento: '' });
      await carregarPedidos();
      setActiveTab('list');
      alert('Pedido criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar pedido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar pedido
  const atualizarPedido = async (id, pedidoAtualizado) => {
    try {
      setLoading(true);
      await api.put(`/pedidos/${id}`, pedidoAtualizado);
      setEditingId(null);
      await carregarPedidos();
      alert('Pedido atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar pedido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Deletar pedido
  const deletarPedido = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este pedido?')) {
      try {
        setLoading(true);
        await api.delete(`/pedidos/${id}`);
        await carregarPedidos();
        alert('Pedido deletado com sucesso!');
      } catch (error) {
        alert('Erro ao deletar pedido: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Marcar como entregue
  const marcarComoEntregue = async (id) => {
    try {
      setLoading(true);
      await api.patch(`/pedidos/${id}/entregar`);
      await carregarPedidos();
      alert('Pedido marcado como entregue!');
    } catch (error) {
      alert('Erro ao marcar como entregue: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Formatar data
  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  // Componente de formulário de edição
  const FormEdicao = ({ pedido, onSave, onCancel }) => {
    const [editData, setEditData] = useState({
      nomePessoa: pedido.nomePessoa,
      quantidade: pedido.quantidade,
      formaPagamento: pedido.formaPagamento || '',
      entregue: pedido.entregue
    });

    const handleSubmit = () => {
      onSave(pedido.id, editData);
    };

    return (
        <div className="edit-form">
          <div className="form-row">
            <input
                type="text"
                value={editData.nomePessoa}
                onChange={(e) => setEditData({...editData, nomePessoa: e.target.value})}
                placeholder="Nome da pessoa"
                required
            />
            <input
                type="number"
                min="1"
                value={editData.quantidade}
                onChange={(e) => setEditData({...editData, quantidade: parseInt(e.target.value)})}
                required
            />
          </div>
          <div className="form-row">
            <input
                type="text"
                value={editData.formaPagamento}
                onChange={(e) => setEditData({...editData, formaPagamento: e.target.value})}
                placeholder="Forma de pagamento"
            />
            <label className="checkbox-label">
              <input
                  type="checkbox"
                  checked={editData.entregue}
                  onChange={(e) => setEditData({...editData, entregue: e.target.checked})}
              />
              Entregue
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleSubmit} className="btn btn-success">Salvar</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancelar</button>
          </div>
        </div>
    );
  };

  return (
      <div className="app">
        <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        .app {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }
        
        .header {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          text-align: center;
        }
        
        .header h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 2.5em;
          font-weight: 600;
        }
        
        .header p {
          color: #666;
          font-size: 1.1em;
        }
        
        .tabs {
          display: flex;
          background: white;
          border-radius: 15px;
          padding: 8px;
          margin-bottom: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .tab {
          flex: 1;
          padding: 15px 25px;
          background: transparent;
          border: none;
          border-radius: 10px;
          font-size: 1em;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .tab:hover:not(.active) {
          background: #f8f9ff;
          color: #333;
        }
        
        .content {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .form {
          max-width: 500px;
          margin: 0 auto;
        }
        
        .form-group {
          margin-bottom: 25px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 1em;
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: 15px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 1em;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn {
          padding: 15px 30px;
          border: none;
          border-radius: 10px;
          font-size: 1em;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .btn-success {
          background: #28a745;
          color: white;
        }
        
        .btn-success:hover {
          background: #218838;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .btn-danger:hover {
          background: #c82333;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #5a6268;
        }
        
        .btn-sm {
          padding: 8px 16px;
          font-size: 0.9em;
        }
        
        .pedidos-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        }
        
        .pedido-card {
          background: #f8f9ff;
          border: 2px solid #e1e5e9;
          border-radius: 15px;
          padding: 25px;
          transition: all 0.3s ease;
        }
        
        .pedido-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border-color: #667eea;
        }
        
        .pedido-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .pedido-id {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .pedido-status {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .status-entregue {
          background: #d4edda;
          color: #155724;
        }
        
        .status-pendente {
          background: #fff3cd;
          color: #856404;
        }
        
        .pedido-info {
          margin-bottom: 20px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          color: #555;
        }
        
        .info-item svg {
          margin-right: 8px;
          color: #667eea;
        }
        
        .pedido-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 1.1em;
        }
        
        .empty {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        
        .empty-icon {
          font-size: 4em;
          margin-bottom: 20px;
          opacity: 0.3;
        }
        
        .edit-form {
          background: #f8f9ff;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #e1e5e9;
        }
        
        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .form-row input {
          flex: 1;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 0.9em;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #555;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .checkbox-label input {
          width: auto !important;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px;
          border-radius: 15px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 2.5em;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 1em;
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .app {
            padding: 10px;
          }
          
          .content {
            padding: 20px;
          }
          
          .pedidos-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            flex-direction: column;
          }
          
          .pedido-actions {
            justify-content: center;
          }
          
          .tabs {
            flex-direction: column;
          }
          
          .tab {
            margin-bottom: 5px;
          }
        }
      `}</style>

        {/* Header */}
        <div className="header">
          <h1>🚀 Sistema de Delivery</h1>
          <p>Gerencie seus pedidos de forma simples e eficiente</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
              className={`tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
          >
            <Package size={20} />
            Listar Pedidos
          </button>
          <button
              className={`tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
          >
            <Plus size={20} />
            Novo Pedido
          </button>
        </div>

        {/* Content */}
        <div className="content">
          {activeTab === 'list' && (
              <div>
                {/* Estatísticas */}
                <div className="stats">
                  <div className="stat-card">
                    <div className="stat-number">{pedidos.length}</div>
                    <div className="stat-label">Total de Pedidos</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{pedidos.filter(p => !p.entregue).length}</div>
                    <div className="stat-label">Pendentes</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{pedidos.filter(p => p.entregue).length}</div>
                    <div className="stat-label">Entregues</div>
                  </div>
                </div>

                {loading ? (
                    <div className="loading">Carregando pedidos...</div>
                ) : pedidos.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon">📦</div>
                      <h3>Nenhum pedido encontrado</h3>
                      <p>Clique em "Novo Pedido" para começar</p>
                    </div>
                ) : (
                    <div className="pedidos-grid">
                      {pedidos.map(pedido => (
                          <div key={pedido.id} className="pedido-card">
                            {editingId === pedido.id ? (
                                <FormEdicao
                                    pedido={pedido}
                                    onSave={atualizarPedido}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <>
                                  <div className="pedido-header">
                                    <span className="pedido-id">#{pedido.id}</span>
                                    <span className={`pedido-status ${pedido.entregue ? 'status-entregue' : 'status-pendente'}`}>
                            {pedido.entregue ? 'Entregue' : 'Pendente'}
                          </span>
                                  </div>

                                  <div className="pedido-info">
                                    <div className="info-item">
                                      <User size={16} />
                                      <strong>{pedido.nomePessoa}</strong>
                                    </div>
                                    <div className="info-item">
                                      <Package size={16} />
                                      Quantidade: {pedido.quantidade}
                                    </div>
                                    {pedido.formaPagamento && (
                                        <div className="info-item">
                                          <CreditCard size={16} />
                                          {pedido.formaPagamento}
                                        </div>
                                    )}
                                    <div className="info-item">
                                      <Calendar size={16} />
                                      {formatarData(pedido.dataPedido)}
                                    </div>
                                  </div>

                                  <div className="pedido-actions">
                                    <button
                                        onClick={() => setEditingId(pedido.id)}
                                        className="btn btn-secondary btn-sm"
                                    >
                                      <Edit3 size={14} />
                                      Editar
                                    </button>

                                    {!pedido.entregue && (
                                        <button
                                            onClick={() => marcarComoEntregue(pedido.id)}
                                            className="btn btn-success btn-sm"
                                        >
                                          <Check size={14} />
                                          Entregar
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deletarPedido(pedido.id)}
                                        className="btn btn-danger btn-sm"
                                    >
                                      <Trash2 size={14} />
                                      Excluir
                                    </button>
                                  </div>
                                </>
                            )}
                          </div>
                      ))}
                    </div>
                )}
              </div>
          )}

          {activeTab === 'create' && (
              <div className="form">
                <h2 style={{textAlign: 'center', marginBottom: '30px', color: '#333'}}>
                  Criar Novo Pedido
                </h2>

                <div>
                  <div className="form-group">
                    <label>Nome da Pessoa *</label>
                    <input
                        type="text"
                        value={formData.nomePessoa}
                        onChange={(e) => setFormData({...formData, nomePessoa: e.target.value})}
                        placeholder="Digite o nome da pessoa"
                    />
                  </div>

                  <div className="form-group">
                    <label>Quantidade *</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.quantidade}
                        onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 1})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Forma de Pagamento</label>
                    <select
                        value={formData.formaPagamento}
                        onChange={(e) => setFormData({...formData, formaPagamento: e.target.value})}
                    >
                      <option value="">Selecione uma opção</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="PIX">PIX</option>
                      <option value="Cartão">Cartão</option>
                      <option value="Débito">Débito</option>
                      <option value="Crédito">Crédito</option>
                    </select>
                  </div>

                  <button
                      type="button"
                      onClick={criarPedido}
                      className="btn btn-primary"
                      disabled={loading}
                      style={{width: '100%'}}
                  >
                    <Plus size={20} />
                    {loading ? 'Criando...' : 'Criar Pedido'}
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}