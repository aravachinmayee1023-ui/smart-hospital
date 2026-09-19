import React, { useState } from 'react';
import { API_ENDPOINTS } from '../data/initialData';
import { ApiEndpointDoc } from '../types';
import { Terminal, Copy, Check, ChevronDown, ChevronRight, Play } from 'lucide-react';

interface ApiDirectoryViewProps {
  onSelectEndpointForSandbox?: (endpoint: ApiEndpointDoc) => void;
}

export const ApiDirectoryView: React.FC<ApiDirectoryViewProps> = ({ onSelectEndpointForSandbox }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedCurlIndex, setCopiedCurlIndex] = useState<number | null>(null);

  const categories = ['ALL', 'Facilities', 'Beds', 'GeoJSON', 'Emergency'];

  const filteredEndpoints = API_ENDPOINTS.filter((ep) => {
    if (selectedCategory === 'ALL') return true;
    return ep.category === selectedCategory;
  });

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'POST':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'PUT':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'PATCH':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'DELETE':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const generateCurl = (ep: ApiEndpointDoc) => {
    let curl = `curl -X ${ep.method} "http://127.0.0.1:5000${ep.path.replace('<id>', '1').replace('<type>', 'ICU')}"`;
    if (ep.requestBody) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(ep.requestBody)}'`;
    }
    return curl;
  };

  const handleCopyCurl = (ep: ApiEndpointDoc, idx: number) => {
    navigator.clipboard.writeText(generateCurl(ep));
    setCopiedCurlIndex(idx);
    setTimeout(() => setCopiedCurlIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#3D302C]/70 font-semibold">
              RESTful Specifications
            </span>
            <h2 className="text-xl font-bold text-[#3D302C] mt-1">
              API Endpoint Directory & HTTP Contracts
            </h2>
            <p className="text-xs text-[#3D302C]/80 mt-1 max-w-2xl">
              Complete catalog of REST APIs with method signatures, query schemas, JSON payloads, and RFC 7946 compliance.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`btn-api-cat-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#3D302C] text-[#FFF9F5]'
                    : 'bg-[#FCE4DC]/60 text-[#3D302C] hover:bg-[#FCE4DC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Endpoints Accordion List */}
      <div className="space-y-3">
        {filteredEndpoints.map((ep, idx) => {
          const isExpanded = expandedIndex === idx;
          const methodClass = getMethodBadgeClass(ep.method);

          return (
            <div
              key={idx}
              id={`endpoint-card-${idx}`}
              className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-xl overflow-hidden shadow-xs transition-all"
            >
              {/* Endpoint Header Bar */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#FCE4DC]/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${methodClass}`}>
                    {ep.method}
                  </span>
                  <code className="font-mono font-bold text-xs text-[#3D302C]">
                    {ep.path}
                  </code>
                  <span className="text-xs text-[#3D302C]/70 hidden sm:inline">
                    — {ep.summary}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold bg-[#FCE4DC] text-[#3D302C] px-2 py-0.5 rounded">
                    {ep.category}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-[#3D302C]/60" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#3D302C]/60" />
                  )}
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="p-5 border-t border-[#FCE4DC] bg-[#FFF9F5] space-y-4 text-xs">
                  <p className="text-[#3D302C]/80 leading-relaxed">{ep.description}</p>

                  {/* Query Parameters Table */}
                  {ep.queryParams && ep.queryParams.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#3D302C] text-xs">Query Parameters</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-[11px] border border-[#FCE4DC] rounded-lg">
                          <thead className="bg-[#FCE4DC]/50 text-[#3D302C]">
                            <tr>
                              <th className="p-2">Param</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Required</th>
                              <th className="p-2 font-sans">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#FCE4DC]/40">
                            {ep.queryParams.map((q, qIdx) => (
                              <tr key={qIdx}>
                                <td className="p-2 font-bold text-amber-900">{q.name}</td>
                                <td className="p-2 text-[#3D302C]/80">{q.type}</td>
                                <td className="p-2">
                                  {q.required ? (
                                    <span className="text-red-700 font-bold">Yes</span>
                                  ) : (
                                    <span className="text-[#3D302C]/60">No</span>
                                  )}
                                </td>
                                <td className="p-2 font-sans text-[#3D302C]/90">{q.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Request Body JSON (if POST/PUT/PATCH) */}
                  {ep.requestBody && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#3D302C] text-xs">Request Payload (JSON)</h4>
                      <pre className="p-3 rounded-xl bg-[#FCE4DC]/30 border border-[#FCE4DC] font-mono text-[11px] text-[#3D302C] overflow-x-auto">
                        <code>{JSON.stringify(ep.requestBody, null, 2)}</code>
                      </pre>
                    </div>
                  )}

                  {/* Response Example */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#3D302C] text-xs">Response Example (HTTP 200 / 201)</h4>
                    <pre className="p-3 rounded-xl bg-[#3D302C] text-[#FFF9F5] font-mono text-[11px] overflow-x-auto max-h-56">
                      <code>{JSON.stringify(ep.responseExample, null, 2)}</code>
                    </pre>
                  </div>

                  {/* cURL Command Generator */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                    <div className="font-mono text-[11px] text-[#3D302C]/70">
                      Copyable cURL command for testing:
                    </div>
                    <button
                      onClick={() => handleCopyCurl(ep, idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FCE4DC] text-[#3D302C] hover:bg-[#F4B6A6] font-semibold text-xs transition-all cursor-pointer"
                    >
                      {copiedCurlIndex === idx ? (
                        <Check className="h-3.5 w-3.5 text-emerald-800" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedCurlIndex === idx ? 'cURL Copied!' : 'Copy cURL'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
