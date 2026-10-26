import { createFileRoute } from "@tanstack/react-router"
import { LayoutDashboard, ShieldCheck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/app")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Khu vực làm việc | FixCare",
      },
    ],
  }),
})

function Dashboard() {
  const { user: currentUser } = useAuth()
  const displayName = currentUser?.full_name || currentUser?.email || "bạn"

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-primary">FixCare</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Xin chào, {displayName}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Đây là khu vực làm việc an toàn của bạn trong hệ thống sửa chữa điện
          thoại.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <LayoutDashboard aria-hidden="true" className="size-5" />
          </span>
          <CardTitle>Không gian làm việc đang được hoàn thiện</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Các chức năng nghiệp vụ như đặt lịch, hàng chờ và báo giá sẽ chỉ xuất
          hiện trong điều hướng khi đã được triển khai và kiểm thử.
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p>
          Quyền truy cập của bạn được Backend xác minh. Việc ẩn mục điều hướng
          chỉ giúp giao diện gọn hơn, không thay thế kiểm soát quyền ở máy chủ.
        </p>
      </div>
    </div>
  )
}
