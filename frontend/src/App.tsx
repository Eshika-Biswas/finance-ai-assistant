import { useState, useCallback } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { useDropzone } from 'react-dropzone'

const API = 'http://127.0.0.1:8000'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    setFile(f)
    setResult(null)
    setError('')
    if (f.type.startsWith('image')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1
  })

  const handleSubmit = async () => {
    if (!file || !question.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    const form = new FormData()
    form.append('file', file)
    form.append('question', question)

    try {
      const res = await axios.post(`${API}/analyze`, form)
      setResult(res.data)
    } catch (e: any) {
      setError(e.response?.data?.error || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      maxWidth: 820,
      margin: '0 auto',
      padding: '32px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      color: '#1a1a1a'
    }}>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
          Finance AI Assistant
        </h1>
        <p style={{ color: '#666', marginTop: 8, fontSize: 15 }}>
          Upload a receipt, invoice, or credit card statement and ask about any charge.
        </p>
      </div>

      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? '#5c67f2' : '#d0d0d0'}`,
        borderRadius: 12,
        padding: 40,
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: 20,
        background: file ? '#f0fff4' : isDragActive ? '#f0f0ff' : '#fafafa',
        transition: 'all 0.2s'
      }}>
        <input {...getInputProps()} />
        {file ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <p style={{ margin: 0, fontWeight: 500, color: '#2d6a4f' }}>
              {file.name}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
              {(file.size / 1024).toFixed(1)} KB — click or drop to replace
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {isDragActive ? 'Drop your file here' : 'Drop a file here or click to upload'}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#888' }}>
              Supports JPG, PNG and PDF
            </p>
          </div>
        )}
      </div>

      {preview && (
        <img
          src={preview}
          alt="Document preview"
          style={{
            maxWidth: '100%',
            maxHeight: 300,
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid #eee'
          }}
        />
      )}

      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="e.g. Why was this $49.99 charge deducted? What is this AWS fee for?"
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 8,
          border: '1px solid #d0d0d0',
          fontSize: 15,
          height: 90,
          marginBottom: 14,
          boxSizing: 'border-box',
          resize: 'vertical',
          fontFamily: 'inherit',
          outline: 'none'
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={!file || !question.trim() || loading}
        style={{
          background: !file || !question.trim() || loading ? '#c0c0c0' : '#5c67f2',
          color: '#fff',
          border: 'none',
          padding: '13px 32px',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 500,
          cursor: !file || !question.trim() || loading ? 'not-allowed' : 'pointer',
          marginBottom: 28,
          transition: 'background 0.2s'
        }}
      >
        {loading ? 'Analyzing document...' : 'Analyze document'}
      </button>

      {error && (
        <div style={{
          background: '#fff0f0',
          border: '1px solid #ffcccc',
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
          color: '#cc0000',
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: '#666'
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <p style={{ margin: 0, fontWeight: 500 }}>Analyzing your document...</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>
            Extracting fields, running vision AI, retrieving context
          </p>
        </div>
      )}

      {result && !loading && (
        <div>

          <div style={{
            background: '#f0f4ff',
            border: '1px solid #c7d2fe',
            borderRadius: 12,
            padding: 24,
            marginBottom: 20
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#3730a3' }}>
              AI Answer
            </h3>
            <div style={{ fontSize: 15, lineHeight: 1.7 }}>
              <ReactMarkdown>{result.answer}</ReactMarkdown>
            </div>
          </div>

          {result.extracted_fields && !result.extracted_fields.error && (
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 24,
              marginBottom: 20
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>
                Extracted Fields
              </h3>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14
              }}>
                <tbody>
                  {Object.entries(result.extracted_fields).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{
                        padding: '8px 12px',
                        fontWeight: 500,
                        color: '#555',
                        width: 180,
                        textTransform: 'capitalize'
                      }}>
                        {k.replace(/_/g, ' ')}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#222' }}>
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.context_used?.length > 0 && (
            <details style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 12,
              padding: 20,
              marginBottom: 20
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 14,
                color: '#92400e'
              }}>
                Supporting context used ({result.context_used.length} snippets)
              </summary>
              {result.context_used.map((c: string, i: number) => (
                <p key={i} style={{
                  fontSize: 13,
                  color: '#666',
                  borderLeft: '3px solid #fcd34d',
                  paddingLeft: 12,
                  marginTop: 12
                }}>
                  {c}
                </p>
              ))}
            </details>
          )}

          {result.document_markdown && (
            <details style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 20
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 14,
                color: '#374151'
              }}>
                Raw extracted document text
              </summary>
              <pre style={{
                fontSize: 12,
                color: '#555',
                whiteSpace: 'pre-wrap',
                marginTop: 12,
                lineHeight: 1.6
              }}>
                {result.document_markdown}
              </pre>
            </details>
          )}

        </div>
      )}
    </div>
  )
}