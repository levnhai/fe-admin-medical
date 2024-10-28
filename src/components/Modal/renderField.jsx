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
          <Select name={field.name} value={formData[field.name]} onChange={handleChange}>
            {field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case 'radio':
      return (
        <FormControl component="fieldset">
          <FormLabel component="legend">{field.label}</FormLabel>
          <RadioGroup name={field.name} value={formData[field.name]} onChange={handleChange}>
            {field.options.map((option) => (
              <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
            ))}
          </RadioGroup>
        </FormControl>
      );
    case 'textarea':
      return (
        <TextField
          fullWidth
          label={field.label}
          name={field.name}
          value={formData[field.name]}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={field.rows || 4}
          error={field.required && !formData[field.name]}
          helperText={field.required && !formData[field.name] ? 'This field is required' : ''}
        />
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
