import axios from 'axios';
import { showAlert } from './alert';
export const changeSettings = async (data, type) => {
  try {
    const url =
      type == 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';
    await axios({
      method: 'PATCH',
      url,
      data,
    });
    showAlert('success', `${type.toUpperCase()} saved successfully`);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
