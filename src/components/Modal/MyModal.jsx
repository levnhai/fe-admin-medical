import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Typography, Grid } from '@mui/material';
import renderField from './renderField';
import { BiLoaderAlt } from 'react-icons/bi';
import classNames from 'classnames/bind';
import styles from './modal.module.scss';

const cx = classNames.bind(styles);

const MyModal = ({ 
  open, 
  handleClose, 
  mode, 
  fields, 
  onSubmit, 
  data, 
  title,
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

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
  };

  return (
    <Modal 
      open={open} 
      onClose={handleClose} 
      aria-labelledby="modal-title" 
      aria-describedby="modal-description"
      sx={{
        '& .MuiModal-backdrop': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <Box 
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800, // Increased from 500 to 800
          bgcolor: 'white',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 'none',
          outline: 'none'
        }}
        className={cx('content')}
      >
        <Box
          className={cx('header')}
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2
          }}
        >
          <Typography
            id="modal-title"
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 600,
              color: 'white',
              fontSize: 24
            }}
          >
            {title}
          </Typography>
          <button 
            onClick={handleClose} 
            className={cx('closeBtn')}
          >
            &times;
          </button>
        </Box>

        <Box 
          sx={{ 
            maxHeight: '70vh', 
            overflowY: 'auto', 
            px: 3, 
            py: 2 
          }}
        >
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
                    onImagePreview: setImagePreview
                  }
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box 
          sx={{ 
            borderTop: '1px solid #e0e0e0', 
            p: 2, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2 
          }}
        >
          <Button 
            variant="outlined"
            color="secondary"
            onClick={handleClose}
            sx={{ 
              color: '#2c3e50', 
              borderColor: 'gray', 
              '&:hover': { 
                backgroundColor: 'rgba(0,0,0,0.05)' 
              } 
            }}
          >
            Đóng
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{ 
              background: 'linear-gradient(36deg, var(--blue-color)', 
              '&:hover': { 
                background: 'linear-gradient(36deg, var(--blue-color), #00e0ff)' 
              } 
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <BiLoaderAlt className="animate-spin mr-2" />
                Đang xử lý...
              </div>
            ) : (
              mode === 'create' ? 'Thêm mới' : 'Lưu'
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default MyModal;