# FixCare — Fast-track progress

## Trạng thái hiện tại

- DONE: UID 767 (layout), UID 770 (HTTP client), UID 772 (landing page).
- PARTIAL: UID 771 — Frontend lưu và làm mới access token bằng refresh-token rotation đã có từ FastAPI; mock smoke test PASS, chưa chạy lại toàn bộ suite auth tích hợp.
- PARTIAL: UID 778, 779, 781, 824, 825 — các màn hình/API đăng ký, đăng nhập, hồ sơ đã có; cần chạy lại acceptance suite sau thay đổi token.
- DONE: Luồng tạo lịch cơ bản — khách chọn dịch vụ, ngày, khung giờ, thông tin liên hệ và gửi `POST /api/v1/appointments` bằng API thật. GET `/api/v1/services` chỉ trả dịch vụ đang hoạt động; khách không phải chọn kỹ thuật viên.
- DONE: Danh sách, chi tiết, đổi và hủy lịch cá nhân. `GET /appointments/me` lấy Customer theo tài khoản trong Bearer token, không nhận `customer_id` từ frontend.
- TODO: Tiếp nhận/báo giá/sửa chữa (Sprint 5).

## API đã tích hợp thật

- Nhóm B commit: `db24bc8`. Cache `.tanstack` không stage; whitespace được xử lý bởi generator postProcess.
- Nhóm C (mã đã tích hợp, kiểm thử tổng thể NOT RUN): `/workspace`, `/workspace/appointments`, `/workspace/queue`, `/workspace/customers`, `/workspace/technicians`. Generated API: lịch sử/chi tiết/xác nhận/hủy/phân công lịch; tiếp nhận; customers CRUD thêm/sửa; technicians thêm/trạng thái; lịch làm việc thêm/trạng thái. UID 802/804/803/805/793/806/807/812/816/817/819/2008: PARTIAL chờ kiểm thử.

- Authentication: login, register, current user, refresh token, revoke refresh token.
- User profile: read/update current user và đổi mật khẩu.
- HTTP client: Bearer access token, refresh một lần khi nhận 401, không tự logout cho 403/404/422/500.
- Booking: danh sách dịch vụ công khai, khung giờ còn trống và tạo lịch.

## Kiểm thử gần nhất

- Nhóm B: auth setup 1/1 PASS; booking smoke 2/2 PASS; appointments smoke 1/1 PASS; TypeScript, Biome và production build PASS.
- Quy trình generator: tự chuẩn hóa whitespace cuối dòng trong `src/client` bằng postProcess; không sửa nội dung nghiệp vụ generated. Các kết quả Nhóm B ở trên là bằng chứng lượt trước, không chạy lại toàn bộ suite khi chỉ sửa whitespace.

- UID 770: OpenAPI 52 path / 70 operation / 0 operationId trùng; typecheck, build, Biome và Playwright HTTP error 7/7 PASS.
- UID 767: auth setup 1/1 và login 10/10 PASS.
- UID 772: landing/layout 8/8 PASS.
- Nhóm A token refresh: Playwright mock smoke test PASS 1/1; Biome và TypeScript PASS; production build PASS.

## Kịch bản demo ưu tiên

1. Khách đăng ký hoặc đăng nhập.
2. Khách đặt lịch sửa điện thoại.
3. Nhân viên xác nhận lịch, tiếp nhận máy và tạo báo giá.
4. Kỹ thuật viên nhận việc, cập nhật tiến độ.
5. Nhân viên hoàn tất sửa chữa và ghi nhận thanh toán khi API có sẵn.
