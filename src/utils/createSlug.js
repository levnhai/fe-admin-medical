// create slug name hospital
export function createSlugName(name) {
    if (!name || typeof name !== 'string') {
        return '';
    }

    return name
        .toLowerCase() // Chuyển đổi thành chữ thường
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
        .replace(/đ/g, 'd') // Thay thế riêng chữ "đ"
        .replace(/Đ/g, 'd') // Thay thế riêng chữ "Đ"
        .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ các ký tự đặc biệt, nhưng giữ lại khoảng trắng và dấu gạch ngang
        .trim() // Loại bỏ khoảng trắng ở đầu và cuối
        .replace(/\s+/g, '-') // Thay thế tất cả các khoảng trắng bằng dấu gạch ngang
        .replace(/-+/g, '-'); // Loại bỏ các dấu gạch ngang thừa
}