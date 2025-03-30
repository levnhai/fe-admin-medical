import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const AdminProfile = () => {
  // Lấy role từ token
  const token = Cookies.get('login');
  const userRole = token ? jwtDecode(token).role : 'guest';

  // Danh sách loại bệnh viện
  const hospitalTypes = [
    "Bệnh viện công",
    "Bệnh viện tư",
    "Phòng khám",
    "Phòng mạch",
    "Xét nghiệm",
  ];

  // Dữ liệu chung cho tất cả các role
  const commonFields = {
    phone: "0123456789",
    address: "Hà Nội, Việt Nam",
    lastUpdated: "10/12/2024",
  };

  // Dữ liệu riêng cho từng role
  const roleSpecificData = {
    system_admin: {
      fullName: "Nguyễn Thị A",
      gender: "Nữ",
    },
    doctor: {
      fullName: "Nguyễn Văn A",
      gender: "Nam",
      email: "doctor@example.com",
      specialty: "Tim mạch",
      schedules: "Thứ 2 - Thứ 6: 8h-17h",
      rating: 4.8,
    },
    hospital_admin: {
      fullName: "Bệnh viện Đa khoa Quốc tế",
      hospitalType: "Bệnh viện công",
      description: "Bệnh viện chuẩn quốc tế với đầy đủ các chuyên khoa",
      monthlyFee: "50,000,000 VND",
      renewalStatus: "Đã thanh toán",
      rating: 4.5,
    },
  };

  const initialData = {
    ...commonFields,
    ...(roleSpecificData[userRole] || {}),
  };

  const [profile, setProfile] = useState(initialData);
  const [editProfile, setEditProfile] = useState(initialData);

  // Cập nhật lại dữ liệu khi role thay đổi
  useEffect(() => {
    const newData = {
      ...commonFields,
      ...(roleSpecificData[userRole] || {}),
    };
    setProfile(newData);
    setEditProfile(newData);
  }, [userRole]);

  const handleChange = (e) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setProfile(editProfile);
    alert("Thông tin đã được cập nhật thành công!");
  };

  const handleReset = () => {
    setEditProfile(profile);
  };

  // Render các trường chung
  const renderCommonFields = () => (
    <>
      <div className="mb-6">
        <h3 className="text-gray-500 mb-2">
          {userRole === "hospital_admin" ? "Tên bệnh viện" : "Họ tên đầy đủ"}
        </h3>
        <input
          type="text"
          name="fullName"
          value={editProfile.fullName || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
      </div>
      <div className="mb-6">
        <h3 className="text-gray-500 mb-2">Số điện thoại</h3>
        <input
          type="text"
          name="phone"
          value={editProfile.phone || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
      </div>
      <div className="mb-6">
        <h3 className="text-gray-500 mb-2">Địa chỉ</h3>
        <input
          type="text"
          name="address"
          value={editProfile.address || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
      </div>
    </>
  );

  // Render các trường dành cho bác sĩ
  const renderDoctorFields = () => (
    <>
      <div className="mb-6">
        <h3 className="text-gray-500 mb-2">Email</h3>
        <input
          type="email"
          name="email"
          value={editProfile.email || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
      </div>
      <div className="mb-6">
        <h3 className="text-gray-500 mb-2">Chuyên khoa</h3>
        <input
          type="text"
          name="specialty"
          value={editProfile.specialty || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
      </div>
    </>
  );

  // Render các trường dành cho bệnh viện
  const renderHospitalFields = () => (
    <>
      <div className="mb-6">
        <h3 className="text-gray-500 mb-2">Loại bệnh viện</h3>
        <select
          name="hospitalType"
          value={editProfile.hospitalType || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        >
          {hospitalTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <h3 className="text-gray-500 mb-2">Phí hàng tháng</h3>
        <input
          type="text"
          name="monthlyFee"
          value={editProfile.monthlyFee || ''}
          disabled
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 bg-gray-200 shadow-sm cursor-not-allowed text-black"
        />
      </div>
    </>
  );

  // Render các trường phụ (cột thứ 2)
  const renderAdditionalFields = () => (
    <>
      {userRole !== "hospital_admin" && (
        <div className="mb-6">
          <h3 className="text-gray-500 mb-2">Giới tính</h3>
          <select
            name="gender"
            value={editProfile.gender || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-gray-500 mb-2">Ngày cập nhật</h3>
        <input
          type="text"
          name="lastUpdated"
          value={editProfile.lastUpdated || ''}
          disabled
          className="w-full border border-gray-300 rounded-lg p-2 bg-gray-200 shadow-sm cursor-not-allowed text-black"
        />
      </div>

      {userRole === "doctor" && (
        <>
          <div className="mb-6">
            <h3 className="text-gray-500 mb-2">Lịch làm việc</h3>
            <input
              type="text"
              name="schedules"
              value={editProfile.schedules || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            />
          </div>
          <div className="mb-6">
            <h3 className="text-gray-500 mb-2">Đánh giá</h3>
            <input
              type="text"
              name="rating"
              value={editProfile.rating || ''}
              disabled
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-200 shadow-sm cursor-not-allowed text-black"
            />
          </div>
        </>
      )}

      {userRole === "hospital_admin" && (
        <>
          <div className="mb-6">
            <h3 className="text-gray-500 mb-2">Mô tả</h3>
            <textarea
              name="description"
              value={editProfile.description || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black h-24"
            />
          </div>
          <div className="mb-6">
            <h3 className="text-gray-500 mb-2">Tình trạng gia hạn</h3>
            <input
              type="text"
              name="renewalStatus"
              value={editProfile.renewalStatus || ''}
              disabled
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-200 shadow-sm cursor-not-allowed text-black"
            />
          </div>
          <div className="mb-6">
            <h3 className="text-gray-500 mb-2">Đánh giá</h3>
            <input
              type="text"
              name="rating"
              value={editProfile.rating || ''}
              disabled
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-200 shadow-sm cursor-not-allowed text-black"
            />
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-black">
                  {userRole === "system_admin" && "Thông tin quản trị viên"}
                  {userRole === "doctor" && "Thông tin bác sĩ"}
                  {userRole === "hospital_admin" && "Thông tin bệnh viện"}
                </h2>
                <span className="ml-2">▼</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cột trái */}
              <div>
                {renderCommonFields()}
                {userRole === "doctor" && renderDoctorFields()}
                {userRole === "hospital_admin" && renderHospitalFields()}
              </div>

              {/* Cột phải */}
              <div>
                {renderAdditionalFields()}
              </div>
            </div>

            {/* Nút Lưu và Reset */}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Lưu
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;