import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CalendarClock,
  ClipboardCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react"

import { PublicLayout } from "@/components/Common/PublicLayout"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  component: PublicHome,
  head: () => ({
    meta: [
      {
        title: "FixCare | Sửa chữa điện thoại minh bạch",
      },
    ],
  }),
})

const highlights = [
  {
    icon: CalendarClock,
    title: "Đặt lịch thuận tiện",
    description:
      "Chủ động chọn thời gian phù hợp khi tính năng đặt lịch sẵn sàng.",
  },
  {
    icon: ClipboardCheck,
    title: "Theo dõi rõ ràng",
    description:
      "Thông tin tiếp nhận và tiến độ sửa chữa được quản lý có hệ thống.",
  },
  {
    icon: ShieldCheck,
    title: "Phân quyền an toàn",
    description:
      "Mỗi người dùng chỉ thấy khu vực phù hợp với quyền đã được xác minh.",
  },
]

function PublicHome() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Quản lý sửa chữa điện thoại
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Gửi gắm thiết bị, theo dõi sửa chữa thật rõ ràng.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            FixCare là hệ thống hỗ trợ khách hàng, nhân viên và kỹ thuật viên
            phối hợp trong quy trình sửa chữa điện thoại.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/signup">Tạo tài khoản</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Đăng nhập</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="highlights-heading"
        className="border-y bg-muted/40"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 id="highlights-heading" className="text-2xl font-bold">
              Một quy trình sửa chữa dễ hiểu
            </h2>
            <p className="mt-2 text-muted-foreground">
              Giao diện được xây dựng để từng vai trò tập trung vào việc cần
              làm.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <Icon aria-hidden="true" className="size-6 text-primary" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-3">
            <Wrench aria-hidden="true" className="mt-1 size-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Sẵn sàng sử dụng FixCare?</h2>
              <p className="mt-1 text-muted-foreground">
                Đăng nhập để vào khu vực làm việc của tài khoản đã được cấp.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/login">Đăng nhập</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
