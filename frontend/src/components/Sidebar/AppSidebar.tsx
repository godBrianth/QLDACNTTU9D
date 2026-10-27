import { CalendarDays, ClipboardList, Home, Users, Wrench } from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { getRoleLabel } from "./roles"
import { User } from "./User"

const baseItems: Item[] = [
  { icon: Home, title: "Tổng quan", path: "/app" },
  { icon: CalendarDays, title: "Lịch hẹn của tôi", path: "/appointments" },
  { icon: ClipboardList, title: "Báo giá", path: "/quotes" },
]

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  const isStaff =
    currentUser?.is_superuser ||
    ["admin", "manager", "staff", "technician"].includes(
      currentUser?.role ?? "",
    )
  const items: Item[] = [...baseItems]
  if (isStaff)
    items.push(
      { icon: Home, title: "Trung tâm tiếp nhận", path: "/workspace" },
      {
        icon: CalendarDays,
        title: "Quản lý lịch hẹn",
        path: "/workspace/appointments",
      },
      { icon: ClipboardList, title: "Hàng chờ", path: "/workspace/queue" },
      {
        icon: ClipboardList,
        title: "Tiếp nhận thiết bị",
        path: "/workspace/intake",
      },
      {
        icon: Wrench,
        title: "Phiếu sửa & công việc",
        path: "/workspace/repairs",
      },
      { icon: Users, title: "Khách hàng", path: "/workspace/customers" },
      {
        icon: Wrench,
        title: "Kỹ thuật viên & ca làm",
        path: "/workspace/technicians",
      },
    )
  if (currentUser?.is_superuser)
    items.push({ icon: Users, title: "Quản trị tài khoản", path: "/admin" })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main
          items={items}
          label={getRoleLabel(currentUser?.role, currentUser?.is_superuser)}
        />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
