import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { AppointmentsService } from "@/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getApiErrorMessage } from "@/utils"

export const Route = createFileRoute("/_layout/appointments/")({
  component: MyAppointments,
})

function MyAppointments() {
  const appointments = useQuery({
    queryKey: ["my-appointments"],
    queryFn: async () => (await AppointmentsService.readMyAppointments()).data,
  })
  if (appointments.isLoading) return <p>Đang tải lịch hẹn...</p>
  if (appointments.error)
    return <p role="alert">{getApiErrorMessage(appointments.error)}</p>
  return (
    <section>
      <h1>Lịch hẹn của tôi</h1>
      {appointments.data?.data.length === 0 ? (
        <Card>
          <CardContent>Bạn chưa có lịch hẹn nào.</CardContent>
        </Card>
      ) : (
        appointments.data?.data.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent>
              <p>{appointment.appointment_number}</p>
              <Link
                to="/appointments/$appointmentId"
                params={{ appointmentId: appointment.id }}
              >
                <Button variant="outline">Xem chi tiết</Button>
              </Link>
            </CardContent>
          </Card>
        ))
      )}
    </section>
  )
}
