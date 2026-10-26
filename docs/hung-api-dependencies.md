# API dependencies cho Frontend & QA

## Phát hiện quan trọng

`frontend/openapi-ts.config.ts` sinh từ `frontend/openapi.json`, nhưng client generated hiện chỉ export `ItemsService`, `LoginService`, `UsersService`, `PrivateService`, `UtilsService`. Backend lại mount các router nghiệp vụ tại `backend/app/main.py`. Vì thế frontend không thể gọi typed API nghiệp vụ bằng cách an toàn cho tới khi OpenAPI được xác minh và client được sinh lại theo quy trình đã duyệt.

Ngoài ra `backend/app/main.py` mount router theo cả prefix cấu hình API và `/api`; URL công khai cuối cùng phải được kiểm tra bằng `/openapi.json`/Swagger đang chạy, không suy đoán từ tên hàm.

## API backend có mã, frontend chưa tích hợp

| Nghiệp vụ | Bằng chứng backend | Frontend hiện tại | Dependency/task |
|---|---|---|---|
| Slot trống/kiểm tra slot | `slots.py`: `GET /available`, `POST /check` | Không có service/route | 786, 783, 784 |
| Lịch hẹn | `appointments.py`: lookup, detail, create, update, confirm, cancel, assign, history | Không có service/route | 787–791, 804, 805 |
| Khách hàng | `customers.py`: CRUD và appointments | Không có service/route | 817, 787 |
| Kỹ thuật viên | `technicians.py`: CRUD/status | Không có service/route | 785, 816 |
| Lịch làm việc | `work_schedules.py`: CRUD/status | Không có service/route | 812, 811 |
| Hàng chờ | `queue.py`: list/add/detail/update status | Không có service/route | 793, 792 |
| Tiếp nhận thiết bị | `intake.py`: create intake | Không có service/route | 806, 795 |
| Báo giá | `quotes.py`: create/accept/approve alias | Không có service/route | 796, 797, 809 |
| Thiết bị | `devices.py`: update | Không có service/route | 806 |
| Phiếu sửa | `repair_orders.py`: update status/assign technician | Không có service/route | 807, 808, 795, 810 |

## API template đã được tích hợp một phần

| API | Dấu vết frontend | Phạm vi thực tế |
|---|---|---|
| Login/register/reset/recover | `useAuth.ts`, `login.tsx`, `signup.tsx`, `recover-password.tsx`, `reset-password.tsx` | Template xác thực; chưa có kết quả chạy hiện tại. |
| Users/profile | `settings.tsx`, `admin.tsx`, `UserSettings/*`, `Admin/*` | Quản lý user template, chưa phải quản lý tài khoản/role nghiệp vụ hoàn chỉnh. |
| Items | route/components Items | Mẫu CRUD Items, không phải danh mục dịch vụ sửa điện thoại. |

## API thiếu hoặc chưa đủ cho phạm vi demo

| Nhu cầu từ DOCX/task | Tình trạng xác minh | Cần phối hợp Backend |
|---|---|---|
| Danh mục dịch vụ: list/detail/CRUD | Model `Service` có nhưng không có `services.py` router trong repo | Thiết kế API đọc công khai và CRUD quản trị, schema giá/thời lượng/trạng thái. |
| Quote list/detail/update | Router chỉ thấy create/accept/approve | Xác minh endpoint list/detail/update, quyền nhân viên/khách. |
| Repair order list/detail/create | Router chỉ thấy update status/assign | Bổ sung/xác minh list/detail/create và history payload. |
| Device create/list/detail | Router chỉ thấy update | Xác minh tạo và truy vấn thiết bị theo khách/lịch hẹn. |
| Payment, invoice | Có models nhưng không thấy router | Cần API CRUD/quy tắc thanh toán trước UID 798, 799, 821. |
| Notification, review | Có models nhưng không thấy router | Cần API list/read/create và quyền truy cập trước UID 800, 801. |
| Statistics/revenue/dashboard | Không thấy router | Cần định nghĩa chỉ số, filter thời gian, role và response aggregate trước UID 802, 814, 822, 823. |
| Booking services | Appointment schema cần xác minh trong OpenAPI | Xác minh payload chứa service IDs, customer/device, slot, technician và ràng buộc trùng lịch. |

## Quy trình tích hợp an toàn

1. Backend cung cấp/khởi chạy OpenAPI contract đúng revision.
2. Frontend so sánh tags/operations/types với API cần dùng; ghi blocker vào task.
3. Sau khi duyệt, chạy `cd frontend; bun run generate-client`; review các file generated nhưng không sửa tay.
4. Tạo hook/query/mutation gọi service generated, với loading/error/success và invalidation cache.
5. Thêm Playwright test theo AC; báo rõ lệnh đã chạy, pass/fail hoặc blocker.

## Danh sách API cần kiểm thử trước demo

- Auth: register, login, refresh/revoke, quyền role và xử lý token hết hạn.
- Booking: slot hết chỗ, slot hợp lệ, tạo lịch, đổi/hủy, xác nhận/assign.
- Operations: hàng chờ, tiếp nhận, báo giá, phân công, cập nhật trạng thái.
- Authorization: khách không truy cập màn nhân viên/quản trị; kỹ thuật viên chỉ thấy việc được giao.
