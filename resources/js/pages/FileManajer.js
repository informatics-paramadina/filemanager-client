import { Anchor, Avatar, Box, Breadcrumbs, Button, Center, Divider, Group, Image, Loader, LoadingOverlay, Modal, NavLink, Paper, Stack, Text, TextInput } from "@mantine/core"
import { showNotification } from "@mantine/notifications"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { useCookies } from "react-cookie"
import { AiFillFolderOpen } from "react-icons/ai"
import { FcLock, FcFolder, FcDownload, FcInfo } from "react-icons/fc"
import { useNavigate } from "react-router-dom"
import { X } from "tabler-icons-react"
import IconGenerator from "../components/IconGenerator"
import { api_url, base_url } from "../constant/api_url"
import logo from "../images/logohimti.png"

const ContextMenu = ({ pageX, pageY, setPosition, show }) => {
    const ref = useRef()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!ref.current?.contains(event.target)) {
                setPosition({
                    pageX: 0,
                    pageY: 0,
                    show: false
                });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
    }, [ref])

    return (
        <Paper ref={ref} sx={{ width: 240, top: !show ? -100 : pageY, left: !show ? -100 : pageX, position: "absolute", zIndex: 2, }} withBorder>
            <NavLink onClick={() => console.log("wow")} label="info" icon={<FcInfo />} />
            <NavLink label="download" icon={<FcDownload />} />
        </Paper>
    )
}

const ModalPassword = ({ data, open, setOpen, submit }) => {
    const [pass, setPass] = useState('')

    useEffect(() => {
        if (!open) return
        console.log(data)
    }, [open])

    const onSubmit = () => {
        submit(data, pass)
    }

    return (
        <Modal
            opened={open}
            onClose={() => setOpen(!open)}
            title="Protected Folder"
        >
            <Stack>
                <TextInput value={pass} onChange={(ev) => setPass(ev.target.value)} label="Password" />
                <Group position="right">
                    <Button onClick={onSubmit}>Submit</Button>
                </Group>
            </Stack>
        </Modal>
    )
}

const FilesBox = ({ mime_type, filename, focus, onClick, onDoubleClick,
    isPrivate, isRootFolder, isFromMe, setPosition }) => {

    const onContextMenuClick = (e) => {
        e.preventDefault()
        setPosition({
            pageX: e.pageX,
            pageY: e.pageY,
            show: true
        })
    }

    if (isRootFolder && isFromMe) {
        return (
            <Box onBlur={() => setPosition({ pageX: 0, pageY: 0, show: false })} onContextMenu={onContextMenuClick} p={"sm"} onClick={onClick} onDoubleClick={onDoubleClick} style={{ width: '150px', lineBreak: 'auto', border: focus ? '1px dashed black' : '', borderRadius: '10px' }}>
                <Stack spacing={0} align="center">
                    <Box>
                        {<IconGenerator mime_type={mime_type} size={70} />}
                        {isPrivate == true && <>
                            <FcLock />
                        </>}
                    </Box>
                    <Text align="center">"Your Private Folder"</Text>
                </Stack>
            </Box>
        )
    }

    if (!isRootFolder && (!isPrivate || isPrivate)) {
        return (
            <Box onFocus={() => console.log("cheeck")} onContextMenu={onContextMenuClick} p={"sm"} onClick={onClick} onDoubleClick={onDoubleClick} style={{ width: '150px', lineBreak: 'auto', border: focus ? '1px dashed black' : '', borderRadius: '10px' }}>
                <Stack spacing={0} align="center">
                    <Box>
                        {<IconGenerator mime_type={mime_type} size={70} />}
                        {isPrivate == true && <>
                            <FcLock />
                        </>}
                    </Box>
                    <Text align="center">{filename}</Text>
                </Stack>
            </Box>
        )
    }


}

const FileManager = () => {
    const [token, setToken] = useState('')
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(-1)
    const [modalOpen, setModalOpen] = useState(false)
    const [profile, setProfile] = useState({})
    const [position, setPosition] = useState({
        pageX: 0,
        pageY: 0,
        show: false,
    })
    const [historyPath, setHistoryPath] = useState([{
        path: '/',
        name: 'Home',
        pass: ''
    }])
    const navigate = useNavigate()

    // useEffect(()=>{
    //     console.log(historyPath)
    // }, [historyPath])

    useEffect(() => {
        // document.addEventListener('contextmenu', (ev) =>{
        //     ev.preventDefault()
        //     console.log(ev.pageX, ev.pageY)
        // })
        axios.get(`${base_url}/getJwt`).then((res) => {
            if (!res.data.token) {
                return navigate('/')
            }
            console.log(res.data.token)
            setToken(res.data?.token)
        }).catch((err) => {
            console.log(err.response)
        })
    }, [])

    useEffect(() => {
        if (!token) return
        setLoading(true)
        axios.get(`${api_url}/files`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then((res) => {
            console.log(res.data)
            setFiles(res.data)
            setLoading(false)
        }).catch((err) => {

            if (err?.response?.status == 401) {
                return window.location = base_url + "/logout"
            }
            console.log(err.response)
        })

        axios.get(`${api_url}/profile`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then((res) => {
            console.log(res.data)
            setProfile(res.data)
        }).catch((err) => {
            console.log(err.response)
        })
    }, [token])

    const onClickFile = (key) => {
        setSelectedFile(key)
    }

    const onClickAnchor = (pos) => {
        setLoading(true)
        if (historyPath[pos].path == "/") {
            axios.get(`${api_url}/files`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }).then((res) => {
                console.log(res.data)
                setFiles(res.data)
                setLoading(false)
                let newHistoryPath = historyPath.slice(0, pos + 1)
                setHistoryPath(newHistoryPath)
            }).catch((err) => {

                console.log(err.response)
            })
        } else {
            axios.get(`${api_url}/files/${historyPath[pos].path}`, {
                params: {
                    "password": historyPath[pos].pass
                },
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }).then((res) => {
                console.log(res.data)
                setFiles(res.data?.children)
                setLoading(false)
                let newHistoryPath = historyPath.slice(0, pos + 1)
                setHistoryPath(newHistoryPath)
            }).catch((err) => {
                console.log(err.response)
                showNotification({
                    title: 'Unauthorized',
                    message: err.response?.data?.message,
                    color: 'red',
                    icon: <X />
                })
            })
        }
    }

    const onOpenFolderProtected = (data, password) => {
        setModalOpen(false)
        setLoading(true)
        axios.get(`${api_url}/files/${data.id}`, {
            params: {
                "password": password
            },
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then((res) => {
            setFiles(res.data?.children)
            const newPath = historyPath.slice()
            newPath.push({
                path: data.id,
                name: data.filename,
                pass: password
            })
            setLoading(false)
            setHistoryPath(newPath)
        }).catch((err) => {
            setLoading(false)
            console.log(err)
            showNotification({
                title: 'Unauthorized',
                message: err.response?.data?.message,
                color: 'red',
                icon: <X />
            })
        })
    }

    const onOpenFolder = (data) => {
        if (data?.is_private && data?.have_password && !data?.is_from_me) {
            setModalOpen(true)
            return
        }
        setLoading(true)
        axios.get(`${api_url}/files/${data.id}`, {
            params: {
                "password": data.parent_have_password ? historyPath[historyPath.length - 1].pass : ''
            },
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then((res) => {
            console.log(res.data)
            setFiles(res.data?.children)
            const newPath = historyPath.slice()
            newPath.push({
                path: data.id,
                name: data.filename,
                pass: ''
            })
            setLoading(false)
            setHistoryPath(newPath)
        }).catch((err) => {
            setLoading(false)
            console.log(err.response)
            showNotification({
                title: 'Unauthorized',
                message: err.response?.data?.message,
                color: 'red',
                icon: <X />
            })
        })
    }

    return (
        <Box>
            <ContextMenu pageX={position.pageX} pageY={position.pageY} setPosition={setPosition} show={position.show} />
            <ModalPassword data={files[selectedFile]} setOpen={setModalOpen}
                open={modalOpen} submit={onOpenFolderProtected} />
            <Stack spacing={0}>
                <Box px={"lg"} py={"md"}>
                    <Group position="apart">
                        <Group>
                            <Image src={logo} style={{ width: '100px' }} />
                            <Text weight={"500"} size={24}>File Manager</Text>
                        </Group>
                        <Avatar src={profile?.profile?.avatar} radius={"xl"} />
                    </Group>
                </Box>
                <Paper p={"lg"} mx={"lg"} style={{ position: 'relative' }} withBorder>
                    <Box>
                        <Group position="apart">
                            <Breadcrumbs>
                                {historyPath.map((data, key) => (
                                    <Anchor onClick={() => onClickAnchor(key)} key={key}>
                                        {data.name}
                                    </Anchor>
                                ))}
                            </Breadcrumbs>
                            <Button>Upload</Button>
                        </Group>
                        <Divider my={"sm"} variant="dashed" />
                    </Box>
                    <LoadingOverlay visible={loading} />
                    <Group>
                        {files.map((data, key) => (
                            <FilesBox onClick={() => onClickFile(key)} onDoubleClick={() => onOpenFolder(data)}
                                focus={selectedFile == key} isPrivate={data.is_private}
                                mime_type={data?.mime_type} isRootFolder={data.is_user_root_folder}
                                isFromMe={data?.is_from_me}
                                setPosition={setPosition}
                                key={key} filename={data?.filename} />
                        ))}
                    </Group>
                </Paper>
            </Stack>
        </Box >
    )
}

export default FileManager
