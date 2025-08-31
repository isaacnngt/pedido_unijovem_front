import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Check, Package, User, CreditCard, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

// Serviço para comunicação com a API
const api = {
  //baseURL: 'http://localhost:8080/api',
  baseURL: 'https://pedidounijovemfront-production.up.railway.app/api',

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
  const [sortConfig, setSortConfig] = useState({ key: 'dataPedido', direction: 'desc' });
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

  // Função de ordenação
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Ordenar pedidos
  const sortedPedidos = [...pedidos].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      if (sortConfig.key === 'dataPedido') {
        return new Date(a[sortConfig.key]) - new Date(b[sortConfig.key]);
      }
      if (typeof a[sortConfig.key] === 'string') {
        return a[sortConfig.key].localeCompare(b[sortConfig.key]);
      }
      return a[sortConfig.key] - b[sortConfig.key];
    } else {
      if (sortConfig.key === 'dataPedido') {
        return new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
      }
      if (typeof b[sortConfig.key] === 'string') {
        return b[sortConfig.key].localeCompare(a[sortConfig.key]);
      }
      return b[sortConfig.key] - a[sortConfig.key];
    }
  });

  // Formatar data
  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Componente de cabeçalho da tabela
  const TableHeader = ({ field, label, sortable = true }) => (
      <th
          className={`table-header ${sortable ? 'sortable' : ''}`}
          onClick={() => sortable && handleSort(field)}
      >
        <div className="header-content">
          {label}
          {sortable && (
              <div className="sort-icons">
                <ChevronUp
                    size={14}
                    className={sortConfig.key === field && sortConfig.direction === 'asc' ? 'active' : ''}
                />
                <ChevronDown
                    size={14}
                    className={sortConfig.key === field && sortConfig.direction === 'desc' ? 'active' : ''}
                />
              </div>
          )}
        </div>
      </th>
  );

  // Componente de linha editável
  const EditableRow = ({ pedido }) => {
    const [editData, setEditData] = useState({
      nomePessoa: pedido.nomePessoa,
      quantidade: pedido.quantidade,
      formaPagamento: pedido.formaPagamento || '',
      entregue: pedido.entregue
    });

    const handleSave = () => {
      atualizarPedido(pedido.id, editData);
    };

    return (
        <tr className="edit-row">
          <td>#{pedido.id}</td>
          <td>
            <input
                type="text"
                value={editData.nomePessoa}
                onChange={(e) => setEditData({...editData, nomePessoa: e.target.value})}
                className="edit-input"
            />
          </td>
          <td>
            <input
                type="number"
                min="1"
                value={editData.quantidade}
                onChange={(e) => setEditData({...editData, quantidade: parseInt(e.target.value)})}
                className="edit-input small"
            />
          </td>
          <td>
            <input
                type="text"
                value={editData.formaPagamento}
                onChange={(e) => setEditData({...editData, formaPagamento: e.target.value})}
                className="edit-input"
            />
          </td>
          <td>
            <label className="checkbox-container">
              <input
                  type="checkbox"
                  checked={editData.entregue}
                  onChange={(e) => setEditData({...editData, entregue: e.target.checked})}
              />
              <span className="checkmark"></span>
            </label>
          </td>
          <td>{formatarData(pedido.dataPedido)}</td>
          <td>
            <div className="action-buttons">
              <button onClick={handleSave} className="btn btn-success btn-sm">
                <Check size={14} />
              </button>
              <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-sm">
                ×
              </button>
            </div>
          </td>
        </tr>
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
            max-width: 1400px;
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

          /* ESTILOS DA TABELA */
          .table-container {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-top: 20px;
          }

          .pedidos-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95em;
          }

          .table-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            border: none;
          }

          .table-header.sortable {
            cursor: pointer;
            user-select: none;
          }

          .table-header.sortable:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
          }

          .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }

          .sort-icons {
            display: flex;
            flex-direction: column;
            gap: 1px;
          }

          .sort-icons svg {
            opacity: 0.5;
            transition: opacity 0.2s;
          }

          .sort-icons svg.active {
            opacity: 1;
          }

          .pedidos-table tr {
            border-bottom: 1px solid #f1f1f1;
            transition: background-color 0.2s;
          }

          .pedidos-table tr:hover {
            background: #f8f9ff;
          }

          .pedidos-table tr:last-child {
            border-bottom: none;
          }

          .pedidos-table td {
            padding: 12px;
            vertical-align: middle;
          }

          .pedido-id {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 500;
            display: inline-block;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 500;
            text-align: center;
          }

          .status-entregue {
            background: #d4edda;
            color: #155724;
          }

          .status-pendente {
            background: #fff3cd;
            color: #856404;
          }

          .action-buttons {
            display: flex;
            gap: 5px;
            align-items: center;
          }

          .btn {
            padding: 8px 12px;
            border: none;
            border-radius: 8px;
            font-size: 0.85em;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .btn-sm {
            padding: 6px 10px;
            font-size: 0.8em;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .btn-success {
            background: #28a745;
            color: white;
          }

          .btn-danger {
            background: #dc3545;
            color: white;
          }

          .btn-secondary {
            background: #6c757d;
            color: white;
          }

          .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }

          /* ESTILOS DA EDIÇÃO INLINE */
          .edit-row {
            background: #f8f9ff !important;
          }

          .edit-input {
            width: 100%;
            padding: 6px 8px;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 0.9em;
          }

          .edit-input.small {
            width: 70px;
          }

          .edit-input:focus {
            outline: none;
            border-color: #667eea;
          }

          .checkbox-container {
            position: relative;
            display: inline-block;
            cursor: pointer;
          }

          .checkbox-container input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
          }

          .checkmark {
            position: absolute;
            top: 0;
            left: 0;
            height: 20px;
            width: 20px;
            background-color: #eee;
            border-radius: 4px;
            border: 2px solid #ddd;
          }

          .checkbox-container:hover input ~ .checkmark {
            background-color: #ccc;
          }

          .checkbox-container input:checked ~ .checkmark {
            background-color: #28a745;
            border-color: #28a745;
          }

          .checkmark:after {
            content: "";
            position: absolute;
            display: none;
          }

          .checkbox-container input:checked ~ .checkmark:after {
            display: block;
          }

          .checkbox-container .checkmark:after {
            left: 6px;
            top: 2px;
            width: 6px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }

          /* FORMULÁRIO */
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

          .loading {
            text-align: center;
            padding: 40px;
            color: #666;
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

          /* RESPONSIVO */
          @media (max-width: 1024px) {
            .pedidos-table {
              font-size: 0.9em;
            }

            .pedidos-table th,
            .pedidos-table td {
              padding: 8px 6px;
            }
          }

          @media (max-width: 768px) {
            .app {
              padding: 10px;
            }

            .content {
              padding: 20px;
              overflow-x: auto;
            }

            .pedidos-table {
              min-width: 800px;
            }

            .stats {
              grid-template-columns: 1fr;
            }

            .tabs {
              flex-direction: column;
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
                    <div className="table-container">
                      <table className="pedidos-table">
                        <thead>
                        <tr>
                          <TableHeader field="id" label="ID" />
                          <TableHeader field="nomePessoa" label="Nome" />
                          <TableHeader field="quantidade" label="Qtd" />
                          <TableHeader field="formaPagamento" label="Pagamento" />
                          <TableHeader field="entregue" label="Status" />
                          <TableHeader field="dataPedido" label="Data" />
                          <th className="table-header">Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedPedidos.map(pedido =>
                            editingId === pedido.id ? (
                                <EditableRow key={pedido.id} pedido={pedido} />
                            ) : (
                                <tr key={pedido.id}>
                                  <td>
                                    <span className="pedido-id">#{pedido.id}</span>
                                  </td>
                                  <td>
                                    <strong>{pedido.nomePessoa}</strong>
                                  </td>
                                  <td>{pedido.quantidade}</td>
                                  <td>{pedido.formaPagamento || '-'}</td>
                                  <td>
                            <span className={`status-badge ${pedido.entregue ? 'status-entregue' : 'status-pendente'}`}>
                              {pedido.entregue ? 'Entregue' : 'Pendente'}
                            </span>
                                  </td>
                                  <td>{formatarData(pedido.dataPedido)}</td>
                                  <td>
                                    <div className="action-buttons">
                                      <button
                                          onClick={() => setEditingId(pedido.id)}
                                          className="btn btn-secondary btn-sm"
                                          title="Editar"
                                      >
                                        <Edit3 size={14} />
                                      </button>

                                      {!pedido.entregue && (
                                          <button
                                              onClick={() => marcarComoEntregue(pedido.id)}
                                              className="btn btn-success btn-sm"
                                              title="Marcar como entregue"
                                          >
                                            <Check size={14} />
                                          </button>
                                      )}

                                      <button
                                          onClick={() => deletarPedido(pedido.id)}
                                          className="btn btn-danger btn-sm"
                                          title="Excluir"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                            )
                        )}
                        </tbody>
                      </table>
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