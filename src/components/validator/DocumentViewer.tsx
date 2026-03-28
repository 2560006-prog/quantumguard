'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatFileSize } from '@/lib/utils';
import { FileText, ExternalLink, Loader2, Eye } from 'lucide-react';
import { Document } from '@/types';

const DOC_TYPE_LABELS: Record<string, string> = {
  identity: 'Identity Proof',
  land: 'Land Document',
  bank: 'Bank Document',
  crop: 'Crop Certificate',
  other: 'Other',
};

interface Props {
  documents: Document[];
  farmerId: string;
}

export default function DocumentViewer({ documents }: Props) {
  const supabase = createClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function viewDocument(doc: Document) {
    setLoadingId(doc.id);
    try {
      const { data } = await supabase.storage
        .from('farmer-documents')
        .createSignedUrl(doc.file_path, 300);
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    } finally {
      setLoadingId(null);
    }
  }

  if (documents.length === 0) {
    return (
      <div className="py-8 text-center">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No documents uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.08)' }}>
              <FileText className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{doc.document_name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {DOC_TYPE_LABELS[doc.document_type] || doc.document_type} · {formatFileSize(doc.file_size)} · {formatDate(doc.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={() => viewDocument(doc)}
            disabled={loadingId === doc.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ml-2 flex-shrink-0 transition-all"
            style={{ background: 'rgba(34,197,94,0.08)', color: 'var(--accent-green)', border: '1px solid rgba(34,197,94,0.2)' }}>
            {loadingId === doc.id
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Eye className="w-3.5 h-3.5" />}
            View
          </button>
        </div>
      ))}
    </div>
  );
}
