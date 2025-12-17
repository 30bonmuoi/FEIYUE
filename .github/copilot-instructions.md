# Copilot instructions for FeiYue repository

Tóm tắt: dự án là một web app nội bộ (HTML + inlined JS) dùng cho chấm công và báo cáo doanh thu. Không có hệ thống build; mã chạy trực tiếp trong trình duyệt và phụ thuộc vào hai SDK toàn cục `dataSdk` và `elementSdk` (tải từ `/_sdk/*`).

1) Kiến trúc & luồng dữ liệu
- Mã UI + business logic nằm trong các file HTML/JS inlined: `MÃ NGUỒN.txt` (chấm công chính) và `MÃ NGUỒN DOANH THU.txt` (báo cáo doanh thu). Khi agent cần thay đổi UI, tìm phần `<script>` trong những file này.
- Dữ liệu đọc/ghi qua `window.dataSdk` (phương thức: `init`, `create`, `update`, `delete`). `elementSdk` được dùng để khởi tạo/điều chỉnh cấu hình giao diện (`init`, `setConfig`).
- Các thao tác CRUD kiểm tra `result.isOk` sau khi gọi SDK; agent cần duy trì mẫu kiểm tra này.

2) Quy tắc nghiệp vụ quan trọng (cần tuân thủ khi sửa code)
- Giới hạn giao dịch: tối đa 999 bản ghi (kiểm tra trong `MÃ NGUỒN DOANH THU.txt`).
- Danh sách `team1` / `team2` được hard-coded trong JS; thay đổi nhóm nghĩa là sửa file JS trực tiếp.
- Mật khẩu tạm thời để mở phần nhập liệu: `AD1234` (xuất hiện trong `MÃ NGUỒN DOANH THU.txt`).
- Phạt mặc định: 10$ cho mỗi lần vi phạm (thông tin trong `CẤU HÌNH PHẠT.txt`).

3) Cách chạy & debug nhanh
- Dự án là static — chạy một HTTP server từ thư mục repo để thử nghiệm:

  ```bash
  cd /workspaces/FEIYUE
  python3 -m http.server 8000
  # Mở http://localhost:8000/M%C3%83%20NGU%E1%BB%90N.txt hoặc đổi tên file .txt -> .html
  ```
- Nếu SDK (/_sdk/*.js) không tồn tại locally, mock `window.dataSdk`/`window.elementSdk` trong console hoặc bằng file JS đơn giản trước khi load trang.

4) Các pattern codebase cụ thể
- DOM-first: hầu hết tương tác dựa trên `document.getElementById` và gán event listeners trực tiếp. Không có framework componentization.
- Global state: `allTransactions` là mảng trạng thái cục bộ; nhiều hàm (update, edit, delete) vận hành trên biến này.
- Format tiền: `parseAmount` nhân số lên *1000* (xem `MÃ NGUỒN DOANH THU.txt`) — giữ nhất quán khi đọc/ghi.

5) Những chỗ cần thận trọng khi chỉnh sửa
- Tránh đổi các `id` DOM như `submit-btn`, `team1-list`, `btn-check-in` vì code event phụ thuộc trực tiếp.
- Khi thêm API call, duy trì pattern `if (!result.isOk) { showMessage(...); return; }` để giữ UX hiện có.

6) Ví dụ tác vụ cụ thể cho agent
- Thêm logging khi `dataSdk.create` thất bại: chèn `console.error(result)` ngay sau kiểm tra `!result.isOk` trong `handleSubmit`.
- Đổi cấu hình màu: gọi `window.elementSdk.setConfig({ primary_color: '#...'} )` theo pattern từ `mapToCapabilities`.

Nếu phần nào thiếu rõ ràng (ví dụ chi tiết API của `dataSdk`/`elementSdk`), cho tôi biết — tôi sẽ bổ sung các mock/giả lập cần thiết hoặc mở rộng file hướng dẫn.
