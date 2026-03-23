import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/transcripts/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
  });

  const handleFileUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  const handleTextUpload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'transcript.txt');
    uploadMutation.mutate(formData);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Therapy Transcript</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Choose File
              </label>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".txt,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {file && <span className="ml-3 text-sm text-gray-500">{file.name}</span>}
            </div>
            <button onClick={handleFileUpload} disabled={!file || uploadMutation.isPending} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Or Paste Text</h3>
            <textarea
              rows={10}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Paste your therapy transcript here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={handleTextUpload} disabled={!text || uploadMutation.isPending} className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Text'}
            </button>
          </div>
          {uploadMutation.isSuccess && <p className="mt-4 text-green-600">Upload successful!</p>}
          {uploadMutation.isError && <p className="mt-4 text-red-600">Upload failed. Please try again.</p>}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;