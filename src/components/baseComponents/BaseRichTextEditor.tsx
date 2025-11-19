import ReactDOM from 'react-dom';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Box, FormHelperText } from '@mui/material';

export type BaseRichTextEditorProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  readOnly?: boolean;
  height?: number | string;
};

export function BaseRichTextEditor({
  value = '',
  onChange,
  placeholder = 'Enter text...',
  helperText,
  error,
  readOnly = false,
  height = 200,
}: BaseRichTextEditorProps) {
  const quillRef = useRef<any>(null);
  const [ReactQuill, setReactQuill] = useState<any>(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'link',
  ];

  // Dynamic import and React 19 fix
  useEffect(() => {
    // Patch findDOMNode for React 19
    if (!(ReactDOM as any).findDOMNode) {
      (ReactDOM as any).findDOMNode = (node: any) => {
        if (node instanceof HTMLElement) return node;
        return node?.base || node?.current || null;
      };
    }

    // Dynamic import of ReactQuill
    import('react-quill').then((mod) => {
      setReactQuill(() => mod.default);
    });
    
    // Import CSS
    import('react-quill/dist/quill.snow.css');
  }, []);

  if (!ReactQuill) {
    return (
      <Box>
        <Box
          sx={{
            minHeight: height,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          Loading editor...
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          '& .ql-toolbar': {
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: '8px 8px 0 0',
          },
          '& .ql-container': {
            minHeight: height,
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: '0 0 8px 8px',
          },
          '& .ql-editor': {
            minHeight: height,
          },
        }}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </Box>
      {helperText && (
        <FormHelperText error={error} sx={{ mx: 1.75, mt: 0.75 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
