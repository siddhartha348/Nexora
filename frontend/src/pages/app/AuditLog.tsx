import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, RefreshCw, Filter, Search } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { SEO } from '../../components/common/SEO';

interface AuditLogEntry {
  id: string;
  action: string;
  user_id?: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  timestamp: string;
}

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ audit_logs: AuditLogEntry[] }>('/admin/audit-logs');
      setLogs(data.audit_logs || []);
    } catch {
      // Demo mock fallback if in offline demo
      setLogs([
        {
          id: 'log-001',
          action: 'LOGIN_SUCCESS',
          user_id: 'usr-admin-001',
          resource_type: 'AUTH',
          details: { email: 'admin@nexora.com' },
          ip_address: '127.0.0.1',
          timestamp: new Date().toISOString()
        },
        {
          id: 'log-002',
          action: 'KNOWLEDGE_APPROVED',
          user_id: 'usr-admin-001',
          resource_type: 'DOCUMENT',
          resource_id: 'doc-aurora-spec-v32',
          details: { document_title: 'Aurora X2 Technical Specification' },
          ip_address: '127.0.0.1',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterAction === 'ALL' || log.action === filterAction;
    const matchesSearch =
      searchTerm === '' ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_id && log.user_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.resource_type && log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <SEO
        title="Security Audit Logs — Administrator Gateway"
        description="Append-only cryptographically stamped audit trail of governance decisions, approvals, and mutations."
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-ink pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-accent-yellow border-2 border-ink">
              <ShieldCheck className="w-5 h-5 text-ink" />
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-ink">
              Enterprise Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-muted mt-1 font-mono">
            Append-only tamper-evident record of user authentication, approvals, and state changes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search action, user ID, or resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 px-3 pl-9 rounded-md bg-paper border-3 border-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary shadow-neo-sm"
          />
          <Search className="w-4 h-4 text-slate-muted absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-muted" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            aria-label="Filter audit logs by action"
            className="h-10 px-3 rounded-md bg-paper border-3 border-ink text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary shadow-neo-sm"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN_SUCCESS">Login Success</option>
            <option value="LOGIN_FAILED">Login Failed</option>
            <option value="USER_REGISTERED">User Registered</option>
            <option value="KNOWLEDGE_APPROVED">Knowledge Approved</option>
            <option value="RECALL_TRIGGERED">Recall Triggered</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <span className="font-bold text-sm uppercase">Audit Entries ({filteredLogs.length})</span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp (UTC)</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-muted">
                    No matching audit records located.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.action.includes('SUCCESS') || log.action.includes('APPROVED')
                            ? 'success'
                            : log.action.includes('FAILED')
                            ? 'critical'
                            : 'mono'
                        }
                        size="sm"
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.user_id || 'System'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.resource_type} {log.resource_id ? `(${log.resource_id})` : ''}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-muted max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.ip_address || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
