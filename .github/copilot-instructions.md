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

7) Cấu hình Debug & Development
- Dự án có file `.vscode/launch.json` với nhiều cấu hình debug:
  * **"Run npm start"**: Khởi chạy ứng dụng qua npm (nếu có package.json trong tương lai)
  * **"Mocha Tests"**: Chạy test với Mocha framework (timeout 999999ms cho debug)
  * **"Launch Chrome"**: Mở Chrome tại `http://localhost:8080` với debugging
  * **"Attach to Chrome"**: Attach debugger vào Chrome instance đang chạy (port 9222)
  * **"Attach by Process ID"**: Attach vào Node.js process cụ thể
  * **"Chạy chương trình"**: Chạy file hiện tại với Node.js debugger
- Khi debug trong VSCode:
  * Chọn configuration phù hợp từ Debug panel
  * "Launch Chrome" là lựa chọn tốt nhất để debug UI/JS code trong browser
  * Đặt breakpoints trực tiếp trong `<script>` tags của file .txt
  * Sử dụng Chrome DevTools kết hợp với VSCode debugger

8) Quy ước đặt tên file & cấu trúc
- **File nguồn sử dụng tiếng Việt có dấu và extension .txt**:
  * `MÃ NGUỒN.txt`: File chính cho hệ thống chấm công
  * `MÃ NGUỒN DOANH THU.txt`: File cho báo cáo doanh thu
  * `CẤU HÌNH PHẠT.txt`: File cấu hình quy tắc phạt và giao diện
- Lý do dùng .txt thay vì .html:
  * Có thể là để bypass một số filter/restriction trong môi trường deploy
  * Hoặc để dễ dàng view/edit như text file thông thường
  * Browser vẫn hiểu và render HTML bình thường khi truy cập
- **Khi sửa code**: tìm file .txt tương ứng, không tìm .html hoặc .js riêng biệt

9) Phụ thuộc SDK & tài nguyên ngoài
- **External SDKs** (load từ server, không có trong repo):
  * `/_sdk/data_sdk.js`: Cung cấp `window.dataSdk` cho CRUD operations
  * `/_sdk/element_sdk.js`: Cung cấp `window.elementSdk` cho UI configuration
- **CDN Dependencies**:
  * Tailwind CSS: `https://cdn.tailwindcss.com` (toàn bộ styling dựa trên Tailwind utility classes)
- **Lưu ý quan trọng**:
  * Không có source code của SDK trong repo
  * Khi test locally cần mock hoặc có access đến server chứa /_sdk/*
  * Nếu SDK không available, app sẽ không hoạt động (init sẽ fail)
  * Mọi thay đổi UI phải tuân thủ Tailwind class syntax

10) Testing & Validation approach
- **Không có automated tests** trong repo hiện tại
- Testing workflow được thực hiện thủ công:
  * Khởi động local HTTP server (python, http-server, hoặc Live Server)
  * Mở browser và test các chức năng manually
  * Kiểm tra console logs cho errors
  * Verify data operations qua browser DevTools
- **Khi thay đổi code**:
  * Refresh browser để xem thay đổi
  * Test flow chính: login → check-in → các actions → check violations
  * Verify không break existing functionality
  * Check console cho SDK errors (`result.isOk` pattern)

11) Known limitations & workarounds
- **No build system**: Không thể dùng modern JS features cần transpiling (ES6+ limited by browser support)
- **No module system**: Không có import/export, mọi thứ phải là global hoặc inline
- **SDK dependency**: App hoàn toàn phụ thuộc vào /_sdk/* - không thể chạy standalone
- **Vietnamese filenames**: Có thể gây vấn đề với một số tools (URL encoding, git tools trên một số OS)
- **Inline everything**: HTML, CSS, và JS đều trong cùng file .txt - khó maintain khi scale

12) Integration points & API patterns
- **dataSdk API pattern**:
  ```javascript
  const result = await window.dataSdk.init(dataHandler);
  if (!result.isOk) {
    showMessage('Error: ' + result.error, 'error');
    return;
  }
  // Use result.data
  ```
- **Common SDK methods**:
  * `init(handler)`: Initialize với callback nhận data changes
  * `create(record)`: Tạo record mới
  * `update(record)`: Cập nhật record
  * `delete(record)`: Xóa record
- **elementSdk API**:
  * `init(config)`: Khởi tạo với UI capabilities
  * `setConfig({primary_color, surface_color, text_color})`: Đổi theme colors
- **Data structure example** (dựa trên code):
  ```javascript
  {
    date: '2024-01-15',
    code: '3003',
    amount: 20570000,  // Lưu ý: đã nhân 1000
    type: 'D',  // hoặc các loại khác
    time: '21:15'
  }
  ```

Nếu phần nào thiếu rõ ràng (ví dụ chi tiết API của `dataSdk`/`elementSdk`), cho tôi biết — tôi sẽ bổ sung các mock/giả lập cần thiết hoặc mở rộng file hướng dẫn.
