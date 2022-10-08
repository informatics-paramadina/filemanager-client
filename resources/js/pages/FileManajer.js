import { ActionIcon, Anchor, Avatar, Box, Breadcrumbs, Button, Center, Checkbox, Dialog, Divider, Group, Image, Loader, LoadingOverlay, Menu, Modal, NavLink, Paper, Stack, Table, Text, TextInput } from "@mantine/core"
import { useForm } from "@mantine/form"
import { showNotification, updateNotification } from "@mantine/notifications"
import createUploader, { UPLOADER_EVENTS } from "@rpldy/uploader"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { useCookies } from "react-cookie"
import { useDropzone } from "react-dropzone"
import { AiFillFolderOpen } from "react-icons/ai"
import { FcLock, FcFolder, FcDownload, FcInfo, FcPlus, FcFile, FcFullTrash } from "react-icons/fc"
import { useNavigate } from "react-router-dom"
import { X } from "tabler-icons-react"
import IconGenerator from "../components/IconGenerator"
import { api_url, base_url } from "../constant/api_url"
import logo from "../images/logohimti.png"

const ContextMenu = ({ pageX, pageY, setPosition, show, setInfoOpen, file, onDeleteFile }) => {
    const ref = useRef()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!ref.current?.contains(event.target)) {
                setPosition({
                    pageX: "-1000px",
                    pageY: "-1000px",
                    show: false
                });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
    }, [ref])

    return (
        <Paper ref={ref} sx={{ width: 240, top: pageY, left: pageX, position: "absolute", zIndex: 2, }} withBorder>
            <NavLink onClick={() => setInfoOpen()} label="Info" icon={<FcInfo />} />
            <NavLink label="Download" icon={<FcDownload />} />
            {file?.is_from_me && !file?.is_user_root_folder && <NavLink onClick={onDeleteFile} label="Delete" icon={<FcFullTrash />} />}
        </Paper>
    )
}

const ModalUploader = ({ open, setOpen, jwt, parentId, refreshCurrentFolder }) => {
    const { acceptedFiles, getInputProps, getRootProps } = useDropzone()
    const uploader = createUploader({
        autoUpload: true,
        inputFieldName: "multifiles[]",
        grouped: false,
        concurrent: true,
        destination: {
            url: `${api_url}/files`,
            headers: {
                "Authorization": `Bearer ${jwt} `
            },
            params: {
                "parent_id": parentId ?? ""
            },
            method: 'post'
        }
    })

    uploader.on(UPLOADER_EVENTS.ITEM_START, (item) => {
        showNotification({
            id: item.id,
            title: `Uploading ${item.file.name}`,
            message: "Upload started...",
            autoClose: false,
            disallowClose: true,
        })
        console.log(`item started uploading`, item);
    });
    uploader.on(UPLOADER_EVENTS.ITEM_PROGRESS, (item) => {
        updateNotification({
            id: item.id,
            title: `Uploading ${item.file.name}`,
            message: `Progress ${item.completed.toFixed(0)}%`,
            autoClose: false,
            disallowClose: true,

        })
        console.log("progress", item);
    });

    uploader.on(UPLOADER_EVENTS.ITEM_FINISH, (item) => {
        updateNotification({
            id: item.id,
            title: `Uploading ${item.file.name}`,
            message: `Success upload`,
            autoClose: 2000,
            color: 'green'
        })
        refreshCurrentFolder()
    })
    // uploader.on(UPLOADER_EVENTS.BATCH_PROGRESS, (item) => {
    //     console.log("progress batch", item);
    // })

    useEffect(() => {

    }, [])

    useEffect(() => {
        console.log(acceptedFiles)
        uploader.add(acceptedFiles)
    }, [acceptedFiles])

    return (
        <Modal
            opened={open}
            onClose={() => setOpen(!open)}
            closeOnClickOutside={false}
            title="Upload File">
            <Paper p={"md"} m={"md"} withBorder radius={"lg"} {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <Text>Upload Here</Text>
            </Paper>
        </Modal>
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

const FilesBox = ({ file, focus, setPosition, onClick, onDoubleClick }) => {

    const onContextMenuClick = (e) => {
        e.preventDefault()
        onClick()
        setPosition({
            pageX: e.pageX,
            pageY: e.pageY,
            show: true
        })
    }

    if (file.is_user_root_folder && file.is_from_me) {
        return (
            <Box onContextMenu={onContextMenuClick} p={"sm"}
                onClick={onClick} onDoubleClick={onDoubleClick} style={{ width: '150px', lineBreak: 'auto', border: focus ? '1px dashed black' : '', borderRadius: '10px' }}>
                <Stack spacing={0} align="center">
                    <Box>
                        {<IconGenerator mime_type={file.mime_type} size={70} />}
                        {file.is_private == true && <>
                            <FcLock />
                        </>}
                    </Box>
                    <Text align="center">"Your Private Folder"</Text>
                </Stack>
            </Box>
        )
    }

    if (!file.is_user_root_folder && (!file.is_private || file.is_private)) {
        return (
            <Box onContextMenu={onContextMenuClick} p={"sm"}
                onClick={onClick} onDoubleClick={onDoubleClick} style={{ width: '150px', lineBreak: 'auto', border: focus ? '1px dashed black' : '', borderRadius: '10px' }}>
                <Stack spacing={0} align="center">
                    <Box>
                        {<IconGenerator mime_type={file.mime_type} size={70} />}
                        {file.is_private == true && <>
                            <FcLock />
                        </>}
                    </Box>
                    <Text align="center">{file.filename}</Text>
                </Stack>
            </Box>
        )
    }


}

const DialogFolder = ({ open, setOpen, fileId, jwt, refreshCurrentFolder }) => {
    const [loading, setLoading] = useState(false)
    const form = useForm({
        initialValues: {
            'parent_id': fileId,
            'folder_name': '',
            'description': '',
            'is_private': false,
            'password': ''
        }
    })

    useEffect(() => {
        form.setFieldValue('parent_id', fileId)
    }, [fileId])

    const onSubmit = () => {
        console.log(form.values)
        setLoading(true)
        axios.post(`${api_url}/files`, form.values, {
            headers: {
                "Authorization": `Bearer ${jwt}`
            }
        }).then((res) => {
            setOpen(!open)
            form.setFieldValue('description', '')
            form.setFieldValue('folder_name', '')
            form.setFieldValue('password', '')
            form.setFieldValue('is_private', false)
            setLoading(false)
            console.log(res.data)
            showNotification({
                title: 'Success created folder'
            })
        }).catch((err) => {
            setLoading(false)
            console.log(err)
            showNotification({
                title: 'failed create folder',
                color: 'red'
            })
        }).finally(() => {
            refreshCurrentFolder()
        })
    }

    return (
        <Dialog opened={open} withCloseButton onClose={() => setOpen(!open)} size="lg" radius={"md"} >
            <Stack spacing={"sm"}>
                <TextInput label="Folder Name" {...form.getInputProps('folder_name')} />
                <TextInput label="Description" {...form.getInputProps('description')} />
                {form.values.is_private && (
                    <TextInput label="Password" type={"password"} {...form.getInputProps('password')} />
                )}
                <Group position="apart">
                    <Checkbox label="Is private?" {...form.getInputProps('is_private')} />
                    <Button onClick={onSubmit} loading={loading}>Save</Button>
                </Group>

            </Stack>
        </Dialog>
    )
}

const InfoFile = ({ open, setOpen, file }) => {


    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }


    useEffect(() => {
        console.log("ini file", file)
    }, [file])

    return (
        <Modal
            opened={open}
            onClose={() => setOpen(!open)}
            title="Informasi File">
            <Table striped withBorder>
                <tbody>
                    <tr>
                        <td><Text weight={"500"}>File Name</Text></td>
                        <td>{file?.filename}</td>
                    </tr>
                    <tr>
                        <td><Text weight={"500"}>Description</Text></td>
                        <td>{file?.description}</td>
                    </tr>
                    <tr>
                        <td><Text weight={"500"}>File Type</Text></td>
                        <td>{file?.mime_type}</td>
                    </tr>
                    <tr>
                        <td><Text weight={"500"}>Size</Text></td>
                        <td>{formatBytes(file?.size)}</td>
                    </tr>
                    <tr>
                        <td><Text weight={"500"}>Owner</Text></td>
                        <td>
                            <Group>
                                <Avatar src={file?.owner?.profile?.avatar} radius="xl" />
                                <Text>{file?.owner?.profile?.name}</Text>
                            </Group>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </Modal>
    )
}

const FileManager = () => {
    const [token, setToken] = useState('')
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(-1)
    const [modalOpen, setModalOpen] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [infoOpen, setInfoOpen] = useState(false)
    const [uploadOpen, setUploadOpen] = useState(false)
    const [profile, setProfile] = useState({})
    const [position, setPosition] = useState({
        pageX: "-1000px",
        pageY: "-1000px",
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

    const refreshCurrentFolder = () => {
        setLoading(true)
        console.log
        if (historyPath[historyPath.length - 1].path == "/") {
            axios.get(`${api_url}/files`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }).then((res) => {
                console.log(res.data)
                setFiles(res.data)
                setLoading(false)
                // let newHistoryPath = historyPath.slice(0, pos + 1)
                // setHistoryPath(newHistoryPath)
            }).catch((err) => {

                console.log(err.response)
            })
        } else {
            axios.get(`${api_url}/files/${historyPath[historyPath.length - 1].path}`, {
                params: {
                    "password": historyPath[historyPath.length - 1]?.pass ?? ''
                },
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }).then((res) => {
                setFiles(res.data?.children)
                setLoading(false)
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
    }

    const onDeleteFile = () => {
        axios.post(`${api_url}/files/${files[selectedFile]?.id}`, {
            "_method": "DELETE"
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then((res) => {
            refreshCurrentFolder()
            showNotification({
                title: 'Success Delete',
                message: 'file success deleted '
            })
        }).catch((err) => {
            console.log(err.response)
            showNotification({
                title: 'Error',
                message: 'error occured'
            })
        })
    }

    const onOpenFolder = (data) => {
        if (data?.is_private && data?.have_password && !data?.is_from_me) {
            setModalOpen(true)
            return
        }

        if (data?.mime_type != "directory") {
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
            <InfoFile file={files[selectedFile]} open={infoOpen} setOpen={setInfoOpen} />
            <ModalUploader open={uploadOpen} setOpen={setUploadOpen}
                jwt={token} parentId={historyPath[historyPath.length - 1]?.path == "/" ? null : historyPath[historyPath.length - 1]?.path}
                refreshCurrentFolder={refreshCurrentFolder} />
            <DialogFolder open={dialogOpen} setOpen={setDialogOpen}
                jwt={token} fileId={historyPath[historyPath.length - 1]?.path == "/" ? null : historyPath[historyPath.length - 1]?.path}
                refreshCurrentFolder={refreshCurrentFolder} />
            <ContextMenu pageX={position.pageX} pageY={position.pageY}
                setPosition={setPosition} show={position.show} setInfoOpen={() => setInfoOpen(!infoOpen)}
                file={files[selectedFile]} onDeleteFile={onDeleteFile} />
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
                            <Menu position="left-end" shadow="md" width={200}>
                                <Menu.Target>
                                    <ActionIcon><FcPlus size={30} /></ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Item onClick={() => setDialogOpen(true)} icon={<FcFolder />}>New Folder</Menu.Item>
                                    <Menu.Item onClick={() => setUploadOpen(true)} icon={<FcFile />}>Upload File</Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>
                        <Divider my={"sm"} variant="dashed" />
                    </Box>
                    <LoadingOverlay visible={loading} />
                    <Group>
                        {files.map((data, key) => (
                            <FilesBox onClick={() => onClickFile(key)} onDoubleClick={() => onOpenFolder(data)}
                                focus={selectedFile == key} isPrivate={data.is_private}
                                file={data}
                                onClickFile={onClickFile}
                                setPosition={setPosition}
                                key={key} />
                        ))}
                    </Group>
                </Paper>
            </Stack>
        </Box >
    )
}

export default FileManager
