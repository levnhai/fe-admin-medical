import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '~/axios';

// get all provinces
export const fetchAllProvinces = createAsyncThunk('provinces/fetchAllProvinces', async () => {
  const response = await fetch('https://open.oapi.vn/location/provinces?page=0&size=63');
  if (!response.ok) {
    throw new Error('Failed to fetch provinces');
  }
  const data = await response.json();
  return data;
});

// get all districts by province
export const fetchDistrictsByProvince = createAsyncThunk('provinces/fetchDistrictsByProvince', async (provinceId) => {
  console.log('checkk provinceId', provinceId);
  const response = await fetch(`https://open.oapi.vn/location/districts/${provinceId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch provinces');
  }
  const data = await response.json();
  console.log('check data fetchAllDistricts', data);
  return data;
});

// get all ward by districts
export const fetchWardsByDistricts = createAsyncThunk('provinces/fetchWardsByDistricts', async (districtId) => {
  console.log('checkk districtId', districtId);
  const response = await fetch(`https://open.oapi.vn/location/wards/${districtId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch provinces');
  }
  const data = await response.json();
  console.log('check data fetchAllDistricts', data);
  return data;
});

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    provinceData: null,
    districtData: null,
    wardData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // get all provinces
    builder
      .addCase(fetchAllProvinces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProvinces.fulfilled, (state, action) => {
        state.loading = false;
        state.provinceData = action.payload;
      })
      .addCase(fetchAllProvinces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // get districts by province data
    builder
      .addCase(fetchDistrictsByProvince.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistrictsByProvince.fulfilled, (state, action) => {
        state.loading = false;
        state.districtData = action.payload;
      })
      .addCase(fetchDistrictsByProvince.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // get ward by districts
    builder
      .addCase(fetchWardsByDistricts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWardsByDistricts.fulfilled, (state, action) => {
        state.loading = false;
        state.wardData = action.payload;
      })
      .addCase(fetchWardsByDistricts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default locationSlice.reducer;
