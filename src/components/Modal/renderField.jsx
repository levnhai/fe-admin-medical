import React from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  Button,
} from '@mui/material';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

const renderField = (field, formData, handleChange, hasSubmitted, imagePreviewState) => {
  const [imagePreview, setImagePreview] = imagePreviewState || [null, () => {}];
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update form data with the file
      handleChange(e);

      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageNameClick = (file) => {
    console.log('Selected file:', file);
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Preview URL:', reader.result);
        if (field.onImagePreview) {
          field.onImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  

  switch (field.type) {
    case 'checkbox':
      return (
        <FormControlLabel
          control={<Checkbox checked={formData[field.name]} onChange={handleChange} name={field.name} />}
          label={field.label}
        />
      );
      case 'option':
        return (
          <FormControl fullWidth margin="normal">
            <Select 
              name={field.name} 
              value={formData[field.name] || ''}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem value="">
                <em>{field.label}</em>
              </MenuItem>
              {field.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
    case 'select':
      return (
        <FormControl fullWidth margin="normal">
          <Select name={field.name} value={formData[field.name]} onChange={handleChange}>
            {field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
      case 'textarea':
        return (
          <FormControl fullWidth margin="normal" sx={{ position: 'relative' }}>
            <div style={{
              height: '250px',
              display: 'flex',
              overflowY: 'auto',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              color: 'black',
              wordWrap: 'break-word',
              wordBreak: 'break-word',  
              whiteSpace: 'normal'     
            }}>
              <CKEditor
                editor={ClassicEditor}
                data={formData[field.name] || ''}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  handleChange({
                    target: {
                      name: field.name,
                      value: data
                    }
                  });
                }}
                onReady={(editor) => {
                  // Áp dụng style cho toolbar
                  editor.ui.view.toolbar.element.style.width = '830px';
                  editor.ui.view.toolbar.element.style.whiteSpace = 'nowrap';
                  editor.ui.view.editable.element.style.height = '250px';
                  editor.ui.view.editable.element.style.overflowY = 'auto';
                }}
                config={{
                  placeholder: field.label,
                  toolbar: {
                    items: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'underline',
                      'strikethrough',
                      '|',
                      'fontSize',
                      'fontFamily',
                      'fontColor',
                      'fontBackgroundColor',
                      '|',
                      'alignment',
                      '|',
                      'bulletedList',
                      'numberedList',
                      'todoList',
                      '|',
                      'indent',
                      'outdent',
                      '|',
                      'link',
                      'blockQuote',
                      'insertTable',
                      '|',
                      'undo',
                      'redo'
                    ],
                    shouldNotGroupWhenFull: true
                  },
                  table: {
                    contentToolbar: [
                      'tableColumn',
                      'tableRow',
                      'mergeTableCells',
                      'tableCellProperties',
                      'tableProperties'
                    ]
                  },
                  removePlugins: ['Title'],
                }}
              ></CKEditor>

            </div>
            {hasSubmitted && field.required && !formData[field.name] && (
              <div style={{ 
                color: 'red', 
                marginTop: '8px',
                fontSize: '0.75rem'
              }}>
                This field is required
              </div>
            )}
          </FormControl>
        );
    case 'date':
      return (
        <TextField
          fullWidth
          label={field.label}
          name={field.name}
          value={formData[field.name]}
          onChange={handleChange}
          margin="normal"
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          error={field.required && !formData[field.name]}
          helperText={field.required && !formData[field.name] ? 'This field is required' : ''}
        />
      );
      case 'file':
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Button
        variant="contained"
        component="label"
        style={{ minWidth: '120px' }}
      >
        {field.label}
        <input
          type="file"
          name={field.name}
          hidden
          onChange={handleFileChange}
          accept="image/*"
        />
      </Button>
      {formData[field.name] instanceof File && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'blue',
            textDecoration: 'underline'
          }}
          onClick={() => handleImageNameClick(formData[field.name])}
        >
          {formData[field.name].name}
        </div>
      )}

      {(imagePreview || formData.imageUrl) && (
        <div style={{ marginTop: '10px' }}>
          <img
            src={imagePreview || formData.imageUrl}
            alt="Preview"
            style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );
    default:
      return (
        <TextField
          fullWidth
          label={field.label}
          name={field.name}
          value={formData[field.name]}
          onChange={handleChange}
          margin="normal"
          type={field.type || 'text'}
          error={hasSubmitted && field.required && !formData[field.name]}
          helperText={hasSubmitted && field.required && !formData[field.name] ? 'This field is required' : ''}
        />
      );
  }
};

export default renderField;
