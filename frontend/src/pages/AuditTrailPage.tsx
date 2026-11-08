import React, { useState } from 'react';
import { History, ShieldCheck, Search, Clock, UserCheck } from 'lucide-react';
import { getAuditLogs } from '../services/storage';
import { AuditLog } from '../types';

interface AuditTrailPageProps {
  onNavigate: (tab: string) => void;
}

export const AuditTrailPage: React.FC<AuditTrailPageProps> = () => {
  const [logs] = useState<AuditLog[]>(getAuditLogs());
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.performed_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.target_entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 text-indigo-400 flex items-center justify-center">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">System Compliance & Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable historical log of all session creations, biometric consent events, and manual corrections.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search audit actions or actors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Action</th>
                <th className="py-3.5 px-6">Performed By</th>
                <th className="py-3.5 px-6">Target Entity</th>
                <th className="py-3.5 px-6">Reason / Compliance Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {log.performed_by}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600 text-[11px]">
                      {log.target_entity}
                    </td>
                    <td className="py-4 px-6 text-slate-600 leading-relaxed">
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
