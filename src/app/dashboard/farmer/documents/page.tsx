'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Upload, FileText, Trash2, ExternalLink, Loader2, Plus } from 'lucide-react';
import { Document } from '@/types';

const DOC_TYPES = [
  { value: 'identity', label: 'Identity Proof (Aadhaar/PAN)' },
  { value: 'land', label: 'Land Ownership / 7/12 Extract' },
  { value: 'bank', label: 'Bank Passbook / Cancelled Cheque' },
  { value: 'crop', label: 'Crop Insurance / Certificate' },
  { value: 'other', label: 'Other Document' },
];

export default function FarmerDocumentsPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('identity');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('farmer_profiles').select('id').eq('user_id', user.id).single();

      if (profile) {
        setFarmerId(profile.id);
        const { data: docs } = await supabase
          .from('documents').select('*').eq('farmer_id', profile.id).order('created_at', { ascending: false });
        setDocuments(docs || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    setSelectedFile(file);
    if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''));
  }

  async function handleUpload() {
    if (!selectedFile || !docName || !farmerId || !userId) {
      toast.error('Please fill in document name and select a file');
      return;
    }
    if (!farmerId) { toast.error('Please complete your profile first'); return; }

    setUploading(true);
    try {
      const ext = selectedFile.name.split('.').pop();
      const path = `${userId}/${Date.now()}_${docName.replace(/\s+/g, '_')}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('farmer-documents').upload(path, selectedFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from('farmer-documents').createSignedUrl(path, 60 * 60 * 24 * 365);

      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
          farmer_id: farmerId,
          user_id: userId,
          document_name: docName,
          document_type: docType,
          file_url: urlData?.signedUrl || '',
          file_path: path,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      setDocuments(prev => [doc, ...prev]);
      setDocName('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Document uploaded!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.document_name}"?`)) return;
    try {
      await supabase.storage.from('farmer-documents').remove([doc.file_path]);
      await supabase.from('documents').delete().eq('id', doc.id);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  }

  async function viewDocument(doc: Document) {
    const { data } = await supabase.storage
      .from('farmer-documents').createSignedUrl(doc.file_path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  }

  if (loading) return <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-green)' }} /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Documents</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Upload land records, identity proof, and other required documents</p>
      </div>

      {!farmerId && (
        <div className="card p-5 mb-6 text-center">
          <p style={{ color: 'var(--text-muted)' }}>Please complete your profile before uploading documents.</p>
        </div>
      )}

      {farmerId && (
        <div className="card p-5 mb-6">
          <p className="section-label">Upload New Document</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Document Name *</label>
                <input value={docName} onChange={e => setDocName(e.target.value)}
                  className="input-field" placeholder="e.g. Land Record 7/12" />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Document Type *</label>
                <select value={docType} onChange={e => setDocType(e.target.value)} className="input-field">
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
              {selectedFile ? (
                <div>
                  <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent-green)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatFileSize(selectedFile.size)}</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Click to select file</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PDF, JPG, PNG up to 10MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} className="hidden" />

            <button onClick={handleUpload} disabled={uploading || !selectedFile || !docName}
              className="btn-primary">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="card overflow-hidden">
        <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Uploaded Documents ({documents.length})
          </p>
        </div>
        {documents.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34,197,94,0.08)' }}>
                    <FileText className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{doc.document_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {DOC_TYPES.find(t => t.value === doc.document_type)?.label} · {formatDate(doc.created_at)} · {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => viewDocument(doc)} className="p-2 rounded-lg transition-colors hover:bg-white/5" title="View">
                    <ExternalLink className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button onClick={() => handleDelete(doc)} className="p-2 rounded-lg transition-colors hover:bg-red-500/10" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
