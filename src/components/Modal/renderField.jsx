import React from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControl,
  FormLabel,
  Radio,
  Button,
} from '@mui/material';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

const renderField = (field, formData, handleChange, hasSubmitted) => {
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
                  height: '220px',
                  removePlugins: ['Title']
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
        <Button variant="contained" component="label">
          {field.label}
          <input type="file" name={field.name} hidden onChange={handleChange} />
        </Button>
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
