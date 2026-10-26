# FixCare — Fast-track progress

## Trạng thái hiện tại

- DONE: UID 767 (layout), UID 770 (HTTP client), UID 772 (landing page).
- PARTIAL: UID 771 — Frontend lưu và làm mới access token bằng refresh-token rotation đã có từ FastAPI; mock smoke test PASS, chưa chạy lại toàn bộ suite auth tích hợp.
- PARTIAL: UID 778, 779, 781, 824, 825 — các màn hình/API đăng ký, đăng nhập, hồ sơ đã có; cần chạy lại acceptance suite sau thay đổi token.
- TODO: Luồng đặt lịch (Sprint 3), vận hành lịch hẹn (Sprint 4), tiếp nhận/báo giá/sửa chữa (Sprint 5).
- BLOCKED: Luồng đặt lịch đầy đủ cần API danh sách dịch vụ công khai; `/slots/available` bắt buộc `service_id`, còn `/technicians` chỉ cho nhân viên. Payment, invoice, review, notification, service management, statistics và revenue cũng chưa có API contract để frontend tích hợp thật.

## API đã tích hợp thật

- Authentication: login, register, current user, refresh token, revoke refresh token.
- User profile: read/update current user và đổi mật khẩu.
- HTTP client: Bearer access token, refresh một lần khi nhận 401, không tự logout cho 403/404/422/500.

## Kiểm thử gần nhất

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
