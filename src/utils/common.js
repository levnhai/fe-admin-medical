module.exports = {
  ConvertBase64: function (file) {
    return new Promise(async (resolve, reject) => {
      const fileReader = await new FileReader();

      fileReader.onload = () => resolve(fileReader.result);
      fileReader.readAsDataURL(file);
      fileReader.onerror = (Error) => reject(Error);
    });
  },

  formattedDate: function (date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  },

  // is valis phone number in vietnam
  regexPhoneNumber: function (phoneNumber) {
    const regexPhoneNumber = /(0[3|7|9])+([0-9]{8})\b/g;
    return phoneNumber.match(regexPhoneNumber) ? true : false;
  },

  // buid data input react select
  builDataInputSelect: function (inputData, type) {
    let result = [];
    if (inputData && inputData.length > 0) {
      if (type === 'USERS') {
        inputData.map((item) => {
          let object = {};
          object.value = item._id;
          object.label = item.fullName;
          return result.push(object);
        });
      }
      if (type === 'ALLCODES') {
        inputData.map((item) => {
          let object = {};
          object.value = item.keyMap;
          object.label = item.valueVn;
          return result.push(object);
        });
      }
      if (type === 'PROVINCE') {
        inputData.map((item) => {
          let object = {};
          object.value = item.code;
          object.label = item.name;
          return result.push(object);
        });
      }
    }
    return result;
  },
};
