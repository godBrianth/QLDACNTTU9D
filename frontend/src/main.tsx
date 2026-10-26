import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { toast } from "sonner"
import { client } from "./client/client.gen"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"
import { routeTree } from "./routeTree.gen"
import { getApiErrorMessage, getApiErrorStatus } from "./utils"

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  auth: () => localStorage.getItem("access_token") || "",
})

let isRedirectingToLogin = false

const redirectToLoginForExpiredSession = (error: unknown): boolean => {
  const hasAccessToken = localStorage.getItem("access_token") !== null
  const isOnLoginPage = window.location.pathname === "/login"

  if (
    getApiErrorStatus(error) !== 401 ||
    !hasAccessToken ||
    isOnLoginPage ||
    isRedirectingToLogin
  ) {
    return false
  }

  isRedirectingToLogin = true
  localStorage.removeItem("access_token")
  window.location.assign("/login")
  return true
}

const showGlobalApiError = (error: unknown) => {
  const status = getApiErrorStatus(error)
  toast.error("Yêu cầu không thành công", {
    description: getApiErrorMessage(error),
    id: `api-error-${status ?? "network"}`,
  })
}

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  const status = getApiErrorStatus(error)
  const nonRetryableStatuses = [401, 403, 404, 422]

  if (status !== undefined && nonRetryableStatuses.includes(status)) {
    return false
  }

  return failureCount < 3
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (!redirectToLoginForExpiredSession(error)) {
        showGlobalApiError(error)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (redirectToLoginForExpiredSession(error)) {
        return
      }

      if (!mutation.options.onError) {
        showGlobalApiError(error)
      }
    },
  }),
})

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
