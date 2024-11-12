import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';
export const fetchAllContacts = createAsyncThunk(
    'contact/fetchAllContacts',
    async () => {
      try {
        const response = await axios.get('contact/get-all');
        return response.data;
      } catch (error) {
        throw new Error(error.message);
      }
    }
  );

export const fetchDeleteContact = createAsyncThunk(
    'contact/fetchDeleteContact',
    async (id) => {
        try {
            const response = await axios.delete(`contact/delete/${id}`);
            return { ...response.data, id };
        } catch (error) {
            throw error;
        }
    }
);

export const fetchUpdateContact = createAsyncThunk(
    'contact/fetchUpdateContact',
    async ({ id, data }) => {
        try {
            const response = await axios.put(`contact/edit/${id}`, data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật'
            };
        }
    }
);
const contactSlice = createSlice({
    name: 'contact',
    initialState: {
      contactData: [],
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchAllContacts.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchAllContacts.fulfilled, (state, action) => {
          state.loading = false;
          // Handle both array response and object response with data property
          state.contactData = Array.isArray(action.payload) ? action.payload : action.payload.data;
          state.error = null;
        })
        .addCase(fetchAllContacts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Có lỗi xảy ra';
          state.contactData = [];
        })
        // Delete contact
        .addCase(fetchDeleteContact.fulfilled, (state, action) => {
            state.contactData = state.contactData.filter(
                contact => contact._id !== action.payload.id
            );
            state.total -= 1;
        })
        // Update contact
        .addCase(fetchUpdateContact.fulfilled, (state, action) => {
            if (action.payload.success && action.payload.data) {
                const index = state.contactData.findIndex(
                    contact => contact._id === action.payload.data._id
                );
                if (index !== -1) {
                    state.contactData[index] = action.payload.data;
                }
            }
        })
        .addCase(fetchUpdateContact.rejected, (state, action) => {
            state.error = action.error.message || 'Có lỗi xảy ra khi cập nhật';
        });
    },
});

//export const { setPage, setPageSize } = contactSlice.actions;
export default contactSlice.reducer;