import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Typography, Grid } from '@mui/material';
import renderField from './renderField';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 900,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const MyModal = ({ open, handleClose, mode, fields, onSubmit, onDelete, data, title }) => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  //const [imageModalOpen, setImageModalOpen] = useState(false);

  // Reset form data whenever the modal opens or data changes
  useEffect(() => {
    if (open) {
      const initialState = fields.reduce((acc, field) => {
        // Special handling for different types of fields
        if (mode === 'edit' && data) {
          // For edit mode, prioritize data from the selected item
          acc[field.name] = data[field.name] !== undefined 
            ? data[field.name] 
            : (field.type === 'checkbox' ? false : '');
        } else {
          // For create mode, reset to default or empty values
          acc[field.name] = field.type === 'checkbox' ? false : '';
        }
        return acc;
      }, {});

      setFormData(initialState);

      // Reset image preview
      setImagePreview(null);
    }
  }, [open, mode, data, fields]);

  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : type === 'file' 
          ? files[0] 
          : value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };
  // const handleDelete = () => {
  //   onDelete();
  //   handleClose();
  // };
  const handleModalClose = () => {
    // Reset form data when closing
    setFormData({});
    handleClose();
  };

  // const handleImageClick = () => {
  //   setImageModalOpen(true);
  // };

  // const handleCloseImageModal = () => {
  //   setImageModalOpen(false);
  // };

  // const handleImagePreview = (previewUrl) => {
  //   setImagePreview(previewUrl);
  //   setImageModalOpen(true); 
  // };
  
  // useEffect(() => {
  //   console.log('Modal open?', imageModalOpen);
  // }, [imageModalOpen]); // Theo dõi sự thay đổi của imageModalOpen
  return (
    <>
    <Modal 
      open={open} 
      onClose={handleModalClose} 
      aria-labelledby="modal-title" 
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Box
          sx={{
            width: '100%',
            height: '60px',
            borderRadius: 1,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <Typography
            id="modal-title"
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 'bold',
              pl: 2,
              color: 'white',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={12} sm={field.grid || 6} key={field.name}>
              {renderField(
                field, 
                formData, 
                handleChange, 
                false, 
                [imagePreview, setImagePreview],
                {
                  //onImagePreview: handleImagePreview
                  onImagePreview: setImagePreview
                }
              )}
            </Grid>
          ))}
        </Grid>

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit} 
            sx={{ mr: 1 }}
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
          {mode === 'edit' && (
            <Button 
            variant="contained" 
            color="error" 
            onClick={handleClose}
          >
            CLOSE
          </Button>
          )}
        </Box>
      </Box>
    </Modal>
    {/* <Dialog open={imageModalOpen} onClose={handleCloseImageModal} maxWidth="md" fullWidth>
  <DialogTitle>
    Image Preview
    <IconButton
      aria-label="close"
      onClick={handleCloseImageModal}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent sx={{ position: 'relative', paddingTop: '20px' }}>
    {imagePreview && (
      console.log('hinh ne', imagePreview), // Kiểm tra giá trị của imagePreview
      <img
        src={imagePreview}
        alt="Preview"
        style={{
          position: 'relative',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '100%',
          maxHeight: '70vh',
          objectFit: 'contain',
          zIndex: 10,
          display: 'block',
        }}
      />
    )}
  </DialogContent>
</Dialog> */}
  </>
  );
};

export default MyModal;