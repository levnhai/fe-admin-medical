export const name_validation = {
  name: 'fullName',
  label: '',
  type: 'text',
  id: 'fullName',
  placeholder: 'Please enter your name...',
  validation: {
    required: {
      value: true,
      message: 'required',
    },
    minLength: {
      value: 6,
      message: 'min 6 characters',
    },
    maxLength: {
      value: 50,
      message: '50 characters max',
    },
  },
};

export const desc_validation = {
  name: 'description',
  label: 'description',
  multiline: true,
  id: 'description',
  placeholder: 'Please enter your description...',
  validation: {
    required: {
      value: true,
      message: 'required',
    },
    maxLength: {
      value: 200,
      message: '200 characters max',
    },
  },
};

export const password_validation = {
  name: 'password',
  label: '',
  // type: 'password',
  id: 'password',
  placeholder: 'Please enter your password...',
  validation: {
    required: {
      value: true,
      message: 'required',
    },
    minLength: {
      value: 6,
      message: 'min 6 characters',
    },
  },
};

export const num_validation = {
  name: 'num',
  label: 'number',
  type: 'text',
  id: 'num',
  placeholder: 'Please enter your number...',
  validation: {
    required: {
      value: true,
      message: 'required',
    },
  },
};

export const email_validation = {
  name: 'email',
  label: 'email address',
  type: 'email',
  id: 'email',
  placeholder: 'write a random email address',
  validation: {
    required: {
      value: true,
      message: 'required',
    },
    pattern: {
      value:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: 'not valid',
    },
  },
};

export const phone_validation = {
  name: 'phoneNumber',
  label: '',
  type: 'phoneNumber',
  id: 'phoneNumber',
  placeholder: 'Please enter your phoneNumber...',
  validation: {
    required: {
      value: true,
      message: 'required',
    },
    pattern: {
      value: /(0[3|7|9])+([0-9]{8})\b/g,
      message: 'not valid',
    },
  },
};
