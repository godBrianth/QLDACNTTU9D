import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { AppointmentsService, ServicesService, SlotsService } from "@/client"
import { PublicLayout } from "@/components/Common/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/utils"

export const Route = createFileRoute("/booking")({ component: BookingPage })

function BookingPage() {
  const [serviceId, setServiceId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [result, setResult] = useState<string>()
  const services = useQuery({ queryKey: ["services"], queryFn: async () => (await ServicesService.readPublicServices()).data })
  const slots = useQuery({
    queryKey: ["slots", serviceId, date],
    enabled: Boolean(serviceId && date),
    queryFn: async () => (await SlotsService.getAvailableSlots({ query: { date, service_id: serviceId } })).data,
  })
  const booking = useMutation({
    mutationFn: () => AppointmentsService.createAppointment({ body: { customer_name: name || undefined, customer_phone: phone, service_id: serviceId, device_brand: brand || undefined, device_model: model || undefined, appointment_date: date, start_time: time } }),
    onSuccess: ({ data }) => setResult(`Đặt lịch thành công. Mã lịch: ${data.appointment_code}`),
  })
  const error = services.error || slots.error || booking.error
  return <PublicLayout><main className="mx-auto max-w-3xl px-4 py-10 sm:py-16"><h1 className="text-3xl font-bold">Đặt lịch sửa chữa</h1><p className="mt-2 text-muted-foreground">Chọn dịch vụ, ngày và giờ phù hợp. Nhân viên sẽ phân công kỹ thuật viên.</p>
    <Card className="mt-8"><CardHeader><CardTitle>Thông tin lịch hẹn</CardTitle></CardHeader><CardContent className="grid gap-5">
      <Field label="Dịch vụ"><select className="h-10 w-full rounded-md border bg-background px-3" value={serviceId} onChange={(e) => { setServiceId(e.target.value); setTime("") }}><option value="">{services.isLoading ? "Đang tải dịch vụ..." : "Chọn dịch vụ"}</option>{services.data?.data.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.estimated_duration_minutes ?? 30} phút</option>)}</select></Field>
      {services.data?.data.length === 0 && <p className="rounded-md border p-3 text-sm text-muted-foreground">Cửa hàng chưa có dịch vụ để đặt lịch.</p>}
      <Field label="Ngày hẹn"><Input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => { setDate(e.target.value); setTime("") }} /></Field>
      <div><Label>Khung giờ trống</Label><div className="mt-2 flex flex-wrap gap-2">{slots.isLoading && <span className="text-sm text-muted-foreground">Đang tải khung giờ...</span>}{slots.data?.available_slots.map((slot) => <Button key={slot.start_time} type="button" variant={time === slot.start_time ? "default" : "outline"} disabled={!slot.available} onClick={() => setTime(slot.start_time)}>{slot.start_time}</Button>)}{slots.data?.available_slots.length === 0 && <span className="text-sm text-muted-foreground">Không còn khung giờ trống.</span>}</div></div>
      <Field label="Số điện thoại"><Input value={phone} onChange={(e) => setPhone(e.target.value)} required /></Field><Field label="Họ tên"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field><Field label="Hãng điện thoại"><Input value={brand} onChange={(e) => setBrand(e.target.value)} /></Field><Field label="Dòng máy"><Input value={model} onChange={(e) => setModel(e.target.value)} /></Field>
      {error && <p role="alert" className="text-sm text-destructive">{getApiErrorMessage(error)}</p>}{result && <p className="rounded-md bg-primary/10 p-3 text-sm">{result}</p>}
      <Button disabled={!serviceId || !date || !time || !phone || booking.isPending} onClick={() => booking.mutate()}>{booking.isPending ? "Đang xác nhận..." : "Xác nhận đặt lịch"}</Button>
    </CardContent></Card></main></PublicLayout>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}</div> }
