import React, { useState } from 'react';
import { BACKEND_FILES, CodeFile } from '../data/backendCode';
import { FileCode2, Copy, Check, Terminal, ExternalLink, Code } from 'lucide-react';

export const CodeInspectorView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(BACKEND_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#3D302C]/70 font-semibold">
              Source Code Implementation
            </span>
            <h2 className="text-xl font-bold text-[#3D302C] mt-1">
              Python Flask Backend Codebase
            </h2>
            <p className="text-xs text-[#3D302C]/80 mt-1 max-w-2xl">
              Inspect the real, production-ready Python files generated in the workspace. Designed according to the Senior Backend Architect blueprint with complete modularity.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FCE4DC] px-3.5 py-2 rounded-xl text-xs font-mono text-[#3D302C]">
            <Terminal className="h-4 w-4 text-[#3D302C]" />
            <span>cd backend && flask run</span>
          </div>
        </div>
      </div>

      {/* Code Browser Grid: File List & Code Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: File Tree List */}
        <div className="md:col-span-4 bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-4 shadow-xs space-y-1">
          <div className="text-xs font-bold text-[#3D302C] px-3 py-2 border-b border-[#FCE4DC] mb-2 flex items-center justify-between">
            <span>Workspace Files</span>
            <span className="font-mono text-[10px] text-[#3D302C]/70">
              {BACKEND_FILES.length} modules
            </span>
          </div>

          <div className="space-y-1">
            {BACKEND_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#3D302C] text-[#FFF9F5] font-semibold shadow-xs'
                      : 'text-[#3D302C] hover:bg-[#FCE4DC]/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode2 className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#F4B6A6]' : 'text-[#3D302C]/60'}`} />
                    <span className="font-mono truncate">{file.name}</span>
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-[#FFF9F5]/20 text-[#FFF9F5]' : 'bg-[#FCE4DC] text-[#3D302C]/80'
                  }`}>
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Inspector */}
        <div className="md:col-span-8 bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* File Info Bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[#FCE4DC] mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm font-bold text-[#3D302C]">
                    /{selectedFile.path}
                  </code>
                  <span className="text-[10px] uppercase font-bold bg-[#F4B6A6] text-[#3D302C] px-2 py-0.5 rounded">
                    Python
                  </span>
                </div>
                <p className="text-xs text-[#3D302C]/70 mt-1">
                  {selectedFile.description}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FCE4DC] text-[#3D302C] hover:bg-[#F4B6A6] font-semibold text-xs transition-all cursor-pointer shadow-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-800" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy File'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-[#3D302C] text-[#FFF9F5] font-mono text-xs leading-relaxed overflow-x-auto max-h-[520px] scrollbar-thin">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#FCE4DC] flex items-center justify-between text-[11px] text-[#3D302C]/70 font-mono">
            <span>Syntax: Clean Python 3.10+ PEP8</span>
            <span>Path: /backend/{selectedFile.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
