import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { TechniciansService, WorkSchedulesService } from "@/client"
import {
  ActionForm,
  DataState,
  Pager,
  PageTitle,
  Panel,
  Status,
} from "@/components/Operations/shared"
import { Input } from "@/components/ui/input"
import useAuth from "@/hooks/useAuth"
export const Route = createFileRoute("/_layout/workspace/technicians")({
  component: Technicians,
})
function Technicians() {
  const { user } = useAuth()
  const canManage =
    user?.is_superuser || ["admin", "manager"].includes(user?.role ?? "")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState("")
  const list = useQuery({
    queryKey: ["operations", "technicians", q, page],
    queryFn: async () =>
      (
        await TechniciansService.readTechnicians({
          query: { q: q || undefined, limit: 20, skip: page * 20 },
        })
      ).data,
  })
  const schedules = useQuery({
    queryKey: ["operations", "schedules", selected],
    enabled: Boolean(selected),
    queryFn: async () =>
      (
        await WorkSchedulesService.schedulesReadWorkSchedules({
          query: { technician_id: selected, limit: 100 },
        })
      ).data,
  })
  const tech = list.data?.data.find((t) => t.id === selected)
  return (
    <section className="space-y-6">
      <PageTitle
        title="Kỹ thuật viên & ca làm việc"
        description="Nhân sự kỹ thuật, trạng thái hoạt động và lịch có thể nhận sửa."
      />
      <Input
        className="max-w-md"
        aria-label="Tìm kỹ thuật viên"
        value={q}
        placeholder="Tên hoặc chuyên môn"
        onChange={(e) => {
          setQ(e.target.value)
          setPage(0)
        }}
      />
      <DataState
        pending={list.isPending}
        error={list.error}
        empty={!list.data?.count}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {list.data?.data.map((t) => (
            <button
              key={t.id}
              type="button"
              className="rounded-xl border bg-card p-4 text-left hover:border-primary"
              onClick={() => setSelected(t.id)}
            >
              <p className="font-semibold">{t.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {t.specialization || "Chưa ghi chuyên môn"} ·{" "}
                {t.is_active ? "Hoạt động" : "Tạm nghỉ"}
              </p>
            </button>
          ))}
        </div>
      </DataState>
      <Pager page={page} count={list.data?.count ?? 0} setPage={setPage} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {canManage && (
          <Panel title="Thêm kỹ thuật viên">
            <ActionForm
              fields={[
                { name: "full_name", label: "Họ tên", required: true },
                { name: "phone", label: "Số điện thoại" },
                { name: "specialization", label: "Chuyên môn" },
                {
                  name: "user_id",
                  label: "ID tài khoản kỹ thuật viên (nếu đã tạo)",
                },
              ]}
              submitLabel="Tạo kỹ thuật viên"
              onSubmit={(v) =>
                TechniciansService.createTechnician({
                  body: {
                    full_name: v.full_name,
                    phone_number: v.phone || null,
                    specialization: v.specialization || null,
                    user_id: v.user_id || null,
                  },
                })
              }
            />
          </Panel>
        )}
        {tech && (
          <Panel title={`Ca làm việc · ${tech.full_name}`}>
            <DataState
              pending={schedules.isPending}
              error={schedules.error}
              empty={!schedules.data?.count}
            >
              <div className="mb-4 grid gap-2">
                {schedules.data?.data.map((s) => (
                  <div key={s.id} className="rounded-md border p-3">
                    <p>
                      {s.work_date} · {s.start_time}–{s.end_time}{" "}
                      <Status value={s.status ?? "AVAILABLE"} />
                    </p>
                    <ActionForm
                      key={s.id}
                      fields={[
                        {
                          name: "status",
                          label: "Trạng thái ca",
                          required: true,
                          options: ["AVAILABLE", "BUSY", "OFF"].map(
                            (value) => ({ value, label: value }),
                          ),
                        },
                      ]}
                      submitLabel="Cập nhật ca"
                      onSubmit={(v) =>
                        WorkSchedulesService.schedulesUpdateWorkScheduleStatus({
                          path: { schedule_id: s.id },
                          body: { status: v.status },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </DataState>
            <ActionForm
              key={selected}
              fields={[
                {
                  name: "date",
                  label: "Ngày làm việc",
                  type: "date",
                  required: true,
                },
                {
                  name: "start",
                  label: "Bắt đầu",
                  type: "time",
                  required: true,
                },
                {
                  name: "end",
                  label: "Kết thúc",
                  type: "time",
                  required: true,
                },
              ]}
              submitLabel="Thêm ca làm việc"
              onSubmit={(v) =>
                WorkSchedulesService.schedulesCreateWorkSchedule({
                  body: {
                    technician_id: selected,
                    work_date: v.date,
                    start_time: v.start,
                    end_time: v.end,
                    status: "AVAILABLE",
                  },
                })
              }
            />
            {canManage && (
              <div className="mt-5">
                <ActionForm
                  fields={[]}
                  submitLabel={
                    tech.is_active
                      ? "Tạm nghỉ kỹ thuật viên"
                      : "Kích hoạt kỹ thuật viên"
                  }
                  confirm
                  onSubmit={() =>
                    TechniciansService.updateTechnicianStatus({
                      path: { technician_id: tech.id },
                      body: { is_active: !tech.is_active },
                    })
                  }
                />
              </div>
            )}
          </Panel>
        )}
      </div>
    </section>
  )
}
