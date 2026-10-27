import { expect, type Page, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })
const id = "22222222-2222-4222-8222-222222222222"
const technicianId = "33333333-3333-4333-8333-333333333333"

async function mockSystem(page: Page, role = "staff") {
  await page.addInitScript(() =>
    localStorage.setItem("access_token", "isolated-test-session"),
  )
  const appointment = {
    id,
    appointment_number: "APPT-DEMO",
    appointment_date: "2030-01-15T09:00:00Z",
    status: "PENDING",
    customer: { full_name: "Khách kiểm thử", phone_number: "0900000000" },
    device: { id: technicianId, brand: "Test", model: "Phone" },
    services: [],
    status_history: [],
    total_amount: 100000,
  }
  const quote = {
    id,
    quote_number: "QUO-DEMO",
    appointment_id: id,
    appointment_number: "APPT-DEMO",
    total_amount: 100000,
    status: "SENT",
    device_info: "Test Phone",
    items: [{ id, item_name: "Thay pin", quantity: 1, total_price: 100000 }],
  }
  const invoice = {
    id,
    invoice_number: "INV-DEMO",
    appointment_id: id,
    status: "UNPAID",
    total_amount: 100000,
    paid_amount: 0,
    balance: 100000,
    items: [{ id, item_name: "Thay pin", quantity: 1, total_price: 100000 }],
    payments: [] as {
      id: string
      amount: number
      payment_number: string
      payment_method: string
    }[],
  }
  const notification = {
    id,
    title: "Đã tiếp nhận",
    message: "Thiết bị đã được nhận",
    is_read: false,
  }
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    const method = route.request().method()
    let response: unknown = { data: [], count: 0 }
    if (path === "/api/v1/users/me")
      response = {
        id,
        email: "test@example.test",
        full_name: "Người kiểm thử",
        role,
        is_active: true,
        is_superuser: false,
      }
    else if (
      path === "/api/v1/appointments/history" ||
      path === "/api/v1/appointments/me" ||
      path === "/api/v1/repair-orders"
    )
      response = { data: [appointment], count: 1 }
    else if (
      path === `/api/v1/appointments/${id}/detail` ||
      path === `/api/v1/repair-orders/${id}`
    )
      response = appointment
    else if (path.endsWith("/confirm") && method === "PATCH") {
      appointment.status = "CONFIRMED"
      response = { success: true, data: appointment, message: "Đã xác nhận" }
    } else if (path === "/api/v1/technicians")
      response = {
        data: [
          { id: technicianId, full_name: "Kỹ thuật viên", is_active: true },
        ],
        count: 1,
      }
    else if (path === "/api/v1/quotes") response = { data: [quote], count: 1 }
    else if (path.endsWith("/accept")) {
      quote.status = "ACCEPTED"
      response = { success: true, data: quote }
    } else if (path.endsWith("/reject")) {
      quote.status = "REJECTED"
      response = { success: true, data: quote }
    } else if (path === "/api/v1/invoices")
      response = { data: [invoice], count: 1 }
    else if (path.endsWith("/payments")) {
      const body = route.request().postDataJSON()
      expect(body).toMatchObject({ payment_method: "CASH" })
      expect(body.request_id).toMatch(/^[0-9a-f-]{36}$/)
      invoice.paid_amount = Number(body.amount)
      invoice.balance = 100000 - Number(body.amount)
      invoice.status = invoice.balance === 0 ? "PAID" : "PARTIALLY_PAID"
      invoice.payments.push({
        id,
        amount: Number(body.amount),
        payment_number: "PAY-DEMO",
        payment_method: "CASH",
      })
      response = invoice
    } else if (path === "/api/v1/notifications")
      response = {
        data: [notification],
        count: 1,
        unread_count: notification.is_read ? 0 : 1,
      }
    else if (path.endsWith("/read")) {
      notification.is_read = true
      response = notification
    } else if (path === "/api/v1/statistics")
      response = {
        start_date: "2030-01-01",
        end_date: "2030-01-31",
        receipts_total: 100000,
        outstanding_total: 0,
        appointment_count: 1,
        completed_count: 1,
        customer_count: 1,
        monthly_revenue: [{ month: "2030-01", amount: 100000 }],
      }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(response),
    })
  })
}

test("nhân viên xác nhận lịch và danh sách cập nhật", async ({ page }) => {
  await mockSystem(page)
  await page.goto("/workspace/appointments")
  await page.getByRole("button", { name: /APPT-DEMO/ }).click()
  await page.getByRole("button", { name: "Xác nhận lịch", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Xác nhận", exact: true })
    .click()
  await expect(
    page.getByText("Đã xác nhận", { exact: true }).first(),
  ).toBeVisible()
})

test("kỹ thuật viên mở việc được phân công", async ({ page }) => {
  await mockSystem(page, "technician")
  await page.goto("/workspace/repairs")
  await expect(
    page.getByRole("heading", { name: "Công việc được phân công" }),
  ).toBeVisible()
  await page.getByRole("button", { name: /APPT-DEMO/ }).click()
  await expect(page.getByLabel("Trạng thái mới")).toBeVisible()
})

test("khách hàng bị chặn khỏi khu vực nhân viên", async ({ page }) => {
  await mockSystem(page, "customer")
  await page.goto("/workspace")
  await expect(page).toHaveURL(/\/app$/)
  await expect(
    page.getByRole("link", { name: "Trung tâm tiếp nhận", exact: true }),
  ).toHaveCount(0)
})

test("ghi nhận tiền tại quầy cập nhật hóa đơn", async ({ page }) => {
  await mockSystem(page)
  await page.goto("/invoices")
  await page.getByLabel("Số tiền đã nhận (VNĐ)").fill("100000")
  await page.getByLabel("Phương thức").selectOption("CASH")
  await page
    .getByRole("button", { name: "Ghi nhận thanh toán", exact: true })
    .click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Xác nhận", exact: true })
    .click()
  await expect(page.getByText("Đã thanh toán", { exact: true })).toBeVisible()
  await expect(page.getByText(/PAY-DEMO/)).toBeVisible()
})

test("khách duyệt báo giá và đánh dấu thông báo đã đọc", async ({ page }) => {
  await mockSystem(page, "customer")
  await page.goto("/quotes")
  await page.getByRole("button", { name: "Duyệt báo giá", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Xác nhận", exact: true })
    .click()
  await expect(page.getByText("Đã duyệt", { exact: true })).toBeVisible()
  await page.goto("/notifications")
  await page.getByRole("button", { name: "Đánh dấu đã đọc" }).click()
  await expect(page.getByText("0 thông báo chưa đọc")).toBeVisible()
})

test("báo cáo quản trị lấy doanh thu thực thu và responsive", async ({
  page,
}) => {
  await mockSystem(page, "manager")
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/workspace/reports")
    await expect(
      page.getByRole("heading", { name: "Báo cáo quản trị" }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  }
})
