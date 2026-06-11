import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Search,
  Table2,
  RefreshCw,
  X,
  Edit3,
  PlusCircle,
  Info,
  FileText,
  Server,
  Loader2,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { useDbStore } from '../store/useDbStore';
import { useThemeStore } from '../store/useThemeStore';
import { toast } from '../store/useToastStore';

interface ColumnInfo {
  name: string;
  type: string;
}

interface ColumnBuilder {
  name: string;
  type: string;
  isPk: boolean;
  isNullable: boolean;
  isUnique: boolean;
  isAi: boolean;
  defaultValue: string;
}

export default function Databases() {
  const navigate = useNavigate();
  const { activeConnection, setActiveConnection } = useDbStore();
  const { theme } = useThemeStore();

  // State variables for real database connections
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [tables, setTables] = useState<Record<string, string[]>>({}); // connectionId -> tableNames
  const [loadingTables, setLoadingTables] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedConns, setExpandedConns] = useState<Record<string, boolean>>({});

  // Active selection
  const [activeConnId, setActiveConnId] = useState<string | null>(null);
  const [activeTableName, setActiveTableName] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [rowSearchQuery, setRowSearchQuery] = useState('');

  // Modals state
  const [showCreateDbModal, setShowCreateDbModal] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [newDbConnectionName, setNewDbConnectionName] = useState('');
  const [createDbLoading, setCreateDbLoading] = useState(false);

  // Drop Table Modal states
  const [showDropTableModal, setShowDropTableModal] = useState(false);
  const [tableToDrop, setTableToDrop] = useState('');
  const [connIdForTableDrop, setConnIdForTableDrop] = useState('');
  const [tableDropConfirmInput, setTableDropConfirmInput] = useState('');
  const [tableDropLoading, setTableDropLoading] = useState(false);

  // Delete Connection Modal states
  const [showDeleteConnModal, setShowDeleteConnModal] = useState(false);
  const [connIdToDelete, setConnIdToDelete] = useState<string | null>(null);
  const [connNameToVerify, setConnNameToVerify] = useState('');
  const [connDeleteConfirmInput, setConnDeleteConfirmInput] = useState('');
  const [connDeleteLoading, setConnDeleteLoading] = useState(false);

  const [showCreateColModal, setShowCreateColModal] = useState(false);
  const [activeConnForCol, setActiveConnForCol] = useState<string>('');
  const [newColName, setNewColName] = useState('');
  const [createColLoading, setCreateColLoading] = useState(false);

  // Table Builder dynamic state
  const [builderColumns, setBuilderColumns] = useState<ColumnBuilder[]>([
    { name: 'id', type: 'INT', isPk: true, isNullable: false, isUnique: false, isAi: true, defaultValue: '' },
    { name: 'name', type: 'VARCHAR(255)', isPk: false, isNullable: false, isUnique: false, isAi: false, defaultValue: '' }
  ]);

  const addBuilderColumn = () => {
    setBuilderColumns(prev => [
      ...prev,
      { name: '', type: 'VARCHAR(255)', isPk: false, isNullable: true, isUnique: false, isAi: false, defaultValue: '' }
    ]);
  };

  const removeBuilderColumn = (index: number) => {
    setBuilderColumns(prev => prev.filter((_, i) => i !== index));
  };

  const updateBuilderColumn = (index: number, key: keyof ColumnBuilder, value: any) => {
    setBuilderColumns(prev => prev.map((col, i) => {
      if (i !== index) return col;
      const updated = { ...col, [key]: value };
      if (key === 'isPk' && value === true) {
        updated.isNullable = false;
      }
      if (key === 'isAi' && value === true) {
        updated.isNullable = false;
      }
      return updated;
    }));
  };

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [recordFields, setRecordFields] = useState<Array<{ key: string; value: string }>>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [recordError, setRecordError] = useState('');
  const [savingRecord, setSavingRecord] = useState(false);

  // Fetch connections on load
  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const res = await api.get('/database/list');
      setConnections(res.data);
      if (res.data.length > 0 && !activeConnId) {
        // Automatically expand the first connection
        const firstConn = res.data[0];
        setExpandedConns({ [firstConn._id]: true });
        fetchTables(firstConn._id);
      }
    } catch (error) {
      console.error('Failed to load database connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  const triggerDeleteConnection = (connId: string, connName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnIdToDelete(connId);
    setConnNameToVerify(connName);
    setConnDeleteConfirmInput('');
    setShowDeleteConnModal(true);
  };

  const handleConfirmDeleteConnection = async () => {
    if (!connIdToDelete) return;
    if (connDeleteConfirmInput !== connNameToVerify) {
      toast.error('Confirmation name does not match.');
      return;
    }

    setConnDeleteLoading(true);
    try {
      await api.delete(`/database/${connIdToDelete}`);

      if (activeConnId === connIdToDelete) {
        setActiveConnId(null);
        setActiveTableName(null);
        setRecords([]);
        setColumns([]);
      }

      if (activeConnection?._id === connIdToDelete) {
        setActiveConnection(null);
      }

      toast.success('Database connection deleted successfully.');
      setShowDeleteConnModal(false);
      setConnIdToDelete(null);
      setConnNameToVerify('');
      setConnDeleteConfirmInput('');
      fetchConnections();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to delete connection');
    } finally {
      setConnDeleteLoading(false);
    }
  };

  const triggerDeleteTable = (connId: string, tableName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnIdForTableDrop(connId);
    setTableToDrop(tableName);
    setTableDropConfirmInput('');
    setShowDropTableModal(true);
  };

  const handleConfirmDeleteTable = async () => {
    if (!connIdForTableDrop || !tableToDrop) return;
    if (tableDropConfirmInput !== tableToDrop) {
      toast.error('Table name does not match.');
      return;
    }

    setTableDropLoading(true);

    try {
      const sqlQuery = `DROP TABLE ${escapeId(tableToDrop)}`;
      await api.post('/sql/execute', {
        connectionId: connIdForTableDrop,
        sql: sqlQuery,
        bypassValidator: true
      });
      toast.success(`Table "${tableToDrop}" dropped successfully.`);
      setShowDropTableModal(false);
      setConnIdForTableDrop('');
      setTableToDrop('');
      setTableDropConfirmInput('');
      fetchTables(connIdForTableDrop);
      if (activeConnId === connIdForTableDrop && activeTableName === tableToDrop) {
        setActiveTableName(null);
        setRecords([]);
        setColumns([]);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to drop table.');
    } finally {
      setTableDropLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // Fetch tables list for a connection
  const fetchTables = async (connId: string) => {
    setLoadingTables(prev => ({ ...prev, [connId]: true }));
    try {
      const res = await api.get(`/database/${connId}/tables`);
      setTables(prev => ({ ...prev, [connId]: res.data }));
    } catch (error) {
      console.error(`Failed to load tables for connection ${connId}:`, error);
    } finally {
      setLoadingTables(prev => ({ ...prev, [connId]: false }));
    }
  };

  // Toggle connection tree expansion
  const toggleConnection = (connId: string) => {
    const isExpanded = !!expandedConns[connId];
    setExpandedConns(prev => ({
      ...prev,
      [connId]: !isExpanded
    }));

    if (!isExpanded && (!tables[connId] || tables[connId].length === 0)) {
      fetchTables(connId);
    }
  };

  // Find active connection metadata
  const activeConn = connections.find(c => c._id === activeConnId);

  // Identify primary key column
  const getPrimaryKey = (cols: ColumnInfo[]) => {
    if (cols.length === 0) return 'id';

    // Check if there is an exact column named id, _id, or id with some suffix
    const commonPks = ['id', '_id', 'uuid', 'serial'];
    for (const pk of commonPks) {
      const found = cols.find(c => c.name.toLowerCase() === pk);
      if (found) return found.name;
    }

    // Check for suffix _id or id
    const foundSuffix = cols.find(c => c.name.toLowerCase().endsWith('_id') || c.name.toLowerCase().endsWith('id'));
    if (foundSuffix) return foundSuffix.name;

    // Default to first column
    return cols[0].name;
  };

  const primaryKey = getPrimaryKey(columns);

  // Load Table Data (Columns & Rows)
  const loadTableData = async (connId: string, tableName: string) => {
    setLoadingData(true);
    setActiveConnId(connId);
    setActiveTableName(tableName);
    setRowSearchQuery('');

    try {
      // 1. Fetch Columns
      const colsRes = await api.get(`/database/${connId}/tables/${tableName}/columns`);
      setColumns(colsRes.data);

      // 2. Fetch rows via SQL execute
      // Escape table identifiers properly based on MySQL
      const escapedTable = `\`${tableName}\``;

      const sqlQuery = `SELECT * FROM ${escapedTable} LIMIT 100`;

      const rowsRes = await api.post('/sql/execute', {
        connectionId: connId,
        sql: sqlQuery,
        bypassValidator: true
      });

      setRecords(rowsRes.data.results || []);
    } catch (error: any) {
      console.error('Failed to load table data:', error);
      toast.error(error.response?.data?.message || 'Failed to query database table records.');
    } finally {
      setLoadingData(false);
    }
  };

  // Quoting utility based on MySQL
  const escapeId = (identifier: string) => {
    return `\`${identifier}\``;
  };

  // Real SQL Database CRUD operations

  // 1. CREATE DATABASE
  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDbName = newDbName.trim();
    const cleanConnName = newDbConnectionName.trim();
    if (!cleanDbName) return;

    if (connections.length === 0) {
      toast.error('Please connect to a SQL host/server first.');
      return;
    }

    // Use active connection or fallback to first connection
    const targetConnId = activeConnId || connections[0]._id;

    setCreateDbLoading(true);
    try {
      await api.post('/database/create', {
        connectionId: targetConnId,
        database: cleanDbName,
        name: cleanConnName || undefined
      });
      toast.success(`Database "${cleanDbName}" created and connection "${cleanConnName || cleanDbName}" added successfully!`);
      setNewDbName('');
      setNewDbConnectionName('');
      setShowCreateDbModal(false);
      fetchConnections();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create database on SQL server.');
    } finally {
      setCreateDbLoading(false);
    }
  };

  // 2. CREATE TABLE
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTableName = newColName.trim();
    if (!cleanTableName) return;

    if (builderColumns.length === 0) {
      toast.error('Please add at least one column to the table.');
      return;
    }

    if (builderColumns.some(col => !col.name.trim())) {
      toast.error('All columns must have a valid name.');
      return;
    }

    // Compile dynamic SQL Query based on MySQL
    const escapedTable = `\`${cleanTableName}\``;

    const colDefinitions = builderColumns.map(col => {
      const escapedCol = `\`${col.name.trim()}\``;
      const nullClause = col.isNullable ? '' : 'NOT NULL';
      const pkClause = col.isPk ? 'PRIMARY KEY' : '';
      const uniqueClause = col.isUnique ? 'UNIQUE' : '';
      const aiClause = col.isAi ? 'AUTO_INCREMENT' : '';
      const defaultClause = col.defaultValue.trim() ? `DEFAULT ${col.defaultValue.trim()}` : '';
      return `${escapedCol} ${col.type} ${nullClause} ${pkClause} ${uniqueClause} ${aiClause} ${defaultClause}`.trim().replace(/\s+/g, ' ');
    });
    const sqlQuery = `CREATE TABLE ${escapedTable} (\n  ${colDefinitions.join(',\n  ')}\n)`;

    setCreateColLoading(true);
    try {
      await api.post('/sql/execute', {
        connectionId: activeConnForCol,
        sql: sqlQuery,
        bypassValidator: true
      });

      toast.success(`Table "${cleanTableName}" created successfully!`);
      setNewColName('');
      setBuilderColumns([
        { name: 'id', type: 'INT', isPk: true, isNullable: false, isUnique: false, isAi: true, defaultValue: '' },
        { name: 'name', type: 'VARCHAR(255)', isPk: false, isNullable: false, isUnique: false, isAi: false, defaultValue: '' }
      ]);
      setShowCreateColModal(false);

      // Refresh tables list and select it
      await fetchTables(activeConnForCol);
      loadTableData(activeConnForCol, cleanTableName);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create table in SQL database.');
    } finally {
      setCreateColLoading(false);
    }
  };

  // 4. CRUD - INSERT / UPDATE record
  const openAddRecordModal = () => {
    setEditingRecord(null);
    setRecordError('');

    // Auto populate inputs for all discovered columns
    const fields = columns.map(col => ({
      key: col.name,
      value: ''
    }));

    setRecordFields(fields);
    setShowRecordModal(true);
  };

  const openEditRecordModal = (record: any) => {
    setEditingRecord(record);
    setRecordError('');

    // Auto populate inputs with current values
    const fields = columns.map(col => ({
      key: col.name,
      value: record[col.name] !== null && record[col.name] !== undefined ? String(record[col.name]) : ''
    }));

    setRecordFields(fields);
    setShowRecordModal(true);
  };

  const handleAddFieldToRecord = () => {
    const cleanKey = newFieldName.trim();
    if (!cleanKey) return;
    if (recordFields.some(f => f.key === cleanKey)) {
      toast.error('Field input already in the list.');
      return;
    }
    setRecordFields(prev => [...prev, { key: cleanKey, value: '' }]);
    setNewFieldName('');
  };

  const handleRemoveFieldFromRecord = (index: number) => {
    const field = recordFields[index];
    if (field.key === primaryKey) {
      toast.error(`Cannot remove the primary key "${primaryKey}"`);
      return;
    }
    setRecordFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConnId || !activeTableName) return;

    setSavingRecord(true);
    setRecordError('');

    try {
      if (!editingRecord) {
        // INSERT statement
        const activeFields = recordFields.filter(f => f.value.trim() !== '');

        // Escape standard columns and format strings properly
        const keysClause = activeFields.map(f => escapeId(f.key)).join(', ');
        const valsClause = activeFields.map(f => `'${f.value.replace(/'/g, "''")}'`).join(', ');

        if (activeFields.length === 0) {
          setRecordError('Cannot insert an empty record.');
          setSavingRecord(false);
          return;
        }

        const sqlQuery = `INSERT INTO ${escapeId(activeTableName)} (${keysClause}) VALUES (${valsClause})`;
        await api.post('/sql/execute', {
          connectionId: activeConnId,
          sql: sqlQuery,
          bypassValidator: true
        });
      } else {
        // UPDATE statement
        const pkValue = editingRecord[primaryKey];
        const updateFields = recordFields.filter(f => f.key !== primaryKey);

        const setClause = updateFields.map(f => {
          const val = f.value === '' ? 'NULL' : `'${f.value.replace(/'/g, "''")}'`;
          return `${escapeId(f.key)} = ${val}`;
        }).join(', ');

        if (updateFields.length === 0) {
          setShowRecordModal(false);
          setSavingRecord(false);
          return;
        }

        const sqlQuery = `UPDATE ${escapeId(activeTableName)} SET ${setClause} WHERE ${escapeId(primaryKey)} = '${String(pkValue).replace(/'/g, "''")}'`;
        await api.post('/sql/execute', {
          connectionId: activeConnId,
          sql: sqlQuery,
          bypassValidator: true
        });
      }

      setShowRecordModal(false);
      setEditingRecord(null);
      // Reload table records
      loadTableData(activeConnId, activeTableName);
    } catch (error: any) {
      console.error(error);
      setRecordError(error.response?.data?.message || 'Database error occurred while executing write.');
    } finally {
      setSavingRecord(false);
    }
  };

  // 5. CRUD - DELETE record
  const handleDeleteRecord = async (idValue: any) => {
    if (!activeConnId || !activeTableName) return;
    if (window.confirm(`Are you sure you want to DELETE record where "${primaryKey}" = "${idValue}"?`)) {

      try {
        const sqlQuery = `DELETE FROM ${escapeId(activeTableName)} WHERE ${escapeId(primaryKey)} = '${String(idValue).replace(/'/g, "''")}'`;
        await api.post('/sql/execute', {
          connectionId: activeConnId,
          sql: sqlQuery,
          bypassValidator: true
        });
        toast.success('Record deleted successfully.');
        loadTableData(activeConnId, activeTableName);
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to delete record.');
      }
    }
  };

  // Filtered connections list based on sidebar search query
  const filteredConns = connections.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.database.toLowerCase().includes(searchQuery.toLowerCase());

    const hasMatchedTables = (tables[conn._id] || []).some(t =>
      t.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return matchesSearch || hasMatchedTables;
  });

  // Client-side search filters on active table rows
  const filteredRecords = records.filter(row => {
    if (!rowSearchQuery.trim()) return true;
    return Object.values(row).some(val =>
      String(val).toLowerCase().includes(rowSearchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex h-full w-full bg-background text-foreground font-sans antialiased select-none">

      {/* LEFT SIDEBAR: Real Database Explorer */}
      <aside className={`w-80 border-r border-border bg-card flex flex-col h-full shadow-sm shrink-0 ${
        activeTableName ? 'hidden md:flex' : 'w-full md:w-80 flex'
      }`}>

        {/* Title Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-primary/10 text-primary rounded-md">
              <Database size={20} className="stroke-[2.5]" />
            </div>
            <span className="font-bold text-[18px] text-foreground tracking-tight">Databases</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowCreateDbModal(true)}
              disabled={connections.length === 0}
              className="p-1.5 hover:bg-accent disabled:opacity-50 text-muted-foreground hover:text-primary rounded-md transition-colors tooltip"
              title="Create New Database on Server"
            >
              <Plus size={18} className="stroke-[2.5]" />
            </button>
            <button
              onClick={fetchConnections}
              className="p-1.5 hover:bg-accent text-muted-foreground hover:text-amber-500 rounded-md transition-colors tooltip"
              title="Refresh Databases & Connections"
            >
              <RefreshCw size={14} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="w-full bg-background border border-input hover:border-accent focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none transition-all placeholder:text-muted-foreground text-foreground"
              placeholder="Search tables or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Database Connections Tree List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {loadingConnections ? (
            <div className="flex items-center justify-center p-8 space-x-2 text-muted-foreground">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-xs">Loading servers...</span>
            </div>
          ) : filteredConns.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-3">
              <p>No active SQL connections found.</p>
              <button
                onClick={() => navigate('/app/db-connection')}
                className="inline-flex items-center space-x-1 bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/25 transition-colors"
              >
                <span>Connect Server</span>
                <ExternalLink size={12} />
              </button>
            </div>
          ) : (
            filteredConns.map((conn) => {
              const isExpanded = !!expandedConns[conn._id];
              const isActiveDb = activeConnId === conn._id;
              const connTables = tables[conn._id] || [];
              const isLoadingTables = !!loadingTables[conn._id];

              return (
                <div key={conn._id} className="space-y-0.5 animate-fadeIn">
                  {/* Connection Node */}
                  <div
                    onClick={() => {
                      toggleConnection(conn._id);
                      setActiveConnId(conn._id);
                    }}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${isActiveDb && !activeTableName
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'hover:bg-accent/70 text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="text-muted-foreground group-hover:text-foreground">
                        {isExpanded ? <ChevronDown size={14} className="stroke-[2.5]" /> : <ChevronRight size={14} className="stroke-[2.5]" />}
                      </span>
                      <span className={`${isActiveDb ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        <Server size={15} className="stroke-[2]" />
                      </span>
                      <span className="text-sm font-semibold truncate" title={`${conn.type.toUpperCase()}: ${conn.database}`}>
                        {conn.name} <span className="text-[10px] text-muted-foreground font-normal">({conn.database})</span>
                      </span>
                    </div>

                    {/* Hover Actions */}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pl-2 space-x-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveConnForCol(conn._id);
                          setShowCreateColModal(true);
                        }}
                        className="p-1 hover:bg-background hover:text-primary text-muted-foreground rounded shadow-sm border border-transparent hover:border-border"
                        title="Create New Table"
                      >
                        <Plus size={14} className="stroke-[2.5]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchTables(conn._id);
                        }}
                        className="p-1 hover:bg-background hover:text-amber-500 text-muted-foreground rounded shadow-sm border border-transparent hover:border-border"
                        title="Reload Tables"
                      >
                        <RefreshCw size={11} />
                      </button>
                      <button
                        onClick={(e) => triggerDeleteConnection(conn._id, conn.name, e)}
                        className="p-1 hover:bg-background hover:text-red-500 text-muted-foreground rounded shadow-sm border border-transparent hover:border-border"
                        title="Delete Connection"
                      >
                        <Trash2 size={13} className="stroke-[2]" />
                      </button>
                    </div>
                  </div>

                  {/* Tables List inside Connection */}
                  {isExpanded && (
                    <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-border ml-4.5">
                      {isLoadingTables ? (
                        <div className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-muted-foreground">
                          <Loader2 size={12} className="animate-spin text-primary" />
                          <span>Reading schema...</span>
                        </div>
                      ) : connTables.length === 0 ? (
                        <div
                          onClick={() => {
                            setActiveConnForCol(conn._id);
                            setShowCreateColModal(true);
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-primary hover:underline cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>Create first table</span>
                        </div>
                      ) : (
                        connTables
                          .filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((tableName) => {
                            const isSelectedTable = activeConnId === conn._id && activeTableName === tableName;
                            return (
                              <div
                                key={tableName}
                                onClick={() => loadTableData(conn._id, tableName)}
                                className={`group/table flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all ${isSelectedTable
                                  ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary'
                                  : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                                  }`}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <span className={isSelectedTable ? 'text-primary' : 'text-muted-foreground'}>
                                    <Table2 size={14} className="stroke-[2]" />
                                  </span>
                                  <span className="text-xs font-medium truncate">{tableName}</span>
                                </div>

                                {/* Hover action: drop table */}
                                <button
                                  onClick={(e) => triggerDeleteTable(conn._id, tableName, e)}
                                  className="opacity-0 group-hover/table:opacity-100 p-0.5 hover:bg-background hover:text-red-500 text-muted-foreground rounded transition-opacity"
                                  title="Drop SQL Table"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            );
                          })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col h-full overflow-hidden bg-background ${
        activeTableName ? 'flex' : 'hidden md:flex'
      }`}>

        {loadingData ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">Querying database rows and schemas...</p>
          </div>
        ) : activeTableName ? (
          /* TABLE SELECTED: Live CRUD Operations Panel */
          <div className="flex-1 flex flex-col overflow-hidden bg-card m-0 sm:m-6 sm:rounded-xl sm:border border-border shadow-sm animate-fadeIn">

            {/* Table Header / Dynamic Breadcrumb */}
            <div className="px-4 sm:px-6 py-5 border-b border-border flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2.5 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActiveTableName(null)}
                  className="md:hidden p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                  title="Back to Databases list"
                >
                  <ChevronLeft size={18} className="stroke-[2.5]" />
                </button>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:space-x-3 text-sm min-w-0">
                  <div className="flex items-center space-x-1.5 text-muted-foreground min-w-0">
                    <Server size={15} className="shrink-0" />
                    <span className="font-semibold truncate max-w-[100px]">{activeConn?.name}</span>
                    <span className="text-xs text-muted-foreground/80 truncate max-w-[80px]">({activeConn?.database})</span>
                  </div>
                  <span className="text-muted-foreground/30 font-bold hidden sm:inline">/</span>
                  <div className="flex items-center space-x-1.5 text-foreground font-semibold min-w-0">
                    <Table2 size={16} className="text-primary shrink-0" />
                    <span className="text-sm sm:text-base text-foreground truncate max-w-[120px]">{activeTableName}</span>
                    <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-normal shrink-0">
                      {records.length === 100 ? '100+' : records.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* CRUD Actions Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadTableData(activeConnId!, activeTableName!)}
                  className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  title="Reload Rows"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={openAddRecordModal}
                  className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <PlusCircle size={14} className="stroke-[2.5]" />
                  <span>Insert Row</span>
                </button>
              </div>
            </div>

            {/* Sub-header Filter controls */}
            <div className="px-6 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="relative w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="w-full bg-background border border-input hover:border-accent focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none transition-all placeholder:text-muted-foreground"
                  placeholder="Filter records client-side..."
                  value={rowSearchQuery}
                  onChange={(e) => setRowSearchQuery(e.target.value)}
                />
              </div>
              <div className="text-[11px] text-muted-foreground">
                {rowSearchQuery.trim() && (
                  <span>Matched {filteredRecords.length} rows</span>
                )}
              </div>
            </div>

            {/* Grid Table Container */}
            <div className="flex-1 overflow-auto">
              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card">
                  <div className="p-4 bg-primary/10 text-primary rounded-full mb-3">
                    <FileText size={28} className="stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">No rows found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                    {rowSearchQuery ? 'No records match your filter criteria.' : 'This table is currently empty.'}
                  </p>
                  {!rowSearchQuery && (
                    <button
                      onClick={openAddRecordModal}
                      className="mt-4 inline-flex items-center space-x-1.5 border border-border hover:border-primary/50 bg-background text-primary hover:bg-primary/10 font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
                    >
                      <Plus size={12} className="stroke-[3]" />
                      <span>Insert First Row</span>
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="text-[11px] text-muted-foreground font-semibold bg-muted/40 border-b border-border sticky top-0 uppercase tracking-wider">
                    <tr>
                      {columns.map(col => (
                        <th key={col.name} className="px-5 py-3 border-b font-semibold border-border text-muted-foreground bg-muted/40 whitespace-nowrap" title={`${col.name}: ${col.type}`}>
                          {col.name} <span className="text-[9px] text-muted-foreground/60 font-normal lowercase">({col.type})</span>
                        </th>
                      ))}
                      <th className="px-5 py-3 border-b font-semibold border-border text-right text-muted-foreground bg-muted/40 w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredRecords.map((row, index) => {
                      const pkVal = row[primaryKey];
                      return (
                        <tr
                          key={pkVal !== undefined && pkVal !== null ? String(pkVal) : index}
                          className={`hover:bg-muted/30 transition-colors group/row ${index % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}
                        >
                          {columns.map(col => {
                            const val = row[col.name];
                            const isPk = col.name === primaryKey;
                            return (
                              <td key={col.name} className="px-5 py-3.5 font-mono text-foreground/90 whitespace-nowrap max-w-xs truncate">
                                {isPk ? (
                                  <span className="font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded text-[10px]">
                                    {val !== null ? String(val) : 'NULL'}
                                  </span>
                                ) : val === undefined ? (
                                  <span className="text-muted-foreground/50 italic text-[10px]">undefined</span>
                                ) : val === null ? (
                                  <span className="text-muted-foreground/50 italic text-[10px]">null</span>
                                ) : typeof val === 'object' ? (
                                  JSON.stringify(val)
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}

                          {/* Actions Col */}
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1 opacity-80 hover:opacity-100">
                              <button
                                onClick={() => openEditRecordModal(row)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all"
                                title="Edit Row"
                              >
                                <Edit3 size={13} className="stroke-[2.5]" />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(pkVal)}
                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                                title="Delete Row"
                              >
                                <Trash2 size={13} className="stroke-[2]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Showing {filteredRecords.length} of {records.length} records
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground/80">
                <Info size={12} className="text-muted-foreground/50" />
                <span>Primary key used for writes: <strong>{primaryKey}</strong></span>
              </div>
            </div>

          </div>
        ) : (
          /* DEFAULT LANDING VIEW: General Overview */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background animate-fadeIn">

            <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 shadow-sm text-center">

              {/* Giant Icon */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-violet-500 to-fuchsia-600 text-white rounded-2xl flex items-center justify-center shadow-md mb-6 transform hover:rotate-3 transition-transform">
                <Database size={30} className="stroke-[2]" />
              </div>

              {/* Header Title */}
              <h2 className="text-xl font-bold text-foreground">Database Manager</h2>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed font-normal">
                Welcome to your MySQL database explorer. Choose a connection and select a table from the sidebar to inspect records and perform dynamic SQL-backed CRUD operations.
              </p>

              {/* Server Details summary */}
              <div className="my-6 p-4 bg-muted/20 rounded-xl text-left border border-border space-y-2">
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Connected SQL Servers ({connections.length})</div>
                {connections.slice(0, 3).map(c => (
                  <div key={c._id} className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-foreground">{c.name}</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-normal uppercase">{c.type}</span>
                  </div>
                ))}
                {connections.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No servers connected.</p>
                )}
              </div>

              {/* Helper list */}
              <div className="text-left space-y-2.5 text-xs text-muted-foreground pt-1">
                <div className="flex items-start space-x-2.5">
                  <span className="text-emerald-500 select-none font-bold">✔</span>
                  <span><strong>Live SQL Execution</strong>: Rows are edited directly inside your local or cloud MySQL databases.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="text-emerald-500 select-none font-bold">✔</span>
                  <span><strong>Schema Recognition</strong>: Discovers database table columns and primary keys dynamically.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="text-emerald-500 select-none font-bold">✔</span>
                  <span><strong>Interactive Actions</strong>: Drop tables, drop databases, and write SQL values with single clicks.</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 pt-5 border-t border-border flex items-center justify-center space-x-3">
                <button
                  onClick={() => navigate('/app/db-connection')}
                  className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  <span>Configure Servers</span>
                </button>
                <button
                  onClick={fetchConnections}
                  className="inline-flex items-center bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs px-4 py-2.5 rounded-lg transition-all"
                >
                  <RefreshCw size={12} className="mr-1.5" />
                  <span>Sync Servers</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: Create Database on Server */}
      {showCreateDbModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-card rounded-xl border border-border shadow-xl max-w-sm w-full p-6 mx-4 relative animate-scaleIn">
            <button
              onClick={() => {
                setShowCreateDbModal(false);
                setNewDbName('');
                setNewDbConnectionName('');
              }}
              className="absolute top-4 right-4 p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="font-bold text-foreground text-lg flex items-center space-x-2">
              <Database size={18} className="text-primary" />
              <span>Create SQL Database</span>
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              Runs a live `CREATE DATABASE` statement on your target database server.
            </p>

            <form onSubmit={handleCreateDatabase} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Store Database"
                  className="w-full bg-background border border-input hover:border-accent focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm focus:outline-none transition-all placeholder:text-muted-foreground text-foreground"
                  value={newDbConnectionName}
                  onChange={(e) => setNewDbConnectionName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. store_db"
                  className="w-full bg-background border border-input hover:border-accent focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm focus:outline-none transition-all placeholder:text-muted-foreground font-mono text-foreground"
                  value={newDbName}
                  onChange={(e) => {
                    const dbVal = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                    setNewDbName(dbVal);
                    // Sync connection name to database name by default
                    if (!newDbConnectionName || newDbConnectionName === newDbName) {
                      setNewDbConnectionName(dbVal);
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  disabled={createDbLoading}
                  onClick={() => {
                    setShowCreateDbModal(false);
                    setNewDbName('');
                    setNewDbConnectionName('');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDbLoading || !newDbName}
                  className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  {createDbLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span>Create DB</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Premium Delete Connection Modal (Screenshot Style) */}
      {showDeleteConnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[3px] flex items-center justify-center z-50 animate-fadeIn select-text">
          <div className={`${theme === 'dark' ? 'bg-[#0c0614] border-violet-500/30' : 'bg-card border-violet-200'} rounded-2xl shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] max-w-[440px] w-full p-6 mx-4 relative border animate-scaleIn text-foreground`}>
            <button
              onClick={() => {
                setShowDeleteConnModal(false);
                setConnIdToDelete(null);
                setConnNameToVerify('');
                setConnDeleteConfirmInput('');
              }}
              className="absolute top-5 right-5 p-1.5 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} className="stroke-[2.5]" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-foreground leading-tight">
                Delete Connection
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              <div className="text-[13px] text-muted-foreground leading-relaxed">
                Type <span className={`font-mono font-bold select-all px-1.5 py-0.5 rounded border ${theme === 'dark'
                    ? 'text-primary-foreground bg-primary/20 border-primary/30'
                    : 'text-primary bg-primary/10 border-primary/20'
                  }`}>"{connNameToVerify}"</span> to delete the database connection
              </div>
              <input
                type="text"
                required
                autoFocus
                placeholder={connNameToVerify}
                className={`w-full ${theme === 'dark' ? 'bg-[#130b22]' : 'bg-background'} border border-border hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground/30 shadow-inner`}
                value={connDeleteConfirmInput}
                onChange={(e) => setConnDeleteConfirmInput(e.target.value)}
              />

              {/* Safe check warning about empty databases */}
              <div className={`text-[11px] font-medium rounded-lg p-2.5 flex items-start space-x-1.5 leading-normal ${theme === 'dark'
                  ? 'text-red-400 bg-red-950/20 border border-red-500/20'
                  : 'text-red-600 bg-red-50 border border-red-200'
                }`}>
                <Info size={13} className="shrink-0 mt-0.5" />
                <span>Only empty databases with zero tables are allowed to be deleted. Populate validation will run upon submission.</span>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  disabled={connDeleteLoading}
                  onClick={() => {
                    setShowDeleteConnModal(false);
                    setConnIdToDelete(null);
                    setConnNameToVerify('');
                    setConnDeleteConfirmInput('');
                  }}
                  className={`border border-border/85 bg-transparent ${theme === 'dark' ? 'hover:bg-[#130b22]' : 'hover:bg-muted'} text-muted-foreground hover:text-foreground font-semibold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm focus:outline-none`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={connDeleteLoading || connDeleteConfirmInput !== connNameToVerify}
                  onClick={handleConfirmDeleteConnection}
                  className={`font-semibold text-xs px-4 py-2.5 rounded-lg transition-all focus:outline-none shadow-sm flex items-center space-x-1.5 ${connDeleteConfirmInput === connNameToVerify
                    ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white focus:ring-4 focus:ring-red-500/20'
                    : `${theme === 'dark' ? 'bg-[#181125]' : 'bg-muted'} text-muted-foreground/30 border border-border/30 cursor-not-allowed`
                    }`}
                >
                  {connDeleteLoading ? (
                    <Loader2 size={12} className="animate-spin text-white" />
                  ) : (
                    <span>Delete Connection</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Premium Drop Table Modal (Screenshot Style) */}
      {showDropTableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[3px] flex items-center justify-center z-50 animate-fadeIn select-text">
          <div className={`${theme === 'dark' ? 'bg-[#0c0614] border-violet-500/30' : 'bg-card border-violet-200'} rounded-2xl shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] max-w-[440px] w-full p-6 mx-4 relative border animate-scaleIn text-foreground`}>
            <button
              onClick={() => {
                setShowDropTableModal(false);
                setConnIdForTableDrop('');
                setTableToDrop('');
                setTableDropConfirmInput('');
              }}
              className="absolute top-5 right-5 p-1.5 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} className="stroke-[2.5]" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-foreground leading-tight">
                Drop Table
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              <div className="text-[13px] text-muted-foreground leading-relaxed">
                Type <span className={`font-mono font-bold select-all px-1.5 py-0.5 rounded border ${theme === 'dark'
                    ? 'text-primary-foreground bg-primary/20 border-primary/30'
                    : 'text-primary bg-primary/10 border-primary/20'
                  }`}>"{tableToDrop}"</span> to drop the table
              </div>
              <input
                type="text"
                required
                autoFocus
                placeholder={tableToDrop}
                className={`w-full ${theme === 'dark' ? 'bg-[#130b22]' : 'bg-background'} border border-border hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground/30 shadow-inner`}
                value={tableDropConfirmInput}
                onChange={(e) => setTableDropConfirmInput(e.target.value)}
              />

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  disabled={tableDropLoading}
                  onClick={() => {
                    setShowDropTableModal(false);
                    setConnIdForTableDrop('');
                    setTableToDrop('');
                    setTableDropConfirmInput('');
                  }}
                  className={`border border-border/85 bg-transparent ${theme === 'dark' ? 'hover:bg-[#130b22]' : 'hover:bg-muted'} text-muted-foreground hover:text-foreground font-semibold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm focus:outline-none`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={tableDropLoading || tableDropConfirmInput !== tableToDrop}
                  onClick={handleConfirmDeleteTable}
                  className={`font-semibold text-xs px-4 py-2.5 rounded-lg transition-all focus:outline-none shadow-sm flex items-center space-x-1.5 ${tableDropConfirmInput === tableToDrop
                    ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white focus:ring-4 focus:ring-red-500/20'
                    : `${theme === 'dark' ? 'bg-[#181125]' : 'bg-muted'} text-muted-foreground/30 border border-border/30 cursor-not-allowed`
                    }`}
                >
                  {tableDropLoading ? (
                    <Loader2 size={12} className="animate-spin text-white" />
                  ) : (
                    <span>Drop Table</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Table inside active Database */}
      {showCreateColModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 overflow-y-auto p-4 animate-fadeIn">
          <div className="bg-card rounded-xl border border-border shadow-xl max-w-4xl w-full p-6 relative my-auto animate-scaleIn">
            <button
              onClick={() => {
                setShowCreateColModal(false);
                setNewColName('');
                setBuilderColumns([
                  { name: 'id', type: 'INT', isPk: true, isNullable: false, isUnique: false, isAi: true, defaultValue: '' },
                  { name: 'name', type: 'VARCHAR(255)', isPk: false, isNullable: false, isUnique: false, isAi: false, defaultValue: '' }
                ]);
              }}
              className="absolute top-4 right-4 p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="font-bold text-foreground text-lg flex items-center space-x-2">
              <Table2 size={18} className="text-primary" />
              <span>Create Table</span>
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              Add a new table inside database connection <strong>"{connections.find(c => c._id === activeConnForCol)?.name}"</strong>.
            </p>

            <form onSubmit={handleCreateTable} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. customer_profiles"
                  className="w-full bg-background border border-input hover:border-accent focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm focus:outline-none transition-all placeholder:text-muted-foreground font-mono text-foreground"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                />
              </div>

              {/* Dynamic Column Builder Area */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Columns Configuration
                  </label>
                  <button
                    type="button"
                    onClick={addBuilderColumn}
                    className="inline-flex items-center space-x-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded transition-colors"
                  >
                    <Plus size={12} className="stroke-[2.5]" />
                    <span>Add Column</span>
                  </button>
                </div>

                <div className="border border-border rounded-lg overflow-hidden bg-background">
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Column Name</th>
                        <th className="px-4 py-2 text-left font-semibold">Datatype</th>
                        <th className="px-2 py-2 text-center font-semibold w-10" title="Primary Key">PK</th>
                        <th className="px-2 py-2 text-center font-semibold w-10" title="Not Null">NN</th>
                        <th className="px-2 py-2 text-center font-semibold w-10" title="Unique">UQ</th>
                        <th className="px-2 py-2 text-center font-semibold w-10" title="Auto Increment">AI</th>
                        <th className="px-4 py-2 text-left font-semibold w-40">Default Value</th>
                        <th className="px-3 py-2 text-center font-semibold w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                      {builderColumns.map((col, idx) => (
                        <tr key={idx} className="hover:bg-muted/10 transition-colors">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              required
                              placeholder="col_name"
                              className="w-full bg-transparent border-0 focus:ring-0 px-1 py-0.5 text-xs text-foreground focus:outline-none focus:border-b focus:border-primary font-mono placeholder:text-muted-foreground/30"
                              value={col.name}
                              onChange={(e) => updateBuilderColumn(idx, 'name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              required
                              list="column-datatypes"
                              placeholder="VARCHAR(255)"
                              className="w-full bg-transparent border-0 focus:ring-0 px-1 py-0.5 text-xs text-foreground focus:outline-none focus:border-b focus:border-primary font-mono"
                              value={col.type}
                              onChange={(e) => updateBuilderColumn(idx, 'type', e.target.value)}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded text-primary focus:ring-primary bg-background border-input"
                              checked={col.isPk}
                              onChange={(e) => updateBuilderColumn(idx, 'isPk', e.target.checked)}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded text-primary focus:ring-primary bg-background border-input"
                              checked={!col.isNullable}
                              disabled={col.isPk || col.isAi}
                              onChange={(e) => updateBuilderColumn(idx, 'isNullable', !e.target.checked)}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded text-primary focus:ring-primary bg-background border-input"
                              checked={col.isUnique}
                              onChange={(e) => updateBuilderColumn(idx, 'isUnique', e.target.checked)}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded text-primary focus:ring-primary bg-background border-input"
                              checked={col.isAi}
                              disabled={col.isNullable}
                              onChange={(e) => updateBuilderColumn(idx, 'isAi', e.target.checked)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              placeholder="e.g. NULL, 'User', 0"
                              className="w-full bg-transparent border-0 focus:ring-0 px-1 py-0.5 text-xs text-foreground focus:outline-none focus:border-b focus:border-primary font-mono placeholder:text-muted-foreground/30"
                              value={col.defaultValue}
                              onChange={(e) => updateBuilderColumn(idx, 'defaultValue', e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeBuilderColumn(idx)}
                              className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              title="Delete Column"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  disabled={createColLoading}
                  onClick={() => {
                    setShowCreateColModal(false);
                    setNewColName('');
                    setBuilderColumns([
                      { name: 'id', type: 'INT', isPk: true, isNullable: false, isUnique: false, isAi: true, defaultValue: '' },
                      { name: 'name', type: 'VARCHAR(255)', isPk: false, isNullable: false, isUnique: false, isAi: false, defaultValue: '' }
                    ]);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createColLoading || !newColName}
                  className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  {createColLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span>Create Table</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add/Edit Document Record */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 overflow-y-auto p-4 animate-fadeIn">
          <div className="bg-card rounded-xl border border-border shadow-xl max-w-md w-full p-6 relative my-auto animate-scaleIn">
            <button
              onClick={() => {
                setShowRecordModal(false);
                setRecordFields([]);
                setEditingRecord(null);
                setRecordError('');
              }}
              className="absolute top-4 right-4 p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="font-bold text-foreground text-lg flex items-center space-x-2">
              <FileText size={18} className="text-primary" />
              <span>{editingRecord ? 'Edit Row Values' : 'Insert Row Record'}</span>
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              {editingRecord ? `Modify values for selected record inside "${activeTableName}".` : `Provide column values to write into "${activeTableName}".`}
            </p>

            <form onSubmit={handleSaveRecord} className="mt-5 space-y-4">

              {recordError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg font-medium max-h-24 overflow-y-auto">
                  {recordError}
                </div>
              )}

              {/* Dynamic input fields based on Columns */}
              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3">
                {recordFields.map((field, idx) => {
                  const isPk = field.key === primaryKey;
                  const colInfo = columns.find(c => c.name === field.key);
                  return (
                    <div key={idx} className="flex items-center space-x-2 group">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            {field.key} {colInfo && <span className="text-[9px] text-muted-foreground/60 font-mono font-normal">({colInfo.type})</span>} {isPk && <span className="text-primary font-bold">*</span>}
                          </span>
                          {!isPk && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFieldFromRecord(idx)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-500/10 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Ignore Column in write"
                            >
                              <X size={10} className="stroke-[3]" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          required={isPk && !editingRecord}
                          disabled={isPk && !!editingRecord}
                          placeholder={isPk ? 'Auto-increment or unique ID' : `value for ${field.key}`}
                          className={`w-full bg-background border border-input hover:border-accent focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm focus:outline-none transition-all placeholder:text-muted-foreground/50 font-mono text-foreground ${isPk && !!editingRecord ? 'opacity-60 cursor-not-allowed bg-muted' : ''
                            }`}
                          value={field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRecordFields(prev => prev.map((f, i) => i === idx ? { ...f, value: val } : f));
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Field row for dynamic DBs */}
              <div className="pt-2.5 border-t border-border">
                <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Add Custom Parameter Column
                </span>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Column name (e.g. status)"
                    className="flex-1 bg-background border border-input hover:border-accent focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-1.5 text-xs focus:outline-none transition-all font-mono text-foreground"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  />
                  <button
                    type="button"
                    onClick={handleAddFieldToRecord}
                    className="inline-flex items-center space-x-1 bg-muted hover:bg-muted/80 active:bg-muted/65 border border-border text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus size={12} className="stroke-[2.5]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
                <button
                  type="button"
                  disabled={savingRecord}
                  onClick={() => {
                    setShowRecordModal(false);
                    setRecordFields([]);
                    setEditingRecord(null);
                    setRecordError('');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRecord}
                  className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  {savingRecord ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span>Save Values</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Datalist presets for rich SQL Datatypes */}
      <datalist id="column-datatypes">
        {/* Numeric */}
        <option value="INT" />
        <option value="BIGINT" />
        <option value="MEDIUMINT" />
        <option value="TINYINT" />
        <option value="DECIMAL(10,2)" />
        <option value="FLOAT" />
        <option value="DOUBLE" />
        <option value="REAL" />
        {/* Text */}
        <option value="VARCHAR(255)" />
        <option value="VARCHAR(100)" />
        <option value="VARCHAR(45)" />
        <option value="TEXT" />
        <option value="TINYTEXT" />
        <option value="JSON" />
        {/* Date/Time */}
        <option value="DATE" />
        <option value="TIME" />
        <option value="DATETIME" />
        <option value="TIMESTAMP" />
        <option value="YEAR" />
        {/* Binary/Blob */}
        <option value="BLOB" />
        <option value="LONGBLOB" />
        <option value="TINYBLOB" />
        <option value="BINARY(16)" />
        <option value="VARBINARY(255)" />
        {/* Spatial/Geometry */}
        <option value="GEOMETRY" />
        <option value="POINT" />
        <option value="LINESTRING" />
        <option value="POLYGON" />
        {/* Other */}
        <option value="BOOLEAN" />
      </datalist>

    </div>
  );
}
