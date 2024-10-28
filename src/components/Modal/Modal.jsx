import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Typography, Grid } from '@mui/material';

import renderField from './renderField';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const MyModal = ({ open, handleClose, mode, fields, onSubmit, onDelete, data, title }) => {
  const initialState = fields.reduce((acc, field) => {
    acc[field.name] = data ? data[field.name] : field.type === 'checkbox' ? false : '';
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value,
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleDelete = () => {
    onDelete();
    handleClose();
  };

  useEffect(() => {
    setFormData(initialState);
  }, [data]);

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
      <Box sx={style}>
        <Box
          sx={{
            width: '100%',
            height: '60px',
            borderRadius: 1,
            bgcolor: 'primary.red',
            '&:hover': {
              bgcolor: 'primary.blue',
            },
          }}
        >
          <Typography
            id="modal-title"
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={12} sm={field.grid || 6} key={field.name}>
              {renderField(field, formData, handleChange)}
            </Grid>
          ))}
        </Grid>

        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
          {mode === 'edit' && (
            <Button variant="contained" color="error" onClick={handleDelete} style={{ marginLeft: '10px' }}>
              Delete
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default MyModal;
