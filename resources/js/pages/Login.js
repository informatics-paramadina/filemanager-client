import { Box, Button, Center, Group, Image, Stack, Text } from "@mantine/core"
import { useInterval } from "@mantine/hooks"
import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { BrandGoogle, Check } from "tabler-icons-react"
import logo from "../images/logohimti.png"

const Login = () => {
    const [cookies] = useCookies(['token'])
    const [isLogged, setIsLogged] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const interval = useInterval(() => setCountdown((s) => s - 1), 1000)
    const navigate = useNavigate()

    useEffect(() => {
        if (countdown == 0) {
            navigate('/f')
            interval.stop()
        }
    }, [countdown])

    useEffect(() => {
        if (cookies['token']) {
            setIsLogged(true)
            interval.start()
        }

    }, [])

    const redirectLogin = () => {
        window.location.href = "https://filemanager-engine.org/api/user/google/redirect?redirect_url=https://filemanager-client.org/"
        return
    }

    return (
        <Center style={{ height: '100vh' }}>
            <Box style={{ maxWidth: '50%' }}>
                <Group position="center">
                    <Image src={logo} my={"lg"} width="200px" />
                </Group>
                <Group position="center">
                    {!isLogged && <Button onClick={redirectLogin} leftIcon={<BrandGoogle />}>Login to filemanager HIMTI</Button>}
                    {isLogged && (
                        <Group>
                            <Check />
                            <Text weight={"500"}>Login success, redirect in {countdown}</Text>
                        </Group>
                    )}
                </Group>
            </Box>
        </Center>
    )
}

export default Login
