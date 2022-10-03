import { MantineProvider } from "@mantine/core"
import { NotificationsProvider } from "@mantine/notifications"
import * as ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import Home from "./Home"

const root = ReactDOM.createRoot(document.getElementById("app"))


root.render(
    <MantineProvider withGlobalStyles withNormalizeCSS>
        <NotificationsProvider>
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        </NotificationsProvider>
    </MantineProvider>
)
